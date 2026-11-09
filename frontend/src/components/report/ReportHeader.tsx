import { Clock } from "lucide-react";

import { Wordmark } from "@/components/brand/Wordmark";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { REPORT_DATE_FORMAT } from "@/constants/report";

export function ReportHeader({ createdAt }: { createdAt: string }) {
  return (
    <header className="border-b border-hairline">
      <div className="mx-auto flex h-16 max-w-[1000px] items-center justify-between px-5 sm:px-6">
        <Wordmark />
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <Clock className="size-3.5" />
            {new Date(createdAt).toLocaleString(undefined, REPORT_DATE_FORMAT)}
          </span>
          <ThemeToggle className="-mr-2" />
        </div>
      </div>
    </header>
  );
}
