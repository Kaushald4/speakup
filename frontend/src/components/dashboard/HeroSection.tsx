import {
  ArrowRight,
  Clock,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DASHBOARD_HERO } from "@/constants/dashboard";

const HIGHLIGHT_ICONS: Record<string, LucideIcon> = {
  clock: Clock,
  message: MessageSquareText,
  shield: ShieldCheck,
};

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="atmos-orb atmos-mint -left-28 top-24 h-80 w-80" />
      <div className="atmos-orb atmos-lavender -right-20 top-0 h-[26rem] w-[26rem]" />
      <div className="atmos-orb atmos-peach bottom-0 left-1/3 h-56 w-56 opacity-50" />

      <div className="relative mx-auto max-w-[1200px] px-5 pb-20 pt-20 sm:px-6 sm:pb-24 sm:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <Badge
            variant="outline"
            className="gap-1.5 border-hairline bg-card/60 px-3 py-1.5 font-medium normal-case tracking-normal text-body"
          >
            <Sparkles className="size-3.5 text-ink/60" />
            {DASHBOARD_HERO.badge}
          </Badge>
          <h1 className="display-mega mt-6 text-balance text-ink">{DASHBOARD_HERO.headline}</h1>
          <p className="body-copy mx-auto mt-6 max-w-xl text-[17px] text-pretty">
            {DASHBOARD_HERO.description}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <a href="#topics">
                {DASHBOARD_HERO.primaryCta}
                <ArrowRight className="size-4" />
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="#how">{DASHBOARD_HERO.secondaryCta}</a>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-muted-foreground">
            {DASHBOARD_HERO.highlights.map((highlight) => {
              const Icon = HIGHLIGHT_ICONS[highlight.icon];
              return (
                <span key={highlight.label} className="inline-flex items-center gap-1.5">
                  <Icon className="size-3.5" />
                  {highlight.label}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
