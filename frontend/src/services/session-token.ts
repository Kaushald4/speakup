import { SESSION_STORAGE_PREFIX } from "@/constants/api";

export function saveSessionToken(sessionId: string, token: string): void {
  sessionStorage.setItem(`${SESSION_STORAGE_PREFIX}${sessionId}`, token);
}

export function getSessionToken(sessionId: string): string | null {
  return sessionStorage.getItem(`${SESSION_STORAGE_PREFIX}${sessionId}`);
}

export function clearSessionToken(sessionId: string): void {
  sessionStorage.removeItem(`${SESSION_STORAGE_PREFIX}${sessionId}`);
}
