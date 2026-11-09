# Architecture

## Goals

- A reliable five-minute voice conversation with low latency.
- Feedback that is structured, validated, and independent of the conversation turn.
- Clear module boundaries so STT, TTS, LLM, transports, and storage can change.
- No database and no user accounts.

## Runtime layout

The application runs as two development processes:

1. **FastAPI backend** on `:8000` — topics, sessions, feedback, reports, SSE, and
   WebRTC signalling. It also hosts the Pipecat pipeline for each active session in
   the same event loop.
2. **Vite dev server** on `:5173` — React UI. Proxies `/api` to the backend, so REST,
   SSE, and the WebRTC offer exchange are same-origin.

In production, `npm run build` emits `frontend/dist`, which FastAPI serves with an SPA
fallback.

## Backend modules

| Module | Responsibility |
|---|---|
| `app/core/config.py` | Validated settings loaded from `backend/.env` |
| `app/core/container.py` | Constructs the service graph once per app lifespan |
| `app/api/routes_topics.py` | Static topic catalogue |
| `app/api/routes_sessions.py` | Session creation, state, end, report, turns, SSE |
| `app/api/routes_webrtc.py` | Offer/ICE signalling with an authenticated session |
| `app/services/session_service.py` | Session state machine, timers, turn capture, feedback orchestration, cleanup |
| `app/services/report_builder.py` | Deterministic aggregation of per-turn feedback into a report |
| `app/services/event_bus.py` | In-memory per-session pub/sub for SSE |
| `app/agents/prompts.py` | Conversation rules, feedback rubric, JSON contract |
| `app/agents/conversation_agent.py` | Deepgram STT/TTS and OpenAI-compatible conversation LLM |
| `app/agents/feedback_analyzer.py` | Separate LLM call, JSON extraction, Pydantic validation |
| `app/pipecat/pipeline.py` | Transport, VAD, aggregators, pipeline, lifecycle hooks |

## Session state machine

```
CREATED ──prepare_connection──► CONNECTING ──client connected──► ACTIVE
   │                                                              │
   │                                                              ├── manual end
   │                                                              ├── five-minute timer
   │                                                              └── client disconnect
   │                                                              │
   └──────────────────────────► COMPLETING ◄──────────────────────┘
                                      │
                                      ▼
                                  COMPLETED
```

`COMPLETING` is the point where:
1. The end timestamp and duration are recorded.
2. The active voice pipeline is cancelled through its registered close callback.
3. Pending feedback tasks are awaited (bounded by `SESSION_END_FEEDBACK_WAIT_SECONDS`).
4. The report is built and published.

Ending is idempotent. Concurrent end requests wait on a per-session event instead of
racing or returning half-finished state.

## Voice pipeline

```
transport.input
  └─ Deepgram STT
      └─ LLM user aggregator + Silero VAD
          └─ OpenAI-compatible LLM
              └─ Deepgram Aura TTS
                  └─ transport.output
                      └─ LLM assistant aggregator
```

- `on_user_turn_stopped` provides the finalized user transcript. Only final turns are
  sent to the feedback analyzer.
- `on_assistant_turn_stopped` records the AI transcript and becomes the question
  context for the next user turn.
- The initial greeting is triggered on `on_client_connected` with a developer message
  plus `LLMRunFrame`; the system prompt fixes the topic and conversation rules.
- Pipecat handles interruption, VAD, turn detection, and audio streaming.

## Feedback flow

```
final user turn
    │
    ├─► append turn + publish USER_TRANSCRIPT_FINAL (SSE)
    │
    └─► background task
            │  LLM with rubric + JSON schema
            ├─ parse & validate with Pydantic
            ├─ attach to turn_id
            └─ publish FEEDBACK_READY (SSE)

conversation pipeline continues independently
```

Every feedback payload carries `turn_id`, so overlapping answers can never be
shown against the wrong response. Invalid or failed analysis emits `FEEDBACK_FAILED`
and is excluded from the report; the session still completes.

## Reports

Reports are deterministic: per-metric averages of validated turn feedback, total
corrections, most frequent explanations, strengths from positive feedback, and
deduplicated improvement tips. Missing suggestions are filled from the lowest-scoring
metrics. This avoids a second expensive LLM call and keeps scoring reproducible.

## Security and privacy

- Provider keys stay in the backend `.env`; no key reaches the browser.
- Each session gets a random bearer token; session, report, SSE, and offer routes
  validate it. The browser sends it as `X-Session-Token`, never in a URL.
- `prepare_connection` refuses a second active voice connection for the same session.
- The timer is authoritative on the server; the UI countdown is only a display.
- Raw audio is never recorded. Transcripts live in memory and expire with the session.
- Session creation is rate limited per client IP.

## Scaling notes

The store and event bus are process-local, which is appropriate for a single-instance
MVP. To scale horizontally later:

- We need to Replace `SessionService`'s dict with a shared repository (Redis/Postgres).
- Replace `EventBus` with Redis pub/sub or a message broker.
- Move the Pipecat workers to dedicated processes and route offers to them.
- Add a TURN server for strict NATs and a production HTTPS deployment.
