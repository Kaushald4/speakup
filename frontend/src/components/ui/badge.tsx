import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors [&_svg]:size-3",
  {
    variants: {
      variant: {
        default: "bg-surface-strong text-ink",
        secondary: "bg-secondary text-secondary-foreground",
        outline: "border border-hairline-strong text-ink",
        muted: "bg-transparent text-muted-foreground",
        success: "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
        warning: "bg-amber-50 text-amber-900 dark:bg-amber-950/50 dark:text-amber-300",
        destructive: "bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
