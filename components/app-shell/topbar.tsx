import { HealthPulse } from "@/components/health/health-pulse";

export function Topbar({ environment }: { environment: string }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--color-slate-line)] bg-[var(--color-graphite)] px-5">
      <div className="flex items-center gap-3">
        <span className="eyebrow text-[var(--color-text-invert-muted)]">Environment</span>
        <span className="tnum rounded-[var(--radius-control)] border border-[var(--color-slate-line)] px-2 py-0.5 text-[0.72rem] text-[var(--color-text-invert)]">
          {environment}
        </span>
      </div>
      <HealthPulse />
    </header>
  );
}
