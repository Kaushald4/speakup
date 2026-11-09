import { Badge } from "@/components/ui/badge";
import { REPORT_PAGE_COPY } from "@/constants/report";

export function RecurringMistakes({ mistakes }: { mistakes: string[] }) {
  if (mistakes.length === 0) return null;

  return (
    <section className="mt-14 border-t border-hairline pt-8">
      <p className="eyebrow">{REPORT_PAGE_COPY.recurringCorrections}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {mistakes.map((mistake, index) => (
          <Badge
            key={index}
            variant="outline"
            className="border-hairline bg-card px-3 py-1.5 text-[12px] font-normal normal-case tracking-normal text-body"
          >
            {mistake}
          </Badge>
        ))}
      </div>
    </section>
  );
}
