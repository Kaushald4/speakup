# SpeakUp - AI English Speaking Practice

A voice-based English learning app built with Pipecat. Learners pick a topic, talk
with an AI tutor for up to five minutes, and receive structured feedback after every
answer plus a final performance report.

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS 4 + shadcn/ui, light and dark themes
- **Backend:** FastAPI + Pipecat 1.15
- **Voice:** Deepgram (STT + Aura TTS), OpenAI-compatible LLM, WebRTC via Pipecat `SmallWebRTCTransport`
- **Storage:** in-memory only — there is no database in this project

## Features

- Topic catalogue across daily, professional, interview, general, and situational English
- Real-time voice conversation with VAD, turn detection, and interruption support
- Live transcript of the learner and AI tutor
- Independent feedback analyzer that runs asynchronously after each finalized answer
- Grammar corrections, better expressions, vocabulary, fluency, and relevance scores
- Feedback modal that never blocks the conversation
- Server-authoritative five-minute timer with a one-minute warning
- Final report with metric scores, common mistakes, strengths, and an improvement plan
- Per-session bearer token protecting all session and report endpoints
- Token-cleaned transcripts, lightweight rate limiting, short-lived sessions

## Architecture

```
React (Vite) ──REST + SSE──► FastAPI backend
      │                        ├── topic + session API
      │                        ├── in-memory session store
      │                        ├── async feedback analyzer ──► LLM
      │                        └── WebRTC signalling (/api/offer)
      │
      └── WebRTC audio ◄──► Pipecat pipeline
                             STT ─► context ─► LLM ─► TTS
```

The voice pipeline and the REST/session layers live in one process but in separate
modules. The browser connects audio directly to the bot over WebRTC; session state,
feedback, and reports travel over REST and Server-Sent Events.

See [docs/architecture.md](docs/architecture.md) for the detailed design.

## Repository structure

```
backend/
  app/
    agents/        conversation LLM, feedback analyzer, prompts
    api/           topics, sessions, WebRTC, health routes
    core/          settings and dependency container
    data/          predefined topics
    models/        session/turn domain models
    pipecat/       voice pipeline
    schemas/       Pydantic request/response and AI JSON schemas
    services/      session lifecycle, events, reports, rate limiting
  tests/
  .env.example     backend environment template
  .env             local backend secrets (gitignored)
frontend/
  src/
    components/
      brand/       wordmark
      common/      shared primitives (badge, notice, spinner, theme toggle)
      dashboard/   header, hero, how-it-works, provider alerts, topics
      feedback/    feedback dialog and toast
      practice/    room, tutor stage, controls, header, alerts
      report/      header, hero, stats, skill breakdown, CTA, loading
      theme/       theme provider
      transcript/  live conversation panel
      ui/          shadcn/ui primitives
    constants/     API routes, copy, status labels, polling/timer config
    hooks/
      dashboard/   dashboard data + topic start flow
      practice/    practice loader and session controller
      report/      report polling + replay flow
      voice/       Pipecat client, SSE events, countdown, voice ring
    lib/           formatting and pure helpers
    pages/         thin route compositions
    services/      transport, endpoints, tokens, SSE auth
    types/         API, event, and voice contracts
docs/
```

## Prerequisites

- Python 3.11+ (uv will manage it)
- [uv](https://docs.astral.sh/uv/)
- Node.js 20+ and npm
- API keys for Deepgram and an OpenAI-compatible LLM provider

## Setup

1. Create the backend environment file:

   ```bash
   cp backend/.env.example backend/.env
   ```

2. Fill in the required values:

   ```dotenv
   DEEPGRAM_API_KEY=...
   LLM_API_KEY=...
   LLM_MODEL=gpt-4.1-mini
   LLM_BASE_URL=              # optional, for OpenAI-compatible providers
   ```

   All secrets stay in `backend/.env`. Nothing is exposed to the frontend.

3. Install and run the backend:

   ```bash
   cd backend
   uv sync
   uv run uvicorn app.main:app --reload --port 8000
   ```

4. Install and run the frontend (in another terminal):

   ```bash
   cd frontend
   npm install --include=dev
   npm run dev
   ```

5. Open <http://localhost:5173>.

The Vite dev server proxies `/api` (including WebRTC signalling and SSE) to
`http://localhost:8000`, so everything is same-origin in development.

> If npm is configured with `omit=dev`, the build toolchain is skipped. Use
> `npm install --include=dev` or unset that npm option.

## Environment variables

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `DEEPGRAM_API_KEY` | yes | — | Deepgram STT and Aura TTS |
| `LLM_API_KEY` | yes | falls back to `OPENAI_API_KEY` | Conversation and feedback LLM |
| `LLM_BASE_URL` | no | provider default | OpenAI-compatible base URL |
| `LLM_MODEL` | no | `gpt-4.1-mini` | Conversation model |
| `FEEDBACK_LLM_MODEL` | no | `LLM_MODEL` | Optional faster/cheaper feedback model |
| `DEEPGRAM_STT_MODEL` | no | `nova-3` | STT model |
| `DEEPGRAM_LANGUAGE` | no | `en-US` | STT language |
| `DEEPGRAM_TTS_VOICE` | no | `aura-2-helena-en` | Aura voice |
| `DEEPGRAM_TTS_MODEL` | no | — | Optional explicit TTS model |
| `FEEDBACK_TIMEOUT_SECONDS` | no | `45` | Per-request analysis timeout |
| `FEEDBACK_MAX_ATTEMPTS` | no | `2` | Retries for invalid/failed feedback JSON |
| `SESSION_MAX_SECONDS` | no | `300` | Server-enforced session limit |
| `SESSION_TIME_WARNING_SECONDS` | no | `60` | Warning window before the end |
| `SESSION_TTL_SECONDS` | no | `3600` | Completed-session retention in memory |
| `SESSION_RATE_LIMIT_PER_MINUTE` | no | `10` | Session creations per client IP |
| `CORS_ORIGINS` | no | localhost dev origins | Comma-separated allowed origins |

## API

All session routes require the `X-Session-Token` header issued by `POST /api/sessions`.
The SSE stream and the WebRTC offer exchange use the same header, so the token never
appears in a URL or server access log.

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/health` | Provider readiness and missing env names |
| `GET` | `/api/topics` | List topics |
| `GET` | `/api/topics/{id}` | Topic detail |
| `POST` | `/api/sessions` | Create a session (returns token) |
| `POST` | `/api/sessions/{id}/connect` | Validate voice readiness, return offer URL |
| `GET` | `/api/sessions/{id}` | Session state and transcript |
| `POST` | `/api/sessions/{id}/end` | End the session (idempotent) |
| `GET` | `/api/sessions/{id}/turns` | Conversation transcript |
| `GET` | `/api/sessions/{id}/report` | Final report |
| `GET` | `/api/sessions/{id}/events` | SSE event stream |
| `POST` | `/api/offer?session_id=...` | WebRTC offer |
| `PATCH` | `/api/offer` | ICE candidate updates |

### Event contract

Each SSE message is a JSON object with a `type`:

```json
{
  "type": "FEEDBACK_READY",
  "session_id": "session_...",
  "turn_id": "turn_...",
  "turn_number": 3,
  "question": "What do you enjoy about your work?",
  "transcript": "I enjoy solving complex problems.",
  "feedback": { "grammar_score": 82, "...": "..." }
}
```

Event types: `SESSION_STATE`, `SESSION_STARTED`, `SESSION_TIME_WARNING`,
`USER_TRANSCRIPT_FINAL`, `AI_TRANSCRIPT_FINAL`, `FEEDBACK_READY`,
`FEEDBACK_FAILED`, `SESSION_COMPLETED`, `SESSION_ERROR`.

## How feedback works

The conversation agent and the feedback analyzer are deliberately separate.
Pipecat's conversation LLM never waits for grammar analysis. When a user turn is
finalized, the backend starts a background analysis request and keeps the voice
pipeline running. The result is attached to that `turn_id`, emitted over SSE, and
included in the final report.

Scores use an explicit rubric in the feedback prompt (clear/natural → serious errors)
rather than free-form ratings. Fluency is labelled as an estimate because a transcript
cannot measure pauses, pace, or pronunciation. The report is a learning aid, not a
certified CEFR assessment.

## No database

Sessions, turns, feedback, and reports live in an in-memory store in the backend
process. Sessions expire after the configured TTL, and abandoned sessions are cleaned
up periodically. This keeps the MVP simple; restarting the backend clears all state.
If persistence is added later, the store boundary in `app/services/session_service.py`
is the place to introduce a repository.

## Tests and lint

```bash
cd backend
uv run pytest
uv run ruff check app tests

cd ../frontend
npm run build
```

The backend tests cover session lifecycle, server-enforced timing, feedback-to-turn
association, pending-feedback completion, token protection, and the REST flow.

## Production build

```bash
cd frontend && npm run build
cd ../backend && uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
```

If `frontend/dist` exists, FastAPI serves the built SPA with a client-side routing
fallback. WebRTC requires HTTPS (or localhost) in browsers. For clients on different
networks, configure STUN/TURN for both the browser and the server-side
`SmallWebRTCConnection`.

## Troubleshooting

- **Microphone denied** — allow mic access for the origin and reload; the UI reports
  permission, missing-device, and in-use errors separately.
- **Voice session cannot start** — check `/api/health`; it lists missing env variables.
- **No audio / connection fails** — try another browser, disable VPNs that block UDP,
  and verify ports. STUN is configured by default; add TURN for strict NATs.
- **Feedback missing** — the LLM key may be missing or the provider rejected JSON
  output. Failures are surfaced as `FEEDBACK_FAILED` without breaking the session.
