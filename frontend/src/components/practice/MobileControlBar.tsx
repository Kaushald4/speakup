import { Mic, MicOff, Sparkles, Square } from "lucide-react";

import { Spinner } from "@/components/common/Spinner";
import { Button } from "@/components/ui/button";
import { PRACTICE_COPY } from "@/constants/practice";
import { formatClock } from "@/lib/format";
import type { VoiceStatus } from "@/types/voice";

interface MobileControlBarProps {
  remaining: number | null;
  status: VoiceStatus;
  isLinked: boolean;
  micEnabled: boolean;
  feedbackCount: number;
  ending: boolean;
  onStart: () => void;
  onToggleMic: () => void;
  onReviewFeedback: () => void;
  onEnd: () => void;
}

export function MobileControlBar({
  remaining,
  status,
  isLinked,
  micEnabled,
  feedbackCount,
  ending,
  onStart,
  onToggleMic,
  onReviewFeedback,
  onEnd,
}: MobileControlBarProps) {
  return (
    <div className="shrink-0 border-t border-hairline bg-background px-5 py-3 lg:hidden">
      <div className="mx-auto flex max-w-[1200px] items-center gap-3">
        <div className="w-[74px] shrink-0">
          <p className="eyebrow text-[9px]">{PRACTICE_COPY.timeLabel}</p>
          <p className="font-display text-[24px] font-light leading-none tabular-nums text-ink">
            {formatClock(remaining)}
          </p>
        </div>
        <div className="flex flex-1 items-center gap-2">
          {!isLinked ? (
            <Button
              className="flex-1"
              onClick={onStart}
              disabled={status === "connecting" || ending}
            >
              {status === "connecting" ? <Spinner className="size-4" /> : <Mic className="size-4" />}
              {status === "connecting"
                ? PRACTICE_COPY.connecting
                : status === "error"
                  ? PRACTICE_COPY.tryAgain
                  : PRACTICE_COPY.startSpeaking}
            </Button>
          ) : (
            <Button variant="secondary" className="flex-1" onClick={onToggleMic}>
              {micEnabled ? <Mic className="size-4" /> : <MicOff className="size-4" />}
              {micEnabled ? PRACTICE_COPY.micOn : PRACTICE_COPY.muted}
            </Button>
          )}
          {feedbackCount > 0 && (
            <Button
              variant="outline"
              size="icon"
              aria-label={PRACTICE_COPY.reviewFeedbackAria}
              onClick={onReviewFeedback}
            >
              <Sparkles className="size-4" />
            </Button>
          )}
          <Button
            variant="outline"
            size="icon"
            aria-label={PRACTICE_COPY.endSessionAria}
            onClick={onEnd}
            disabled={ending}
          >
            {ending ? <Spinner className="size-4" /> : <Square className="size-3.5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
