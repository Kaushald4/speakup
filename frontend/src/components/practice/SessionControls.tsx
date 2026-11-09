import { Sparkles, Square } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/common/Spinner";
import { PRACTICE_COPY } from "@/constants/practice";
import { formatClock } from "@/lib/format";

interface SessionControlsProps {
  remaining: number | null;
  maxSeconds: number;
  feedbackCount: number;
  ending: boolean;
  onReviewFeedback: () => void;
  onEnd: () => void;
}

export function SessionControls({
  remaining,
  maxSeconds,
  feedbackCount,
  ending,
  onReviewFeedback,
  onEnd,
}: SessionControlsProps) {
  const progress =
    remaining === null ? 100 : Math.max(0, Math.min(100, (remaining / maxSeconds) * 100));

  return (
    <Card className="shrink-0 border-hairline bg-card py-0 shadow-none">
      <div className="px-6 py-5">
        <div className="flex items-baseline justify-between gap-4">
          <span className="eyebrow">{PRACTICE_COPY.timeRemaining}</span>
          <span className="font-display text-[30px] font-light leading-none tabular-nums text-ink">
            {formatClock(remaining)}
          </span>
        </div>
        <Progress value={progress} className="mt-4" />
        {/* <p className="mt-2 text-[12px] text-muted-foreground">{PRACTICE_COPY.serverLimit}</p> */}

        <div className="mt-5 space-y-2">
          {feedbackCount > 0 && (
            <Button variant="outline" className="w-full justify-between" onClick={onReviewFeedback}>
              <span className="flex items-center gap-2">
                <Sparkles className="size-4" />
                {PRACTICE_COPY.reviewFeedback}
              </span>
              <Badge variant="default" className="px-2 py-0.5 text-[10px]">
                {feedbackCount}
              </Badge>
            </Button>
          )}
          <Button variant="outline" className="w-full" onClick={onEnd} disabled={ending}>
            {ending ? <Spinner className="size-4" /> : <Square className="size-3.5" />}
            {ending ? PRACTICE_COPY.endingSession : PRACTICE_COPY.endSession}
          </Button>
        </div>
      </div>
    </Card>
  );
}
