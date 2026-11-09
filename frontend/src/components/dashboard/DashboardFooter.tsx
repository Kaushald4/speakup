import { Wordmark } from "@/components/brand/Wordmark";
import { DASHBOARD_FOOTER_COPY } from "@/constants/dashboard";

export function DashboardFooter() {
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Wordmark />
        <p className="max-w-md text-[13px] leading-relaxed text-muted-foreground">
          {DASHBOARD_FOOTER_COPY}
        </p>
      </div>
    </footer>
  );
}
