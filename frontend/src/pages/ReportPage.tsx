import { Link, useParams } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

import { PageNotice } from "@/components/common/PageNotice";
import { ImprovementPlan } from "@/components/report/ImprovementPlan";
import { RecurringMistakes } from "@/components/report/RecurringMistakes";
import { ReportCta } from "@/components/report/ReportCta";
import { ReportHeader } from "@/components/report/ReportHeader";
import { ReportHero } from "@/components/report/ReportHero";
import { ReportLoading } from "@/components/report/ReportLoading";
import { ReportStats } from "@/components/report/ReportStats";
import { SentencesToKeep } from "@/components/report/SentencesToKeep";
import { SkillBreakdown } from "@/components/report/SkillBreakdown";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { REPORT_PAGE_COPY } from "@/constants/report";
import { useReport } from "@/hooks/report/useReport";

export function ReportPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { session, report, error, loading, restarting, practiceAgain } = useReport(sessionId);

  if (loading) return <ReportLoading />;

  if (error || !report || !session) {
    return (
      <PageNotice
        title={REPORT_PAGE_COPY.unavailableTitle}
        copy={error ?? REPORT_PAGE_COPY.unavailableCopy}
      >
        {session?.status === "ACTIVE" && sessionId && (
          <Button asChild variant="outline">
            <Link to={`/practice/${sessionId}`}>{REPORT_PAGE_COPY.returnToSession}</Link>
          </Button>
        )}
        <Button asChild>
          <Link to="/">{REPORT_PAGE_COPY.backToTopics}</Link>
        </Button>
      </PageNotice>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ReportHeader createdAt={session.created_at} />

      <main className="mx-auto max-w-[1000px] px-5 pb-24 pt-12 sm:px-6">
        <ReportHero session={session} report={report} />
        <ReportStats report={report} />

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          <SkillBreakdown metrics={report.metrics} />
          <ImprovementPlan
            suggestions={report.improvement_suggestions}
            strengths={report.strengths}
          />
        </div>

        <SentencesToKeep sentences={report.improved_sentences} />
        <RecurringMistakes mistakes={report.common_mistakes} />

        {error && (
          <Alert variant="destructive" className="mt-8">
            <AlertTriangle className="mt-0.5 size-4" />
            <div>
              <AlertTitle>{REPORT_PAGE_COPY.restartErrorTitle}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </div>
          </Alert>
        )}

        <p className="mt-10 max-w-2xl text-[12px] leading-relaxed text-muted-foreground">
          {report.disclaimer}
        </p>

        <ReportCta restarting={restarting} onPracticeAgain={() => void practiceAgain()} />
      </main>
    </div>
  );
}
