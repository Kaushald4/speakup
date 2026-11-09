import { Check } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { REPORT_PAGE_COPY } from "@/constants/report";

interface ImprovementPlanProps {
  suggestions: string[];
  strengths: string[];
}

export function ImprovementPlan({ suggestions, strengths }: ImprovementPlanProps) {
  return (
    <Card className="border-hairline bg-card py-0 shadow-none">
      <CardHeader className="px-6 pb-0 pt-6">
        <p className="eyebrow">{REPORT_PAGE_COPY.improvementPlan}</p>
      </CardHeader>
      <CardContent className="px-6 py-6">
        <ol className="space-y-4">
          {suggestions.map((suggestion, index) => (
            <li key={index} className="flex gap-4">
              <span className="font-display text-[22px] font-light leading-none text-muted-soft">
                0{index + 1}
              </span>
              <p className="text-[15px] leading-relaxed text-body">{suggestion}</p>
            </li>
          ))}
        </ol>

        {strengths.length > 0 && (
          <>
            <Separator className="my-6" />
            <p className="eyebrow mb-3">{REPORT_PAGE_COPY.strengths}</p>
            <ul className="space-y-2.5">
              {strengths.map((strength, index) => (
                <li key={index} className="flex gap-2.5 text-[14px] leading-relaxed text-body">
                  <Check
                    className="mt-0.5 size-4 shrink-0 text-emerald-700 dark:text-emerald-400"
                    strokeWidth={2}
                  />
                  {strength}
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
