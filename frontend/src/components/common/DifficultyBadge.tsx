import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Difficulty } from "@/types/api";

const DOT: Record<Difficulty, string> = {
  Beginner: "bg-emerald-600",
  Intermediate: "bg-amber-600",
  Advanced: "bg-rose-600",
};

export function DifficultyBadge({
  difficulty,
  className,
}: {
  difficulty: Difficulty;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 border-hairline bg-card/60 px-2.5 py-1 text-[11px] font-medium normal-case tracking-normal text-body",
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", DOT[difficulty])} />
      {difficulty}
    </Badge>
  );
}
