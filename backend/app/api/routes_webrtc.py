from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, Header, HTTPException, Query, Request
from loguru import logger
from pipecat.transports.smallwebrtc.request_handler import (
    SmallWebRTCPatchRequest,
    SmallWebRTCRequest,
)

from app.core.container import AppServices
from app.pipecat.pipeline import run_bot
from app.services.session_service import SessionError

router = APIRouter(prefix="/api", tags=["webrtc"])

SessionToken = Annotated[str | None, Header(alias="X-Session-Token")]


def services(request: Request) -> AppServices:
    return request.app.state.services


@router.post("/offer")
async def offer(
    payload: SmallWebRTCRequest,
    background_tasks: BackgroundTasks,
    request: Request,
    session_id: str = Query(min_length=1),
    x_session_token: SessionToken = None,
):
    app_services = services(request)
    try:
        await app_services.sessions.authorize(session_id, x_session_token)
    except SessionError as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc

    if not app_services.settings.voice_ready:
        raise HTTPException(
            status_code=503,
            detail=(
                "Voice providers are not configured. Set: "
                + ", ".join(app_services.settings.missing_provider_env)
            ),
        )

    try:
        await app_services.sessions.prepare_connection(session_id)
    except SessionError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc

    async def webrtc_connection_callback(connection):
        background_tasks.add_task(run_bot, connection, session_id, app_services)

    answer = await request.app.state.webrtc_handler.handle_web_request(
        request=payload,
        webrtc_connection_callback=webrtc_connection_callback,
    )
    if not answer:
        raise HTTPException(status_code=400, detail="WebRTC offer could not be processed")
    logger.info("WebRTC offer accepted for session {}", session_id)
    return answer


@router.patch("/offer")
async def ice_candidate(payload: SmallWebRTCPatchRequest, request: Request):
    await request.app.state.webrtc_handler.handle_patch_request(payload)
    return {"status": "ok"}
