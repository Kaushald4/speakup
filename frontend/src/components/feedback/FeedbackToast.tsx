import { FEEDBACK_TOAST_COPY } from "@/constants/feedback";
import { Sparkles } from "lucide-react";

interface FeedbackToastProps {
  count: number;
  onOpen: () => void;
}

export function FeedbackToast({ count, onOpen }: FeedbackToastProps) {
  return (
    <button
      onClick={onOpen}
      className="group flex items-center gap-3 rounded-2xl border border-hairline bg-card px-4 py-3 text-left shadow-[0_12px_40px_rgba(12,10,9,0.12)] transition hover:border-hairline-strong"
    >
      <span className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-[#e8f5ef] to-[#f6ece4] dark:from-[#22302a] dark:to-[#2e2520]">
        <Sparkles className="size-4 text-ink/70" strokeWidth={1.6} />
      </span>
      <span>
        <span className="block text-[13px] font-medium text-ink">{FEEDBACK_TOAST_COPY.title}</span>
        <span className="block text-xs text-muted-foreground">
          {count === 1 ? FEEDBACK_TOAST_COPY.single : FEEDBACK_TOAST_COPY.many(count)}
        </span>
      </span>
      <span className="ml-2 text-[13px] font-medium text-ink underline-offset-4 group-hover:underline">
        {FEEDBACK_TOAST_COPY.review}
      </span>
    </button>
  );
}
