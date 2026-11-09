import type { SessionDetail, SessionReport, TurnFeedback } from "./api";

export interface SessionStateEvent {
  type: "SESSION_STATE";
  session_id: string;
  session: SessionDetail;
}

export interface SessionStartedEvent {
  type: "SESSION_STARTED";
  session_id: string;
  started_at: string | null;
  ends_at: string | null;
  max_duration_seconds: number;
}

export interface TimeWarningEvent {
  type: "SESSION_TIME_WARNING";
  session_id: string;
  seconds_remaining: number;
}

export interface UserTranscriptEvent {
  type: "USER_TRANSCRIPT_FINAL";
  session_id: string;
  turn_id: string;
  text: string;
  question: string | null;
}

export interface AiTranscriptEvent {
  type: "AI_TRANSCRIPT_FINAL";
  session_id: string;
  turn_id: string;
  text: string;
}

export interface FeedbackReadyEvent {
  type: "FEEDBACK_READY";
  session_id: string;
  turn_id: string;
  turn_number: number;
  question: string | null;
  transcript: string;
  feedback: TurnFeedback;
}

export interface FeedbackFailedEvent {
  type: "FEEDBACK_FAILED";
  session_id: string;
  turn_id: string;
  error: string;
}

export interface SessionCompletedEvent {
  type: "SESSION_COMPLETED";
  session_id: string;
  reason: string;
  report: SessionReport;
}

export interface SessionErrorEvent {
  type: "SESSION_ERROR";
  session_id: string;
  error: string;
}

export type SessionEvent =
  | SessionStateEvent
  | SessionStartedEvent
  | TimeWarningEvent
  | UserTranscriptEvent
  | AiTranscriptEvent
  | FeedbackReadyEvent
  | FeedbackFailedEvent
  | SessionCompletedEvent
  | SessionErrorEvent;

export interface FeedbackItem {
  turnId: string;
  turnNumber: number;
  question: string | null;
  transcript: string;
  feedback: TurnFeedback;
}
