from fastapi import APIRouter, Request

from app.schemas.api import HealthOut

router = APIRouter(tags=["health"])


@router.get("/api/health", response_model=HealthOut)
async def health(request: Request) -> HealthOut:
    settings = request.app.state.services.settings
    return HealthOut(
        status="ok",
        voice_ready=settings.voice_ready,
        feedback_ready=settings.feedback_ready,
        missing_env=settings.missing_provider_env,
    )
