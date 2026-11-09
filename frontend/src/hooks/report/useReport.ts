import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { REPORT_POLL_INTERVAL_MS } from "@/constants/report";
import { api } from "@/services/api";
import { ApiError } from "@/services/http";
import { getSessionToken, saveSessionToken } from "@/services/session-token";
import type { SessionDetail, SessionReport } from "@/types/api";

export function useReport(sessionId: string | undefined) {
  const navigate = useNavigate();
  const token = sessionId ? getSessionToken(sessionId) : null;

  const [session, setSession] = useState<SessionDetail | null>(null);
  const [report, setReport] = useState<SessionReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [restarting, setRestarting] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!sessionId || !token) {
      setLoading(false);
      setError("This browser no longer has access to the session report.");
      return;
    }
    let cancelled = false;

    const load = async () => {
      try {
        const detail = await api.getSession(sessionId, token);
        if (cancelled) return;
        setSession(detail);
        if (detail.report) {
          setReport(detail.report);
          setLoading(false);
          return;
        }
        if (detail.status === "COMPLETED") {
          const finalReport = await api.getReport(sessionId, token);
          if (cancelled) return;
          setReport(finalReport);
          setLoading(false);
          return;
        }
        timerRef.current = window.setTimeout(load, REPORT_POLL_INTERVAL_MS);
      } catch (exc) {
        if (cancelled) return;
        setError(
          exc instanceof ApiError ? exc.message : "Could not load the session report right now.",
        );
        setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [sessionId, token]);

  const practiceAgain = async () => {
    if (!session) return;
    setRestarting(true);
    setError(null);
    try {
      const created = await api.createSession(session.topic.id);
      saveSessionToken(created.session.id, created.access_token);
      navigate(`/practice/${created.session.id}`);
    } catch (exc) {
      setError(exc instanceof ApiError ? exc.message : "Could not start another session.");
      setRestarting(false);
    }
  };

  return {
    session,
    report,
    error,
    loading,
    restarting,
    practiceAgain,
  };
}
