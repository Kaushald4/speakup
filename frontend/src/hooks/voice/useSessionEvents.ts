import { useEffect, useRef } from "react";

import { sessionAuthHeaders, sessionEventUrl } from "@/services/session-events";
import type { SessionEvent } from "@/types/events";

const RECONNECT_DELAY_MS = 1500;

export function useSessionEvents(
  sessionId: string,
  token: string | null,
  onEvent: (event: SessionEvent) => void,
): void {
  const handlerRef = useRef(onEvent);
  handlerRef.current = onEvent;

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    let cancelled = false;

    const processBlock = (block: string) => {
      const data = block
        .split("\n")
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).trimStart())
        .join("\n");
      if (!data) return;
      try {
        handlerRef.current(JSON.parse(data) as SessionEvent);
      } catch {
        // Ignore malformed events and keep the stream open.
      }
    };

    const run = async () => {
      while (!cancelled) {
        try {
          const response = await fetch(sessionEventUrl(sessionId), {
            headers: {
              ...Object.fromEntries(sessionAuthHeaders(token).entries()),
              Accept: "text/event-stream",
            },
            signal: controller.signal,
          });
          if (!response.ok || !response.body) {
            throw new Error(`Event stream failed with ${response.status}`);
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";

          while (!cancelled) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            let boundary = buffer.indexOf("\n\n");
            while (boundary !== -1) {
              processBlock(buffer.slice(0, boundary));
              buffer = buffer.slice(boundary + 2);
              boundary = buffer.indexOf("\n\n");
            }
          }
        } catch {
          if (cancelled) return;
        }

        if (cancelled) return;
        await new Promise((resolve) => window.setTimeout(resolve, RECONNECT_DELAY_MS));
      }
    };

    void run();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [sessionId, token]);
}
