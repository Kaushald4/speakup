import { REPORT_STAT_LABELS } from "@/constants/report";
import { formatDuration } from "@/lib/format";
import type { SessionReport } from "@/types/api";

export function ReportStats({ report }: { report: SessionReport }) {
  const stats = [
    { label: REPORT_STAT_LABELS.questionsAnswered, value: report.questions_answered },
    { label: REPORT_STAT_LABELS.speakingTime, value: formatDuration(report.speaking_seconds) },
    { label: REPORT_STAT_LABELS.grammarFixes, value: report.grammar_mistakes },
  ];

  return (
    <div className="mt-12 grid grid-cols-3 divide-x divide-hairline border-y border-hairline py-6">
      {stats.map((stat) => (
        <div key={stat.label} className="px-3 text-center first:pl-0 last:pr-0">
          <div className="font-display text-[32px] font-light leading-none text-ink">
            {stat.value}
          </div>
          <div className="eyebrow mt-2 text-[10px]">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
