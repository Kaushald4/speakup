export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

export const SESSION_STORAGE_PREFIX = "speakup.session.";
export const SESSION_TOKEN_HEADER = "X-Session-Token";

export const API_ROUTES = {
  topics: "/api/topics",
  health: "/api/health",
  sessions: "/api/sessions",
  session: (sessionId: string) => `/api/sessions/${sessionId}`,
  connect: (sessionId: string) => `/api/sessions/${sessionId}/connect`,
  end: (sessionId: string) => `/api/sessions/${sessionId}/end`,
  report: (sessionId: string) => `/api/sessions/${sessionId}/report`,
  events: (sessionId: string) => `/api/sessions/${sessionId}/events`,
} as const;
