from functools import lru_cache
from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

REPO_ROOT = Path(__file__).resolve().parents[3]
BACKEND_ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BACKEND_ROOT / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    app_name: str = "English Speaking Practice"
    environment: str = "development"
    log_level: str = "INFO"

    api_host: str = "0.0.0.0"
    api_port: int = 8000
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    stun_urls: str = "stun:stun.l.google.com:19302"
    turn_urls: str = ""
    turn_username: str = ""
    turn_credential: str = ""

    session_max_seconds: int = 300
    session_time_warning_seconds: int = 60
    session_ttl_seconds: int = 3600
    session_cleanup_interval_seconds: int = 60
    session_rate_limit_per_minute: int = 10

    deepgram_api_key: str = ""
    deepgram_stt_model: str = "nova-3"
    deepgram_language: str = "en-US"
    deepgram_tts_model: str = ""
    deepgram_tts_voice: str = "aura-2-helena-en"

    llm_api_key: str = ""
    llm_base_url: str = ""
    llm_model: str = "gpt-4.1-mini"
    feedback_llm_model: str = ""
    llm_temperature: float = 0.6
    feedback_temperature: float = 0.2
    feedback_timeout_seconds: float = 45.0
    feedback_max_attempts: int = 2
    session_end_feedback_wait_seconds: float = 15.0

    @field_validator("llm_api_key", mode="before")
    @classmethod
    def fallback_openai_key(cls, value: str) -> str:
        import os

        if value:
            return value
        return os.getenv("OPENAI_API_KEY", "")

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def feedback_model(self) -> str:
        return self.feedback_llm_model or self.llm_model

    @property
    def llm_base_url_or_none(self) -> str | None:
        return self.llm_base_url or None

    @property
    def voice_ready(self) -> bool:
        return bool(self.deepgram_api_key and self.llm_api_key)

    @property
    def feedback_ready(self) -> bool:
        return bool(self.llm_api_key)

    @property
    def missing_provider_env(self) -> list[str]:
        missing: list[str] = []
        if not self.deepgram_api_key:
            missing.append("DEEPGRAM_API_KEY")
        if not self.llm_api_key:
            missing.append("LLM_API_KEY")
        return missing


@lru_cache
def get_settings() -> Settings:
    return Settings()
