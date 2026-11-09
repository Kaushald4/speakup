import { AlertTriangle, Clock } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { PRACTICE_COPY } from "@/constants/practice";

interface PracticeAlertsProps {
  timeWarning: boolean;
  ending: boolean;
  error: string | null;
  onRetry: () => void;
}

export function PracticeAlerts({ timeWarning, ending, error, onRetry }: PracticeAlertsProps) {
  return (
    <>
      {timeWarning && !ending && (
        <Alert className="mb-4 shrink-0 border-amber-200 bg-amber-50/70 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
          <Clock className="mt-0.5 size-4 text-amber-700 dark:text-amber-400" />
          <div>
            <AlertTitle>{PRACTICE_COPY.timeWarningTitle}</AlertTitle>
            <AlertDescription className="text-amber-900/70 dark:text-amber-300/80">
              {PRACTICE_COPY.timeWarningCopy}
            </AlertDescription>
          </div>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-4 shrink-0">
          <AlertTriangle className="mt-0.5 size-4" />
          <div className="flex-1">
            <AlertTitle>{PRACTICE_COPY.voiceErrorTitle}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-red-300 bg-white text-red-800 hover:bg-red-50 dark:border-red-800 dark:bg-transparent dark:text-red-300 dark:hover:bg-red-950/40"
            onClick={onRetry}
          >
            {PRACTICE_COPY.retry}
          </Button>
        </Alert>
      )}
    </>
  );
}
