import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.7rem] font-medium transition-colors focus:outline-none",
  {
    variants: {
      tone: {
        neutral: "border-transparent bg-muted text-muted-foreground",
        primary: "border-transparent bg-accent text-accent-foreground",
        ok: "border-transparent bg-[color-mix(in_srgb,var(--ok)_16%,transparent)] text-[var(--ok)]",
        warn: "border-transparent bg-[color-mix(in_srgb,var(--warn)_18%,transparent)] text-[var(--warn)]",
        down: "border-transparent bg-[color-mix(in_srgb,var(--down)_16%,transparent)] text-[var(--down)]",
        outline: "text-foreground",
        bronze: "border-transparent bg-[color-mix(in_srgb,var(--bronze)_16%,transparent)] text-[var(--bronze)]",
        silver: "border-transparent bg-[color-mix(in_srgb,var(--silver)_20%,transparent)] text-[var(--silver)]",
        gold: "border-transparent bg-[color-mix(in_srgb,var(--gold)_18%,transparent)] text-[var(--gold)]",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

export { Badge, badgeVariants };
