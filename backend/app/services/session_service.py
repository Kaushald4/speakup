import asyncio
import secrets
from collections.abc import Awaitable, Callable
from datetime import timedelta
from typing import Any

from loguru import logger

from app.agents.feedback_analyzer import FeedbackAnalyzer, FeedbackUnavailableError
from app.core.config import Settings
from app.data.topics import get_topic
from app.models.domain import (
    ConversationTurn,
    EventType,
    PracticeSession,
    SessionStatus,
    Speaker,
    new_access_token,
    new_id,
    utc_now,
)
from app.services.event_bus import EventBus
from app.services.report_builder import build_session_report

CloseCallback = Callable[[], Awaitable[None]]


class SessionError(Exception):
    pass


class SessionNotFoundError(SessionError):
    pass


class SessionAccessDeniedError(SessionError):
    pass


class SessionNotActiveError(SessionError):
    pass


class ReportNotReadyError(SessionError):
    pass


class SessionService:
    def __init__(
        self,
        settings: Settings,
        events: EventBus,
        feedback_analyzer: FeedbackAnalyzer,
    ) -> None:
        self._settings = settings
        self._events = events
        self._feedback = feedback_analyzer
        self._sessions: dict[str, PracticeSession] = {}
        self._lock = asyncio.Lock()
        self._timers: dict[str, asyncio.Task[None]] = {}
        self._end_events: dict[str, asyncio.Event] = {}
        self._close_callbacks: dict[str, CloseCallback] = {}
        self._feedback_tasks: dict[str, set[asyncio.Task[None]]] = {}

    async def create_session(self, topic_id: str) -> PracticeSession:
        topic = get_topic(topic_id)
        if not topic:
            raise SessionError(f"Unknown topic: {topic_id}")
        session = PracticeSession(
            id=new_id("session"),
            topic=topic,
            access_token=new_access_token(),
            status=SessionStatus.CREATED,
            created_at=utc_now(),
            max_duration_seconds=self._settings.session_max_seconds,
        )
        async with self._lock:
            self._sessions[session.id] = session
        logger.info("Created session {} for topic {}", session.id, topic.id)
        return session

    async def authorize(self, session_id: str, token: str | None) -> PracticeSession:
        async with self._lock:
            session = self._sessions.get(session_id)
        if not session:
            raise SessionNotFoundError(session_id)
        if not token or not secrets.compare_digest(token, session.access_token):
            raise SessionAccessDeniedError(session_id)
        return session

    async def get_session(self, session_id: str) -> PracticeSession:
        async with self._lock:
            session = self._sessions.get(session_id)
        if not session:
            raise SessionNotFoundError(session_id)
        if (
            session.status in (SessionStatus.ACTIVE, SessionStatus.CONNECTING)
            and session.is_expired()
        ):
            await self.end_session(session_id, reason="timeout")
        async with self._lock:
            return self._sessions[session_id]

    async def prepare_connection(self, session_id: str) -> PracticeSession:
        async with self._lock:
            session = self._sessions.get(session_id)
            if not session:
                raise SessionNotFoundError(session_id)
            if session.status == SessionStatus.COMPLETED:
                raise SessionNotActiveError("Session already completed")
            if session.status == SessionStatus.ACTIVE and session_id in self._close_callbacks:
                raise SessionNotActiveError("This session already has an active voice connection")
            if session.status == SessionStatus.CREATED:
                session.status = SessionStatus.CONNECTING
            return session

    async def mark_connected(self, session_id: str) -> PracticeSession:
        async with self._lock:
            session = self._sessions.get(session_id)
            if not session:
                raise SessionNotFoundError(session_id)
            if session.status == SessionStatus.COMPLETED:
                raise SessionNotActiveError("Session already completed")
            if session.status == SessionStatus.ACTIVE:
                return session
            session.status = SessionStatus.ACTIVE
            session.started_at = utc_now()
        await self._events.publish(
            session_id,
            {
                "type": EventType.SESSION_STARTED,
                "session_id": session_id,
                "started_at": session.started_at.isoformat() if session.started_at else None,
                "ends_at": session.ends_at.isoformat() if session.ends_at else None,
                "max_duration_seconds": session.max_duration_seconds,
            },
        )
        self._schedule_timer(session_id)
        logger.info("Session {} is active", session_id)
        return session

    async def add_ai_turn(self, session_id: str, text: str) -> ConversationTurn | None:
        text = text.strip()
        if not text:
            return None
        async with self._lock:
            session = self._sessions.get(session_id)
            if not session or session.status != SessionStatus.ACTIVE:
                return None
            turn = ConversationTurn(
                id=new_id("turn"),
                session_id=session_id,
                turn_number=len(session.turns) + 1,
                speaker=Speaker.AI,
                transcript=text,
                created_at=utc_now(),
            )
            session.turns.append(turn)
            session.pending_question = text
        await self._events.publish(
            session_id,
            {
                "type": EventType.AI_TRANSCRIPT_FINAL,
                "session_id": session_id,
                "turn_id": turn.id,
                "text": text,
            },
        )
        return turn

    async def add_user_turn(self, session_id: str, text: str) -> ConversationTurn | None:
        text = text.strip()
        if not text:
            return None
        async with self._lock:
            session = self._sessions.get(session_id)
            if not session or session.status != SessionStatus.ACTIVE:
                return None
            turn = ConversationTurn(
                id=new_id("turn"),
                session_id=session_id,
                turn_number=len(session.turns) + 1,
                speaker=Speaker.USER,
                transcript=text,
                created_at=utc_now(),
                question=session.pending_question,
            )
            session.turns.append(turn)
            session.pending_question = None
            task = asyncio.create_task(
                self._analyze_turn(session_id, turn.id), name=f"feedback-{turn.id}"
            )
            self._feedback_tasks.setdefault(session_id, set()).add(task)

            def _forget(finished: asyncio.Task[None], sid: str = session_id) -> None:
                self._feedback_tasks.get(sid, set()).discard(finished)

            task.add_done_callback(_forget)
        await self._events.publish(
            session_id,
            {
                "type": EventType.USER_TRANSCRIPT_FINAL,
                "session_id": session_id,
                "turn_id": turn.id,
                "text": text,
                "question": turn.question,
            },
        )
        return turn

    async def _analyze_turn(self, session_id: str, turn_id: str) -> None:
        async with self._lock:
            session = self._sessions.get(session_id)
            if not session:
                return
            turn = next((item for item in session.turns if item.id == turn_id), None)
            if not turn:
                return
            topic, question, transcript = session.topic, turn.question, turn.transcript

        try:
            feedback = await self._feedback.analyze(topic, question, transcript)
        except FeedbackUnavailableError as exc:
            logger.warning("Feedback unavailable for turn {}: {}", turn_id, exc)
            await self._events.publish(
                session_id,
                {
                    "type": EventType.FEEDBACK_FAILED,
                    "session_id": session_id,
                    "turn_id": turn_id,
                    "error": "Feedback is unavailable because the LLM provider is not configured.",
                },
            )
            return
        except Exception as exc:
            logger.exception("Feedback generation failed for turn {}: {}", turn_id, exc)
            await self._events.publish(
                session_id,
                {
                    "type": EventType.FEEDBACK_FAILED,
                    "session_id": session_id,
                    "turn_id": turn_id,
                    "error": "Feedback could not be generated for this response.",
                },
            )
            return

        async with self._lock:
            session = self._sessions.get(session_id)
            if not session:
                return
            turn = next((item for item in session.turns if item.id == turn_id), None)
            if not turn:
                return
            turn.feedback = feedback

        await self._events.publish(
            session_id,
            {
                "type": EventType.FEEDBACK_READY,
                "session_id": session_id,
                "turn_id": turn_id,
                "turn_number": turn.turn_number,
                "question": turn.question,
                "transcript": turn.transcript,
                "feedback": feedback.model_dump(mode="json"),
            },
        )

    async def end_session(self, session_id: str, reason: str = "manual") -> PracticeSession:
        close_callback: CloseCallback | None = None
        tasks: list[asyncio.Task[None]] = []
        waiter: asyncio.Event | None = None
        first = False

        async with self._lock:
            session = self._sessions.get(session_id)
            if not session:
                raise SessionNotFoundError(session_id)
            if session.status == SessionStatus.COMPLETED:
                return session

            end_event = self._end_events.setdefault(session_id, asyncio.Event())
            if session.status == SessionStatus.COMPLETING:
                waiter = end_event
            else:
                first = True
                session.status = SessionStatus.COMPLETING
                session.end_reason = reason
                session.ended_at = utc_now()
                if session.started_at:
                    elapsed = int((session.ended_at - session.started_at).total_seconds())
                    session.duration_seconds = min(session.max_duration_seconds, max(0, elapsed))
                else:
                    session.duration_seconds = 0
                close_callback = self._close_callbacks.pop(session_id, None)
                tasks = list(self._feedback_tasks.get(session_id, set()))
                self._cancel_timer(session_id)

        if not first:
            assert waiter is not None
            try:
                await asyncio.wait_for(waiter.wait(), timeout=30)
            except asyncio.TimeoutError:
                pass
            async with self._lock:
                return self._sessions[session_id]

        try:
            if close_callback:
                try:
                    await close_callback()
                except Exception as exc:
                    logger.warning("Error closing session {} connection: {}", session_id, exc)

            if tasks:
                _, pending = await asyncio.wait(
                    tasks, timeout=self._settings.session_end_feedback_wait_seconds
                )
                for task in pending:
                    task.cancel()

            report = build_session_report(session)

            async with self._lock:
                session.report = report
                session.status = SessionStatus.COMPLETED
                session.pending_question = None

            await self._events.publish(
                session_id,
                {
                    "type": EventType.SESSION_COMPLETED,
                    "session_id": session_id,
                    "reason": reason,
                    "report": report.model_dump(mode="json"),
                },
            )
            logger.info(
                "Session {} completed (reason={}, duration={}s, score={})",
                session_id,
                reason,
                session.duration_seconds,
                report.overall_score,
            )
            return session
        finally:
            event = self._end_events.pop(session_id, None)
            if event:
                event.set()
            self._feedback_tasks.pop(session_id, None)

    def register_close_callback(self, session_id: str, callback: CloseCallback) -> None:
        self._close_callbacks[session_id] = callback

    def unregister_close_callback(self, session_id: str) -> None:
        self._close_callbacks.pop(session_id, None)

    async def get_report(self, session_id: str) -> Any:
        async with self._lock:
            session = self._sessions.get(session_id)
            if not session:
                raise SessionNotFoundError(session_id)
            if session.status != SessionStatus.COMPLETED or not session.report:
                raise ReportNotReadyError(session_id)
            return session.report

    async def cleanup_expired(self) -> None:
        now = utc_now()
        async with self._lock:
            expired_active = [
                session.id
                for session in self._sessions.values()
                if session.status in (SessionStatus.ACTIVE, SessionStatus.CONNECTING)
                and session.is_expired(now)
            ]
            abandoned = [
                session.id
                for session in self._sessions.values()
                if session.status == SessionStatus.CREATED
                and now - session.created_at > timedelta(minutes=15)
            ]
            removable = [
                session.id
                for session in self._sessions.values()
                if session.status == SessionStatus.COMPLETED
                and session.ended_at
                and now - session.ended_at > timedelta(seconds=self._settings.session_ttl_seconds)
            ]

        for session_id in expired_active:
            await self.end_session(session_id, reason="timeout")
        for session_id in abandoned:
            await self.end_session(session_id, reason="abandoned")
        if removable:
            async with self._lock:
                for session_id in removable:
                    self._sessions.pop(session_id, None)
                    self._end_events.pop(session_id, None)
            logger.info("Removed {} expired sessions", len(removable))

    async def shutdown(self) -> None:
        async with self._lock:
            timers = list(self._timers.values())
            tasks = [task for group in self._feedback_tasks.values() for task in group]
        for timer in timers:
            timer.cancel()
        for task in tasks:
            task.cancel()

    def _schedule_timer(self, session_id: str) -> None:
        self._cancel_timer(session_id)
        self._timers[session_id] = asyncio.create_task(
            self._run_timer(session_id), name=f"session-timer-{session_id}"
        )

    def _cancel_timer(self, session_id: str) -> None:
        timer = self._timers.pop(session_id, None)
        if timer and timer is not asyncio.current_task():
            timer.cancel()

    async def _run_timer(self, session_id: str) -> None:
        try:
            async with self._lock:
                session = self._sessions.get(session_id)
                if not session:
                    return
                remaining = session.remaining_seconds()
                warning = self._settings.session_time_warning_seconds

            if remaining > warning:
                await asyncio.sleep(remaining - warning)
                await self._events.publish(
                    session_id,
                    {
                        "type": EventType.SESSION_TIME_WARNING,
                        "session_id": session_id,
                        "seconds_remaining": warning,
                    },
                )
                await asyncio.sleep(warning)
            else:
                await asyncio.sleep(remaining)

            await self.end_session(session_id, reason="timeout")
        except asyncio.CancelledError:
            raise
        except Exception as exc:
            logger.exception("Session timer failed for {}: {}", session_id, exc)
