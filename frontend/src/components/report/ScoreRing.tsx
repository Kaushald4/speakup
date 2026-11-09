import { cn } from "@/lib/utils";

interface ScoreRingProps {
  score: number;
  size?: number;
  label?: string;
}

export function ScoreRing({ score, size = 184, label = "Overall" }: ScoreRingProps) {
  const stroke = 3;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalized = Math.min(100, Math.max(0, score));
  const offset = circumference - (normalized / 100) * circumference;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--hairline)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--primary)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          fill="none"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className={cn("absolute inset-0 flex flex-col items-center justify-center")}>
        <span className="font-display text-[56px] font-light leading-none tracking-[-0.03em] text-ink">
          {score}
        </span>
        <span className="eyebrow mt-2">{label}</span>
      </div>
    </div>
  );
}
