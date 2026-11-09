import { MetricBar } from "@/components/report/MetricBar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { REPORT_PAGE_COPY } from "@/constants/report";
import type { MetricScore } from "@/types/api";

export function SkillBreakdown({ metrics }: { metrics: MetricScore[] }) {
  return (
    <Card className="border-hairline bg-card py-0 shadow-none">
      <CardHeader className="px-6 pb-0 pt-6">
        <p className="eyebrow">{REPORT_PAGE_COPY.skillBreakdown}</p>
      </CardHeader>
      <CardContent className="space-y-6 px-6 py-6">
        {metrics.map((metric) => (
          <MetricBar key={metric.key} label={metric.label} score={metric.score} />
        ))}
      </CardContent>
    </Card>
  );
}
