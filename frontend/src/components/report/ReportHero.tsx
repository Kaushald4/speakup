import { DifficultyBadge } from "@/components/common/DifficultyBadge";
import { ScoreRing } from "@/components/report/ScoreRing";
import { REPORT_PAGE_COPY } from "@/constants/report";
import { summaryForScore } from "@/lib/report";
import type { SessionDetail, SessionReport } from "@/types/api";

export function ReportHero({
  session,
  report,
}: {
  session: SessionDetail;
  report: SessionReport;
}) {
  return (
    <section className="grid gap-10 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div>
        <p className="eyebrow">{REPORT_PAGE_COPY.eyebrow}</p>
        <h1 className="display-xl mt-3 text-balance text-ink">{session.topic.title}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <DifficultyBadge difficulty={session.topic.difficulty} />
          <span className="text-[13px] text-muted-foreground">{session.topic.category}</span>
        </div>
        <p className="body-copy mt-5 max-w-lg text-pretty">
          {summaryForScore(report.overall_score)}
        </p>
      </div>
      <div className="justify-self-center sm:justify-self-end">
        <ScoreRing score={report.overall_score} />
      </div>
    </section>
  );
}
