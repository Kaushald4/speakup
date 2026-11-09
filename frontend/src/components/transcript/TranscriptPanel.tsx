import { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";

import { Card } from "@/components/ui/card";
import { TRANSCRIPT_COPY } from "@/constants/transcript";
import { cn } from "@/lib/utils";
import type { TranscriptMessage } from "@/types/voice";

interface TranscriptPanelProps {
  messages: TranscriptMessage[];
  botSpeaking: boolean;
  userSpeaking: boolean;
  connected: boolean;
}

export function TranscriptPanel({
  messages,
  botSpeaking,
  userSpeaking,
  connected,
}: TranscriptPanelProps) {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, botSpeaking, userSpeaking]);

  return (
    <Card className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border-hairline bg-card shadow-none">
      <header className="flex items-center justify-between border-b border-hairline px-6 py-4">
        <span className="eyebrow">{TRANSCRIPT_COPY.header}</span>
        <span className="flex items-center gap-2 text-[13px] text-muted-foreground">
          <span
            className={cn(
              "size-1.5 rounded-full",
              connected ? "animate-pulse bg-emerald-600" : "bg-muted-soft",
            )}
          />
          {connected ? TRANSCRIPT_COPY.connected : TRANSCRIPT_COPY.disconnected}
        </span>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-6">
        {messages.length === 0 && (
          <div className="flex h-full min-h-[320px] flex-col items-center justify-center py-12 text-center">
            <span className="voice-halo scale-90">
              <Sparkles className="size-5 text-ink/70" strokeWidth={1.5} />
            </span>
            <p className="mt-6 font-display text-[26px] font-light leading-tight text-ink">
              {TRANSCRIPT_COPY.emptyTitle}
            </p>
            <p className="mt-2 max-w-xs text-[15px] leading-relaxed text-muted-foreground">
              {TRANSCRIPT_COPY.emptyDescription}
            </p>
          </div>
        )}

        <div className="divide-y divide-hairline-soft">
          {messages.map((message) => (
            <div key={message.id} className="py-5">
              {message.role === "AI" ? (
                <div className="flex gap-3.5">
                  <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full border border-hairline bg-canvas-soft">
                    <Sparkles className="size-3.5 text-ink/60" strokeWidth={1.5} />
                  </span>
                  <div>
                    <p className="eyebrow text-[10px]">{TRANSCRIPT_COPY.tutorLabel}</p>
                    <p className="mt-1.5 text-[15px] leading-relaxed text-ink">
                      {message.text}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end">
                  <div className="max-w-[85%] text-right">
                    <p className="eyebrow text-[10px]">{TRANSCRIPT_COPY.userLabel}</p>
                    <p className="mt-1.5 inline-block rounded-xl bg-surface-strong px-4 py-2.5 text-left text-[15px] leading-relaxed text-ink">
                      {message.text}
                      {!message.final && (
                        <span className="ml-1 inline-block h-3.5 w-px animate-pulse bg-ink/60 align-middle" />
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {userSpeaking && !messages.some((message) => !message.final) && (
          <div className="flex justify-end py-5">
            <div className="rounded-xl bg-surface-strong px-4 py-3">
              <span className="voice-bars">
                <span />
                <span />
                <span />
                <span />
              </span>
            </div>
          </div>
        )}

        {botSpeaking && (
          <div className="flex gap-3.5 py-5">
            <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full border border-hairline bg-canvas-soft">
              <Sparkles className="size-3.5 text-ink/60" strokeWidth={1.5} />
            </span>
            <div className="flex items-center">
              <span className="voice-bars">
                <span />
                <span />
                <span />
                <span />
              </span>
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>
    </Card>
  );
}
