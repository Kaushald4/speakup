import type { VoiceStatus } from "@/types/voice";

export const STATUS_LABELS: Record<VoiceStatus, string> = {
  idle: "Ready to start",
  connecting: "Connecting",
  connected: "In session",
  disconnected: "Disconnected",
  ended: "Session ended",
  error: "Connection problem",
};

export const MICROPHONE_ERROR_MESSAGES: Record<string, string> = {
  permissions: "Microphone permission was denied. Allow microphone access and try again.",
  "not-found": "No microphone was found. Connect a microphone and try again.",
  "in-use": "Your microphone is being used by another application.",
  "not-supported":
    "This browser cannot access the microphone. Try a recent version of Chrome, Edge, or Safari.",
};

export const MICROPHONE_ERROR_FALLBACK =
  "The microphone could not be started. Check your browser settings and try again.";

export const IGNORED_BOT_OUTPUT_TYPES = [
  "word",
  "token",
  "backchannel",
  "expression_sound",
  "expression_pause",
] as const;

export const LIVE_USER_MESSAGE_ID = "user-live";

export const DEFAULT_SESSION_MAX_SECONDS = 300;
export const SESSION_TIMER_TICK_MS = 500;
export const FEEDBACK_ERROR_DISMISS_MS = 8000;

export const VOICE_RING_DEFAULTS = {
  type: "ring",
  size: 220,
  speed: 0.85,
  theme: "auto",
} as const;

export const TERMINAL_VOICE_STATUSES: VoiceStatus[] = [
  "ended",
  "error",
  "disconnected",
];

export const ACTIVITY_LABELS = {
  speaking: "Speaking",
  listeningToYou: "Listening to you",
  listening: "Listening",
  connecting: "Connecting",
  ready: "Ready",
} as const;

export const PRACTICE_COPY = {
  tutor: "Tutor",
  tutorIdle: "Start the session and the tutor will open with a question.",
  tutorWaiting: "Waiting for the next question.",
  startSpeaking: "Start speaking",
  connecting: "Connecting...",
  tryAgain: "Try again",
  microphoneOn: "Microphone on",
  microphoneMuted: "Microphone muted",
  enableAudio: "Enable tutor audio",
  timeRemaining: "Time remaining",
  serverLimit: "The five-minute limit is enforced by the server.",
  reviewFeedback: "Review feedback",
  endSession: "End session",
  endingSession: "Ending session...",
  feedbackNote:
    "Feedback is written in the background while you keep talking. It never pauses the conversation.",
  timeWarningTitle: "One minute left",
  timeWarningCopy:
    "Finish your current thought. We will close the session and prepare your report.",
  voiceErrorTitle: "Voice connection problem",
  retry: "Retry",
  preparing: "Preparing your session",
  expiredTitle: "This session link has expired.",
  expiredCopy:
    "Your browser no longer holds access to this session. Start a new five-minute practice.",
  unavailableTitle: "This session is unavailable.",
  unavailableCopy: "We could not find the session. Start a new practice instead.",
  backToTopics: "Back to topics",
  timeLabel: "Time",
  micOn: "Mic on",
  muted: "Muted",
  reviewFeedbackAria: "Review feedback",
  endSessionAria: "End session",
} as const;
