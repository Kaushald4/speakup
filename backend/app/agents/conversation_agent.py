from pipecat.services.deepgram.stt import DeepgramSTTService
from pipecat.services.deepgram.tts import DeepgramTTSService
from pipecat.services.openai.llm import OpenAILLMService

from app.agents.prompts import build_conversation_system_prompt
from app.core.config import Settings
from app.models.domain import Topic


def build_conversation_llm(settings: Settings, topic: Topic) -> OpenAILLMService:
    if not settings.llm_api_key:
        raise RuntimeError("LLM_API_KEY is not configured")
    return OpenAILLMService(
        api_key=settings.llm_api_key,
        base_url=settings.llm_base_url_or_none,
        settings=OpenAILLMService.Settings(
            model=settings.llm_model,
            temperature=settings.llm_temperature,
            system_instruction=build_conversation_system_prompt(topic),
        ),
    )


def build_stt(settings: Settings) -> DeepgramSTTService:
    if not settings.deepgram_api_key:
        raise RuntimeError("DEEPGRAM_API_KEY is not configured")
    return DeepgramSTTService(
        api_key=settings.deepgram_api_key,
        settings=DeepgramSTTService.Settings(
            model=settings.deepgram_stt_model,
            language=settings.deepgram_language,
        ),
    )


def build_tts(settings: Settings) -> DeepgramTTSService:
    if not settings.deepgram_api_key:
        raise RuntimeError("DEEPGRAM_API_KEY is not configured")
    tts_settings = DeepgramTTSService.Settings(voice=settings.deepgram_tts_voice)
    if settings.deepgram_tts_model:
        tts_settings = DeepgramTTSService.Settings(
            voice=settings.deepgram_tts_voice,
            model=settings.deepgram_tts_model,
        )
    return DeepgramTTSService(
        api_key=settings.deepgram_api_key,
        settings=tts_settings,
    )
