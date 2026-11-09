import asyncio
import json
import re
from typing import Any

from loguru import logger
from openai import AsyncOpenAI

from app.agents.prompts import build_feedback_prompt
from app.core.config import Settings
from app.models.domain import Topic
from app.schemas.feedback import TurnFeedback


class FeedbackError(Exception):
    pass


class FeedbackUnavailableError(FeedbackError):
    pass


def _extract_json(content: str) -> dict[str, Any]:
    text = content.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        start = text.find("{")
        end = text.rfind("}")
        if start == -1 or end == -1 or end <= start:
            raise FeedbackError("Feedback response did not contain JSON")
        return json.loads(text[start : end + 1])


class FeedbackAnalyzer:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._client: AsyncOpenAI | None = None

    def _get_client(self) -> AsyncOpenAI:
        if not self._settings.feedback_ready:
            raise FeedbackUnavailableError("LLM_API_KEY is not configured")
        if self._client is None:
            self._client = AsyncOpenAI(
                api_key=self._settings.llm_api_key,
                base_url=self._settings.llm_base_url_or_none,
                timeout=self._settings.feedback_timeout_seconds,
            )
        return self._client

    async def analyze(self, topic: Topic, question: str | None, transcript: str) -> TurnFeedback:
        client = self._get_client()
        prompt = build_feedback_prompt(topic, question, transcript)
        last_error: Exception | None = None

        for attempt in range(self._settings.feedback_max_attempts):
            try:
                return await self._request(client, prompt)
            except Exception as exc:
                last_error = exc
                logger.warning(
                    "Feedback attempt {}/{} failed: {}",
                    attempt + 1,
                    self._settings.feedback_max_attempts,
                    exc,
                )
                if attempt + 1 < self._settings.feedback_max_attempts:
                    await asyncio.sleep(0.5 * (attempt + 1))

        raise FeedbackError(f"Feedback generation failed: {last_error}")

    async def _request(self, client: AsyncOpenAI, prompt: str) -> TurnFeedback:
        messages = [{"role": "user", "content": prompt}]
        try:
            response = await client.chat.completions.create(
                model=self._settings.feedback_model,
                messages=messages,
                temperature=self._settings.feedback_temperature,
                response_format={"type": "json_object"},
            )
        except Exception as exc:
            if "response_format" not in str(exc).lower():
                raise
            response = await client.chat.completions.create(
                model=self._settings.feedback_model,
                messages=messages,
                temperature=self._settings.feedback_temperature,
            )

        content = response.choices[0].message.content or ""
        payload = _extract_json(content)
        return TurnFeedback.model_validate(payload)
