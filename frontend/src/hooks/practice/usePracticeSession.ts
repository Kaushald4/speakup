import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useCountdown } from "@/hooks/voice/useCountdown";
import { useSessionEvents } from "@/hooks/voice/useSessionEvents";
import { useVoiceRing } from "@/hooks/voice/useVoiceRing";
import { useVoiceSession } from "@/hooks/voice/useVoiceSession";
import { FEEDBACK_ERROR_DISMISS_MS } from "@/constants/practice";
import { feedbackItemFromEvent } from "@/lib/feedback";
import { api } from "@/services/api";
import type { SessionDetail } from "@/types/api";
import type { FeedbackItem, SessionEvent } from "@/types/events";

export function usePracticeSession(initialSession: SessionDetail, token: string) {
  const navigate = useNavigate();
  const [session, setSession] = useState(initialSession);
  const [feedbackQueue, setFeedbackQueue] = useState<FeedbackItem[]>([]);
  const [activeFeedback, setActiveFeedback] = useState<FeedbackItem | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [timeWarning, setTimeWarning] = useState(false);
  const [ending, setEnding] = useState(false);
  const [endDialogOpen, setEndDialogOpen] = useState(false);

  const voice = useVoiceSession({
    sessionId: session.id,
    token,
    initialTurns: initialSession.turns,
  });
  const ring = useVoiceRing(voice);

  const remaining = useCountdown(session.ends_at);
  const finishedRef = useRef(false);
  const seenModalRef = useRef(false);

  const finishToReport = useCallback(async () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    await voice.disconnect();
    navigate(`/report/${session.id}`);
  }, [navigate, session.id, voice.disconnect]);

  const endSession = useCallback(async () => {
    if (finishedRef.current) return;
    setEnding(true);
    setEndDialogOpen(false);
    try {
      await api.endSession(session.id, token);
    } catch {
      // The server may already have ended it; the report resolves the final state.
    } finally {
      await finishToReport();
    }
  }, [finishToReport, session.id, token]);

  const startVoice = useCallback(async () => {
    void ring.start().catch(() => undefined);
    await voice.connect();
  }, [ring.start, voice.connect]);

  const handleEvent = useCallback(
    (event: SessionEvent) => {
      switch (event.type) {
        case "SESSION_STATE":
          setSession(event.session);
          if (event.session.status === "COMPLETED") void finishToReport();
          break;
        case "SESSION_STARTED":
          setSession((current) => ({
            ...current,
            status: "ACTIVE",
            started_at: event.started_at,
            ends_at: event.ends_at,
            max_duration_seconds: event.max_duration_seconds,
          }));
          break;
        case "SESSION_TIME_WARNING":
          setTimeWarning(true);
          break;
        case "USER_TRANSCRIPT_FINAL":
          voice.addFinalUserTurn(event.text, event.turn_id);
          break;
        case "SESSION_COMPLETED":
          void finishToReport();
          break;
        case "FEEDBACK_READY":
          setFeedbackQueue((queue) => [...queue, feedbackItemFromEvent(event)]);
          break;
        case "FEEDBACK_FAILED":
          setFeedbackError(event.error);
          break;
        default:
          break;
      }
    },
    [finishToReport, voice.addFinalUserTurn],
  );

  useSessionEvents(session.id, token, handleEvent);

  useEffect(() => {
    if (activeFeedback || feedbackQueue.length === 0 || seenModalRef.current) return;
    seenModalRef.current = true;
    setActiveFeedback(feedbackQueue[0]);
    setFeedbackQueue((queue) => queue.slice(1));
  }, [activeFeedback, feedbackQueue]);

  useEffect(() => {
    if (remaining === 0 && session.started_at && !finishedRef.current) {
      void endSession();
    }
  }, [endSession, remaining, session.started_at]);

  useEffect(() => {
    if (!feedbackError) return;
    const timer = window.setTimeout(() => setFeedbackError(null), FEEDBACK_ERROR_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [feedbackError]);

  const openQueuedFeedback = () => {
    if (activeFeedback || feedbackQueue.length === 0) return;
    setActiveFeedback(feedbackQueue[0]);
    setFeedbackQueue((queue) => queue.slice(1));
  };

  return {
    session,
    voice,
    ring,
    remaining,
    timeWarning,
    ending,
    endDialogOpen,
    feedbackQueue,
    activeFeedback,
    feedbackError,
    setEndDialogOpen,
    startVoice,
    endSession,
    openQueuedFeedback,
    closeFeedback: () => setActiveFeedback(null),
  };
}

export type PracticeSessionController = ReturnType<typeof usePracticeSession>;
