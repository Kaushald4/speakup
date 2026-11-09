from typing import Any

from aiortc import RTCIceServer

from app.core.config import Settings


def _split_urls(value: str) -> list[str]:
    return [url.strip() for url in value.split(",") if url.strip()]


def ice_server_config(settings: Settings) -> list[dict[str, Any]]:
    servers: list[dict[str, Any]] = []

    stun_urls = _split_urls(settings.stun_urls)
    if stun_urls:
        servers.append({"urls": stun_urls})

    turn_urls = _split_urls(settings.turn_urls)
    if turn_urls:
        turn: dict[str, Any] = {"urls": turn_urls}
        if settings.turn_username:
            turn["username"] = settings.turn_username
        if settings.turn_credential:
            turn["credential"] = settings.turn_credential
        servers.append(turn)

    return servers


def aiortc_ice_servers(settings: Settings) -> list[RTCIceServer]:
    return [
        RTCIceServer(
            urls=server["urls"],
            username=server.get("username"),
            credential=server.get("credential"),
        )
        for server in ice_server_config(settings)
    ]
