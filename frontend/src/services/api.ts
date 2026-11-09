import { API_ROUTES } from "@/constants/api";
import { request } from "@/services/http";
import type {
  ConnectResponse,
  CreateSessionResponse,
  Health,
  SessionDetail,
  SessionReport,
  SessionSummary,
  Topic,
} from "@/types/api";

export const api = {
  getTopics: () => request<Topic[]>(API_ROUTES.topics),

  getHealth: () => request<Health>(API_ROUTES.health),

  createSession: (topicId: string) =>
    request<CreateSessionResponse>(API_ROUTES.sessions, {
      method: "POST",
      body: JSON.stringify({ topic_id: topicId }),
    }),

  getSession: (sessionId: string, token: string) =>
    request<SessionDetail>(API_ROUTES.session(sessionId), { token }),

  connectSession: (sessionId: string, token: string) =>
    request<ConnectResponse>(API_ROUTES.connect(sessionId), {
      method: "POST",
      token,
    }),

  endSession: (sessionId: string, token: string) =>
    request<{ session: SessionSummary }>(API_ROUTES.end(sessionId), {
      method: "POST",
      token,
    }),

  getReport: (sessionId: string, token: string) =>
    request<SessionReport>(API_ROUTES.report(sessionId), { token }),
};
