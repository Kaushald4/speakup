import { ArrowRight, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

import { Spinner } from "@/components/common/Spinner";
import { Button } from "@/components/ui/button";
import { REPORT_PAGE_COPY } from "@/constants/report";

interface ReportCtaProps {
  restarting: boolean;
  onPracticeAgain: () => void;
}

export function ReportCta({ restarting, onPracticeAgain }: ReportCtaProps) {
  return (
    <section className="relative mt-12 overflow-hidden rounded-2xl border border-hairline bg-canvas-soft px-6 py-14 text-center">
      <div className="atmos-orb atmos-lavender -left-16 top-0 h-56 w-56 opacity-60" />
      <div className="atmos-orb atmos-mint -bottom-20 -right-12 h-56 w-56 opacity-60" />
      <div className="relative">
        <p className="eyebrow">{REPORT_PAGE_COPY.ctaEyebrow}</p>
        <h2 className="display-lg mt-3 text-ink">{REPORT_PAGE_COPY.ctaHeading}</h2>
        <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-muted-foreground">
          {REPORT_PAGE_COPY.ctaDescription}
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" onClick={onPracticeAgain} disabled={restarting}>
            {restarting ? <Spinner className="size-4" /> : <RefreshCw className="size-4" />}
            {REPORT_PAGE_COPY.practiceAgain}
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/">
              {REPORT_PAGE_COPY.browseTopics}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
