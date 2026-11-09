import asyncio
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from loguru import logger
from pipecat.transports.smallwebrtc.request_handler import SmallWebRTCRequestHandler

from app.api import routes_health, routes_sessions, routes_topics, routes_webrtc
from app.core.config import REPO_ROOT, Settings, get_settings
from app.core.container import build_services
from app.services.session_service import (
    ReportNotReadyError,
    SessionAccessDeniedError,
    SessionError,
    SessionNotActiveError,
    SessionNotFoundError,
)

FRONTEND_DIST = REPO_ROOT / "frontend" / "dist"


async def _cleanup_loop(app_services) -> None:
    interval = app_services.settings.session_cleanup_interval_seconds
    while True:
        await asyncio.sleep(interval)
        try:
            await app_services.sessions.cleanup_expired()
        except Exception as exc:
            logger.exception("Session cleanup failed: {}", exc)


def create_app(settings: Settings | None = None) -> FastAPI:
    resolved = settings or get_settings()

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        app_services = build_services(resolved)
        app.state.services = app_services
        app.state.webrtc_handler = SmallWebRTCRequestHandler()
        cleanup_task = asyncio.create_task(_cleanup_loop(app_services))
        if resolved.missing_provider_env:
            logger.warning(
                "Missing provider environment variables: {}",
                ", ".join(resolved.missing_provider_env),
            )
        else:
            logger.info("Voice and feedback providers are configured")
        try:
            yield
        finally:
            cleanup_task.cancel()
            await app_services.sessions.shutdown()
            await app.state.webrtc_handler.close()

    app = FastAPI(title=resolved.app_name, version="0.1.0", lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=resolved.cors_origin_list,
        allow_credentials=False,
        allow_methods=["GET", "POST", "PATCH", "OPTIONS"],
        allow_headers=["Content-Type", "X-Session-Token"],
    )

    @app.exception_handler(SessionNotFoundError)
    async def session_not_found(request: Request, exc: SessionNotFoundError):
        return JSONResponse(status_code=404, content={"detail": "Session not found"})

    @app.exception_handler(SessionAccessDeniedError)
    async def session_denied(request: Request, exc: SessionAccessDeniedError):
        return JSONResponse(status_code=403, content={"detail": "Invalid session token"})

    @app.exception_handler(SessionNotActiveError)
    async def session_inactive(request: Request, exc: SessionNotActiveError):
        return JSONResponse(status_code=409, content={"detail": str(exc)})

    @app.exception_handler(ReportNotReadyError)
    async def report_not_ready(request: Request, exc: ReportNotReadyError):
        return JSONResponse(status_code=409, content={"detail": "Report is not ready"})

    @app.exception_handler(SessionError)
    async def session_error(request: Request, exc: SessionError):
        return JSONResponse(status_code=400, content={"detail": str(exc)})

    app.include_router(routes_health.router)
    app.include_router(routes_topics.router)
    app.include_router(routes_sessions.router)
    app.include_router(routes_webrtc.router)

    if FRONTEND_DIST.exists():
        assets_dir = FRONTEND_DIST / "assets"
        if assets_dir.exists():
            app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

        @app.get("/{full_path:path}", include_in_schema=False)
        async def spa_fallback(full_path: str):
            if full_path == "api" or full_path.startswith("api/"):
                raise HTTPException(status_code=404, detail="Not found")
            candidate = Path(FRONTEND_DIST) / full_path
            if full_path and candidate.is_file():
                return FileResponse(candidate)
            return FileResponse(Path(FRONTEND_DIST) / "index.html")

    return app


app = create_app()
