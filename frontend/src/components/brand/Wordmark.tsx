import { Link } from "react-router-dom";

import { APP_NAME } from "@/constants/app";
import { cn } from "@/lib/utils";

export function Wordmark({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label={`${APP_NAME} home`}
    >
      <span className="relative grid size-7 place-items-center rounded-full bg-card shadow-[inset_0_0_0_1px_rgba(41,37,36,0.08)] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
        <span className="size-2.5 rounded-full bg-[linear-gradient(135deg,#a7e5d3,#c8b8e0_55%,#f4c5a8)]" />
      </span>
      <span className="font-display text-[23px] font-normal leading-none tracking-[-0.01em] text-ink">
        {APP_NAME}
      </span>
    </Link>
  );
}
