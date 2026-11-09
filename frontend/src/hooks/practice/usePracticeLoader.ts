import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { api } from "@/services/api";
import { ApiError } from "@/services/http";
import { getSessionToken } from "@/services/session-token";
import type { SessionDetail } from "@/types/api";

export function usePracticeLoader(sessionId: string | undefined) {
  const navigate = useNavigate();
  const token = sessionId ? getSessionToken(sessionId) : null;
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId || !token) {
      setLoading(false);
      return;
    }
    let active = true;
    api
      .getSession(sessionId, token)
      .then((detail) => {
        if (!active) return;
        if (detail.status === "COMPLETED") {
          navigate(`/report/${sessionId}`, { replace: true });
          return;
        }
        setSession(detail);
      })
      .catch((exc) => {
        if (!active) return;
        setError(exc instanceof ApiError ? exc.message : "Could not load this session.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [navigate, sessionId, token]);

  return { token, session, loading, error };
}
