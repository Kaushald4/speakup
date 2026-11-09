import { Timer } from "lucide-react";

import { Wordmark } from "@/components/brand/Wordmark";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DASHBOARD_HEADER_COPY, DASHBOARD_NAV_LINKS } from "@/constants/dashboard";

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-5 sm:px-6">
        <Wordmark />
        <nav className="hidden items-center gap-8 text-[15px] font-medium text-body md:flex">
          {DASHBOARD_NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="transition-colors hover:text-ink">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="hidden border-hairline bg-transparent font-medium normal-case tracking-normal text-muted-foreground sm:inline-flex"
          >
            <Timer className="size-3.5" />
            {DASHBOARD_HEADER_COPY.sessionBadge}
          </Badge>
          <ThemeToggle />
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <a href="#topics">{DASHBOARD_HEADER_COPY.startCta}</a>
          </Button>
        </div>
      </div>
    </header>
  );
}
