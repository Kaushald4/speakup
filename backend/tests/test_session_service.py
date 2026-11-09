import asyncio

import pytest

from app.core.config import Settings
from app.models.domain import SessionStatus
from app.schemas.feedback import BetterExpression, Correction, TurnFeedback
from app.services.event_bus import EventBus
from app.services.session_service import (
    SessionAccessDeniedError,
    SessionService,
)


def make_settings(**overrides) -> Settings:
    values = {
        "deepgram_api_key": "test-deepgram",
        "llm_api_key": "test-llm",
        "session_max_seconds": 300,
        "session_time_warning_seconds": 0,
        "session_end_feedback_wait_seconds": 2,
    }
    values.update(overrides)
    return Settings(_env_file=None, **values)


class FakeAnalyzer:
    def __init__(self, delay: float = 0.0) -> None:
        self.delay = delay
        self.calls: list[tuple[str | None, str]] = []

    async def analyze(self, topic, question, transcript):
        self.calls.append((question, transcript))
        if self.delay:
            await asyncio.sleep(self.delay)
        return TurnFeedback(
            grammar_score=80,
            vocabulary_score=82,
            sentence_structure_score=78,
            fluency_score=76,
            communication_score=85,
            corrections=[
                Correction(
                    original="I am working here since two years.",
                    corrected="I have been working here for two years.",
                    explanation="Use present perfect continuous with 'for'.",
                )
            ],
            better_expressions=[
                BetterExpression(
                    original="I do backend work.",
                    suggestion="I primarily focus on backend development.",
                )
            ],
            positive_feedback=["Your answer was relevant to the question."],
            improvement_tips=["Practise the present perfect continuous tense."],
        )


async def build_service(settings: Settings | None = None, analyzer=None):
    settings = settings or make_settings()
    events = EventBus()
    analyzer = analyzer or FakeAnalyzer()
    return SessionService(settings, events, analyzer), events, analyzer


async def wait_for_feedback(session, turn_id: str, timeout: float = 2.0):
    deadline = asyncio.get_running_loop().time() + timeout
    while asyncio.get_running_loop().time() < deadline:
        turn = next((item for item in session.turns if item.id == turn_id), None)
        if turn and turn.feedback:
            return turn
        await asyncio.sleep(0.01)
    raise AssertionError("feedback was not attached")


async def test_session_lifecycle_and_timer():
    service, _, _ = await build_service(make_settings(session_max_seconds=30))
    session = await service.create_session("travel")
    assert session.status == SessionStatus.CREATED

    await service.prepare_connection(session.id)
    assert session.status == SessionStatus.CONNECTING

    await service.mark_connected(session.id)
    assert session.status == SessionStatus.ACTIVE
    assert session.started_at is not None
    assert 28 <= session.remaining_seconds() <= 30

    ended = await service.end_session(session.id, reason="manual")
    assert ended.status == SessionStatus.COMPLETED
    assert ended.report is not None
    assert ended.report.overall_score == 0
    assert ended.end_reason == "manual"
    await service.shutdown()


async def test_session_auto_ends_at_time_limit():
    service, _, _ = await build_service(make_settings(session_max_seconds=1))
    session = await service.create_session("hobbies")
    await service.mark_connected(session.id)

    for _ in range(100):
        if session.status == SessionStatus.COMPLETED:
            break
        await asyncio.sleep(0.05)

    assert session.status == SessionStatus.COMPLETED
    assert session.end_reason == "timeout"
    assert session.report is not None
    await service.shutdown()


async def test_feedback_is_associated_with_the_right_turn():
    analyzer = FakeAnalyzer(delay=0.05)
    service, _, _ = await build_service(analyzer=analyzer)
    session = await service.create_session("introduce-yourself")
    await service.mark_connected(session.id)

    await service.add_ai_turn(session.id, "Can you introduce yourself?")
    first = await service.add_user_turn(session.id, "I am a backend developer.")
    assert first is not None
    assert first.question == "Can you introduce yourself?"

    await service.add_ai_turn(session.id, "What do you enjoy about it?")
    second = await service.add_user_turn(session.id, "I like solving problems.")
    assert second is not None
    assert second.question == "What do you enjoy about it?"

    await wait_for_feedback(session, first.id)
    await wait_for_feedback(session, second.id)

    assert first.feedback is not None
    assert second.feedback is not None
    assert first.feedback is not second.feedback
    assert analyzer.calls == [
        ("Can you introduce yourself?", "I am a backend developer."),
        ("What do you enjoy about it?", "I like solving problems."),
    ]

    await service.end_session(session.id)
    assert session.report is not None
    assert session.report.questions_answered == 2
    assert session.report.grammar_mistakes == 2
    assert len(session.report.metrics) == 5
    await service.shutdown()


async def test_end_session_waits_for_pending_feedback():
    analyzer = FakeAnalyzer(delay=0.1)
    service, _, _ = await build_service(analyzer=analyzer)
    session = await service.create_session("technology")
    await service.mark_connected(session.id)
    await service.add_ai_turn(session.id, "How does technology help you?")
    turn = await service.add_user_turn(session.id, "It helps me learn faster.")

    ended = await service.end_session(session.id, reason="manual")
    assert ended.status == SessionStatus.COMPLETED
    assert turn.feedback is not None
    assert ended.report is not None
    assert ended.report.questions_answered == 1
    assert ended.report.overall_score > 0
    await service.shutdown()


async def test_session_token_is_required():
    service, _, _ = await build_service()
    session = await service.create_session("travel")

    with pytest.raises(SessionAccessDeniedError):
        await service.authorize(session.id, "wrong-token")

    authorized = await service.authorize(session.id, session.access_token)
    assert authorized.id == session.id
    await service.shutdown()
