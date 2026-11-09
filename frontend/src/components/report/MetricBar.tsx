import { Progress } from "@/components/ui/progress";

export function MetricBar({ label, score }: { label: string; score: number }) {
  return (
    <div>
      <div className="mb-2.5 flex items-baseline justify-between gap-4">
        <span className="text-[15px] text-body">{label}</span>
        <span className="text-[15px] font-medium tabular-nums text-ink">{score}</span>
      </div>
      <Progress value={score} aria-label={`${label} score`} />
    </div>
  );
}
