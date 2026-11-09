import { useEffect, useState } from "react";

import { SESSION_TIMER_TICK_MS } from "@/constants/practice";

export function useCountdown(endsAt: string | null): number | null {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!endsAt) {
      setRemaining(null);
      return;
    }
    const update = () => {
      const seconds = Math.round((new Date(endsAt).getTime() - Date.now()) / 1000);
      setRemaining(Math.max(0, seconds));
    };
    update();
    const timer = window.setInterval(update, SESSION_TIMER_TICK_MS);
    return () => window.clearInterval(timer);
  }, [endsAt]);

  return remaining;
}
