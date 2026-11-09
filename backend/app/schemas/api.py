from datetime import datetime

from pydantic import BaseModel, Field

from app.models.domain import (
    ConversationTurn,
    PracticeSession,
    SessionStatus,
    Speaker,
    Topic,
)
from app.schemas.feedback import TurnFeedback
from app.schemas.report import SessionReport


class TopicOut(BaseModel):
    id: str
    title: str
    description: str
    category: str
    difficulty: str
    duration_minutes: int

    @classmethod
    def from_topic(cls, topic: Topic) -> "TopicOut":
        return cls(
            id=topic.id,
            title=topic.title,
            description=topic.description,
            category=topic.category,
            difficulty=topic.difficulty.value,
            duration_minutes=topic.duration_minutes,
        )


class CreateSessionRequest(BaseModel):
    topic_id: str = Field(min_length=1)


class TurnOut(BaseModel):
    id: str
    turn_number: int
    speaker: Speaker
    transcript: str
    question: str | None
    created_at: datetime
    feedback: TurnFeedback | None

    @classmethod
    def from_turn(cls, turn: ConversationTurn) -> "TurnOut":
        return cls(
            id=turn.id,
            turn_number=turn.turn_number,
            speaker=turn.speaker,
            transcript=turn.transcript,
            question=turn.question,
            created_at=turn.created_at,
            feedback=turn.feedback,
        )


class SessionOut(BaseModel):
    id: str
    topic: TopicOut
    status: SessionStatus
    created_at: datetime
    started_at: datetime | None
    ends_at: datetime | None
    duration_seconds: int | None
    remaining_seconds: int
    max_duration_seconds: int
    turns_count: int
    feedback_count: int
    report_ready: bool
    end_reason: str | None

    @classmethod
    def from_session(cls, session: PracticeSession) -> "SessionOut":
        return cls(
            id=session.id,
            topic=TopicOut.from_topic(session.topic),
            status=session.status,
            created_at=session.created_at,
            started_at=session.started_at,
            ends_at=session.ends_at,
            duration_seconds=session.duration_seconds,
            remaining_seconds=session.remaining_seconds(),
            max_duration_seconds=session.max_duration_seconds,
            turns_count=len(session.turns),
            feedback_count=sum(1 for turn in session.turns if turn.feedback),
            report_ready=session.report is not None,
            end_reason=session.end_reason,
        )


class SessionDetailOut(SessionOut):
    turns: list[TurnOut]
    report: SessionReport | None

    @classmethod
    def from_session(cls, session: PracticeSession) -> "SessionDetailOut":
        base = SessionOut.from_session(session)
        return cls(
            **base.model_dump(),
            turns=[TurnOut.from_turn(turn) for turn in session.turns],
            report=session.report,
        )


class CreateSessionResponse(BaseModel):
    session: SessionDetailOut
    access_token: str
    max_duration_seconds: int


class EndSessionResponse(BaseModel):
    session: SessionOut


class IceServerOut(BaseModel):
    urls: list[str]
    username: str | None = None
    credential: str | None = None


class ConnectResponse(BaseModel):
    session_id: str
    offer_url: str
    max_duration_seconds: int
    remaining_seconds: int
    ice_servers: list[IceServerOut]


class HealthOut(BaseModel):
    status: str
    voice_ready: bool
    feedback_ready: bool
    missing_env: list[str]
