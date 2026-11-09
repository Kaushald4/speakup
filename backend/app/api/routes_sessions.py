import asyncio
import json
from typing import Annotated

from fastapi import APIRouter, Header, HTTPException, Request
from fastapi.responses import StreamingResponse

from app.core.container import AppServices
from app.core.ice import ice_server_config
from app.models.domain import SessionStatus
from app.schemas.api import (
    ConnectResponse,
    CreateSessionRequest,
    CreateSessionResponse,
    EndSessionResponse,
    SessionDetailOut,
    SessionOut,
    TurnOut,
)
from app.schemas.report import SessionReport
from app.services.session_service import (
    ReportNotReadyError,
    SessionError,
)

router = APIRouter(prefix="/api/sessions", tags=["sessions"])

SessionToken = Annotated[str | None, Header(alias="X-Session-Token")]


def services(request: Request) -> AppServices:
    return request.app.state.services


def client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


async def authorized(request: Request, session_id: str, token: str | None):
    return await services(request).sessions.authorize(session_id, token)


@router.post("", response_model=CreateSessionResponse, status_code=201)
async def create_session(
    payload: CreateSessionRequest, request: Request
) -> CreateSessionResponse:
    app_services = services(request)
    if not app_services.rate_limiter.allow(client_ip(request)):
        raise HTTPException(status_code=429, detail="Too many sessions created. Try again shortly.")
    try:
        session = await app_services.sessions.create_session(payload.topic_id)
    except SessionError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return CreateSessionResponse(
        session=SessionDetailOut.from_session(session),
        access_token=session.access_token,
        max_duration_seconds=session.max_duration_seconds,
    )


@router.get("/{session_id}", response_model=SessionDetailOut)
async def get_session(
    session_id: str, request: Request, x_session_token: SessionToken = None
) -> SessionDetailOut:
    await authorized(request, session_id, x_session_token)
    session = await services(request).sessions.get_session(session_id)
    return SessionDetailOut.from_session(session)


@router.post("/{session_id}/connect", response_model=ConnectResponse)
async def connect_session(
    session_id: str, request: Request, x_session_token: SessionToken = None
) -> ConnectResponse:
    app_services = services(request)
    await authorized(request, session_id, x_session_token)
    if not app_services.settings.voice_ready:
        raise HTTPException(
            status_code=503,
            detail=(
                "Voice providers are not configured. Set: "
                + ", ".join(app_services.settings.missing_provider_env)
            ),
        )
    session = await app_services.sessions.prepare_connection(session_id)
    return ConnectResponse(
        session_id=session.id,
        offer_url=f"/api/offer?session_id={session.id}",
        max_duration_seconds=session.max_duration_seconds,
        remaining_seconds=session.remaining_seconds(),
        ice_servers=ice_server_config(app_services.settings),
    )


@router.post("/{session_id}/end", response_model=EndSessionResponse)
async def end_session(
    session_id: str, request: Request, x_session_token: SessionToken = None
) -> EndSessionResponse:
    await authorized(request, session_id, x_session_token)
    session = await services(request).sessions.end_session(session_id, reason="manual")
    return EndSessionResponse(session=SessionOut.from_session(session))


@router.get("/{session_id}/turns", response_model=list[TurnOut])
async def get_turns(
    session_id: str, request: Request, x_session_token: SessionToken = None
) -> list[TurnOut]:
    await authorized(request, session_id, x_session_token)
    session = await services(request).sessions.get_session(session_id)
    return [TurnOut.from_turn(turn) for turn in session.turns]


@router.get("/{session_id}/report", response_model=SessionReport)
async def get_report(
    session_id: str, request: Request, x_session_token: SessionToken = None
) -> SessionReport:
    app_services = services(request)
    await authorized(request, session_id, x_session_token)
    session = await app_services.sessions.get_session(session_id)
    if session.status != SessionStatus.COMPLETED:
        raise HTTPException(status_code=409, detail="Session is still in progress")
    try:
        return await app_services.sessions.get_report(session_id)
    except ReportNotReadyError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@router.get("/{session_id}/events")
async def session_events(
    session_id: str,
    request: Request,
    x_session_token: SessionToken = None,
) -> StreamingResponse:
    app_services = services(request)
    await authorized(request, session_id, x_session_token)
    session = await app_services.sessions.get_session(session_id)
    queue = await app_services.events.subscribe(session_id)

    async def stream():
        try:
            snapshot = {
                "type": "SESSION_STATE",
                "session_id": session_id,
                "session": SessionDetailOut.from_session(session).model_dump(mode="json"),
            }
            yield f"data: {json.dumps(snapshot)}\n\n"
            while True:
                if await request.is_disconnected():
                    break
                try:
                    event = await asyncio.wait_for(queue.get(), timeout=15)
                except asyncio.TimeoutError:
                    yield ": keep-alive\n\n"
                    continue
                yield f"data: {json.dumps(event)}\n\n"
        finally:
            await app_services.events.unsubscribe(session_id, queue)

    return StreamingResponse(
        stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
