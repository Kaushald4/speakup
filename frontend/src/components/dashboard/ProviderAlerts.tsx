import { AlertTriangle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PROVIDER_ALERTS_COPY } from "@/constants/dashboard";
import type { Health } from "@/types/api";

interface ProviderAlertsProps {
  health: Health | null;
  error: string | null;
}

export function ProviderAlerts({ health, error }: ProviderAlertsProps) {
  const voiceUnavailable = health ? !health.voice_ready : false;
  if (!voiceUnavailable && !error) return null;

  return (
    <div className="mx-auto max-w-[1200px] px-5 sm:px-6">
      {voiceUnavailable && health && (
        <Alert className="border-amber-200 bg-amber-50/60 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 size-4 text-amber-700 dark:text-amber-400" />
          <div>
            <AlertTitle>{PROVIDER_ALERTS_COPY.missingTitle}</AlertTitle>
            <AlertDescription className="text-amber-900/70 dark:text-amber-300/80">
              Add {health.missing_env.join(" and ")} to your{" "}
              <code className="rounded bg-amber-100 px-1 py-0.5 text-[12px] dark:bg-amber-900/50">
                {PROVIDER_ALERTS_COPY.envFile}
              </code>{" "}
              {PROVIDER_ALERTS_COPY.missingHint}
            </AlertDescription>
          </div>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive" className="mt-3">
          <AlertTriangle className="mt-0.5 size-4" />
          <div>
            <AlertTitle>{PROVIDER_ALERTS_COPY.genericTitle}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </div>
        </Alert>
      )}
    </div>
  );
}
