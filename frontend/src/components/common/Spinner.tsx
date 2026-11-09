import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

export function Spinner({ className = "size-4" }: { className?: string }) {
  return <Loader2 className={cn("animate-spin text-ink/70", className)} />;
}
