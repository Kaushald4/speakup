import { API_ROUTES, SESSION_TOKEN_HEADER } from "@/constants/api";
import { apiUrl } from "@/services/http";

export function sessionEventUrl(sessionId: string): string {
  return apiUrl(API_ROUTES.events(sessionId));
}

export function sessionAuthHeaders(token: string): Headers {
  return new Headers({ [SESSION_TOKEN_HEADER]: token });
}
