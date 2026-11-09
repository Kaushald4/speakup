import { Clock } from "lucide-react";

import { DifficultyBadge } from "@/components/common/DifficultyBadge";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { Wordmark } from "@/components/brand/Wordmark";
import { cn } from "@/lib/utils";
import { formatClock } from "@/lib/format";
import { statusDotClass } from "@/lib/session";
import { STATUS_LABELS } from "@/constants/practice";
import type { VoiceStatus } from "@/types/voice";
import type { Topic } from "@/types/api";

interface PracticeHeaderProps {
  topic: Topic;
  status: VoiceStatus;
  remaining: number | null;
  timeWarning: boolean;
}

export function PracticeHeader({ topic, status, remaining, timeWarning }: PracticeHeaderProps) {
  return (
    <header className="shrink-0 border-b border-hairline bg-background">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-5 sm:px-6">
        <Wordmark />
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 md:flex">
            <span className="text-[15px] font-medium text-ink">{topic.title}</span>
            <DifficultyBadge difficulty={topic.difficulty} />
          </div>
          <span className="flex items-center gap-2 text-[13px] text-muted-foreground">
            <span className={cn("size-1.5 rounded-full", statusDotClass(status))} />
            <span className="hidden sm:inline">{STATUS_LABELS[status]}</span>
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 text-[15px] font-medium tabular-nums",
              timeWarning ? "text-red-700 dark:text-red-400" : "text-ink",
            )}
          >
            <Clock className="size-3.5" />
            {formatClock(remaining)}
          </span>
          <ThemeToggle className="-mr-2" />
        </div>
      </div>
    </header>
  );
}
