from dataclasses import dataclass

from app.agents.feedback_analyzer import FeedbackAnalyzer
from app.core.config import Settings, get_settings
from app.services.event_bus import EventBus
from app.services.rate_limit import RateLimiter
from app.services.session_service import SessionService


@dataclass
class AppServices:
    settings: Settings
    events: EventBus
    feedback: FeedbackAnalyzer
    sessions: SessionService
    rate_limiter: RateLimiter


def build_services(settings: Settings | None = None) -> AppServices:
    resolved = settings or get_settings()
    events = EventBus()
    feedback = FeedbackAnalyzer(resolved)
    sessions = SessionService(resolved, events, feedback)
    limiter = RateLimiter(resolved.session_rate_limit_per_minute)
    return AppServices(
        settings=resolved,
        events=events,
        feedback=feedback,
        sessions=sessions,
        rate_limiter=limiter,
    )
