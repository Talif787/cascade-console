import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "ok" | "warn" | "down" | "iris";

const toneClass: Record<Tone, string> = {
  neutral: "bg-[var(--color-hairline)] text-[var(--color-text-muted)]",
  ok: "bg-[color-mix(in_srgb,var(--color-ok)_16%,white)] text-[color-mix(in_srgb,var(--color-ok)_75%,black)]",
  warn: "bg-[color-mix(in_srgb,var(--color-warn)_20%,white)] text-[color-mix(in_srgb,var(--color-warn)_70%,black)]",
  down: "bg-[color-mix(in_srgb,var(--color-down)_16%,white)] text-[color-mix(in_srgb,var(--color-down)_75%,black)]",
  iris: "bg-[var(--color-iris-soft)] text-[var(--color-iris)]",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.7rem] font-medium",
        toneClass[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
