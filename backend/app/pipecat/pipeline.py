import asyncio

from loguru import logger
from pipecat.audio.vad.silero import SileroVADAnalyzer
from pipecat.frames.frames import LLMRunFrame
from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.worker import PipelineParams, PipelineWorker
from pipecat.processors.aggregators.llm_context import LLMContext
from pipecat.processors.aggregators.llm_response_universal import (
    LLMContextAggregatorPair,
    LLMUserAggregatorParams,
)
from pipecat.transports.base_transport import TransportParams
from pipecat.transports.smallwebrtc.connection import SmallWebRTCConnection
from pipecat.transports.smallwebrtc.transport import SmallWebRTCTransport
from pipecat.workers.runner import WorkerRunner

from app.agents.conversation_agent import build_conversation_llm, build_stt, build_tts
from app.agents.prompts import build_initial_developer_message
from app.core.container import AppServices
from app.models.domain import SessionStatus


async def run_bot(
    webrtc_connection: SmallWebRTCConnection,
    session_id: str,
    services: AppServices,
) -> None:
    session = await services.sessions.get_session(session_id)
    if session.status in (SessionStatus.COMPLETED, SessionStatus.COMPLETING):
        logger.info("Skipping bot for finished session {}", session_id)
        return

    topic = session.topic

    transport = SmallWebRTCTransport(
        webrtc_connection=webrtc_connection,
        params=TransportParams(
            audio_in_enabled=True,
            audio_out_enabled=True,
            audio_out_10ms_chunks=2,
        ),
    )

    stt = build_stt(services.settings)
    tts = build_tts(services.settings)
    llm = build_conversation_llm(services.settings, topic)

    context = LLMContext()
    user_aggregator, assistant_aggregator = LLMContextAggregatorPair(
        context,
        user_params=LLMUserAggregatorParams(vad_analyzer=SileroVADAnalyzer()),
    )

    pipeline = Pipeline(
        [
            transport.input(),
            stt,
            user_aggregator,
            llm,
            tts,
            transport.output(),
            assistant_aggregator,
        ]
    )

    worker = PipelineWorker(
        pipeline,
        params=PipelineParams(enable_metrics=True, enable_usage_metrics=True),
    )

    runner = WorkerRunner(handle_sigint=False)
    await runner.add_workers(worker)

    @user_aggregator.event_handler("on_user_turn_stopped")
    async def on_user_turn_stopped(aggregator, strategy, message):
        await services.sessions.add_user_turn(session_id, message.content or "")

    @assistant_aggregator.event_handler("on_assistant_turn_stopped")
    async def on_assistant_turn_stopped(aggregator, message):
        await services.sessions.add_ai_turn(session_id, message.content or "")

    @transport.event_handler("on_client_connected")
    async def on_client_connected(transport, client):
        logger.info("Voice client connected for session {}", session_id)
        await services.sessions.mark_connected(session_id)
        context.add_message(
            {"role": "developer", "content": build_initial_developer_message(topic)}
        )
        await worker.queue_frames([LLMRunFrame()])

    @transport.event_handler("on_client_disconnected")
    async def on_client_disconnected(transport, client):
        logger.info("Voice client disconnected for session {}", session_id)
        services.sessions.unregister_close_callback(session_id)
        await services.sessions.end_session(session_id, reason="disconnected")
        await runner.cancel()

    services.sessions.register_close_callback(session_id, runner.cancel)

    try:
        await runner.run()
    except asyncio.CancelledError:
        logger.info("Voice pipeline cancelled for session {}", session_id)
    finally:
        services.sessions.unregister_close_callback(session_id)
        try:
            latest = await services.sessions.get_session(session_id)
        except Exception:
            latest = None
        if latest and latest.status not in (SessionStatus.COMPLETED, SessionStatus.COMPLETING):
            await services.sessions.end_session(session_id, reason="pipeline_stopped")
