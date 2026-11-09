import { ArrowUpRight } from "lucide-react";

import { REPORT_PAGE_COPY } from "@/constants/report";
import type { ImprovedSentence } from "@/types/api";

export function SentencesToKeep({ sentences }: { sentences: ImprovedSentence[] }) {
  if (sentences.length === 0) return null;

  return (
    <section className="mt-16">
      <p className="eyebrow">{REPORT_PAGE_COPY.takeawaysEyebrow}</p>
      <h2 className="display-lg mt-3 text-ink">{REPORT_PAGE_COPY.takeawaysHeading}</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {sentences.map((sentence, index) => (
          <div
            key={`${sentence.original}-${index}`}
            className="rounded-2xl border border-hairline bg-card px-5 py-4"
          >
            <p className="eyebrow text-[10px] text-muted-foreground">
              {REPORT_PAGE_COPY.youSaid}
            </p>
            <p className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground line-through decoration-muted-soft">
              {sentence.original}
            </p>
            <p className="mt-3 flex gap-2 text-[15px] font-medium leading-relaxed text-ink">
              <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-ink/50" strokeWidth={1.8} />
              {sentence.improved}
            </p>
            {sentence.explanation && (
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                {sentence.explanation}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
