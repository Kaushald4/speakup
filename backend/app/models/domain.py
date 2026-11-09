from __future__ import annotations

import secrets
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from enum import StrEnum

from app.schemas.feedback import TurnFeedback
from app.schemas.report import SessionReport


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Difficulty(StrEnum):
    BEGINNER = "Beginner"
    INTERMEDIATE = "Intermediate"
    ADVANCED = "Advanced"


class SessionStatus(StrEnum):
    CREATED = "CREATED"
    CONNECTING = "CONNECTING"
    ACTIVE = "ACTIVE"
    COMPLETING = "COMPLETING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class Speaker(StrEnum):
    USER = "USER"
    AI = "AI"


class EventType(StrEnum):
    SESSION_STATE = "SESSION_STATE"
    SESSION_STARTED = "SESSION_STARTED"
    SESSION_TIME_WARNING = "SESSION_TIME_WARNING"
    SESSION_COMPLETED = "SESSION_COMPLETED"
    SESSION_ERROR = "SESSION_ERROR"
    AI_TRANSCRIPT_FINAL = "AI_TRANSCRIPT_FINAL"
    USER_TRANSCRIPT_FINAL = "USER_TRANSCRIPT_FINAL"
    FEEDBACK_READY = "FEEDBACK_READY"
    FEEDBACK_FAILED = "FEEDBACK_FAILED"


@dataclass(slots=True)
class Topic:
    id: str
    title: str
    description: str
    category: str
    difficulty: Difficulty
    duration_minutes: int = 5


@dataclass(slots=True)
class ConversationTurn:
    id: str
    session_id: str
    turn_number: int
    speaker: Speaker
    transcript: str
    created_at: datetime
    question: str | None = None
    feedback: TurnFeedback | None = None


@dataclass(slots=True)
class PracticeSession:
    id: str
    topic: Topic
    access_token: str
    status: SessionStatus
    created_at: datetime
    max_duration_seconds: int
    started_at: datetime | None = None
    ended_at: datetime | None = None
    duration_seconds: int | None = None
    pending_question: str | None = None
    last_error: str | None = None
    turns: list[ConversationTurn] = field(default_factory=list)
    report: SessionReport | None = None
    end_reason: str | None = None

    @property
    def ends_at(self) -> datetime | None:
        if not self.started_at:
            return None
        return self.started_at + timedelta(seconds=self.max_duration_seconds)

    def is_expired(self, now: datetime | None = None) -> bool:
        ends_at = self.ends_at
        return bool(ends_at and (now or utc_now()) >= ends_at)

    def remaining_seconds(self, now: datetime | None = None) -> int:
        ends_at = self.ends_at
        if not ends_at:
            return self.max_duration_seconds
        return max(0, int((ends_at - (now or utc_now())).total_seconds()))


def new_id(prefix: str) -> str:
    return f"{prefix}_{secrets.token_urlsafe(12)}"


def new_access_token() -> str:
    return secrets.token_urlsafe(24)
