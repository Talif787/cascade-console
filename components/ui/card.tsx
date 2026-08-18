import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-panel)] border border-[var(--color-hairline)] bg-[var(--color-paper-panel)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[var(--color-hairline)] px-5 py-4">
      <div>
        {eyebrow ? <div className="eyebrow mb-1">{eyebrow}</div> : null}
        <h2 className="font-[family-name:var(--font-display)] text-[0.95rem] font-semibold tracking-tight text-[var(--color-text)]">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

export function CardBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("px-5 py-4", className)}>{children}</div>;
}
