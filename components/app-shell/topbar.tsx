"use client";

import { Search } from "lucide-react";
import { HealthPulse } from "@/components/health/health-pulse";
import { ModeToggle } from "@/components/theme/mode-toggle";
import { useCommandPalette } from "@/components/command/command-palette";

export function Topbar({ environment }: { environment: string }) {
  const { setOpen } = useCommandPalette();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-sidebar-border bg-sidebar px-5 text-sidebar-foreground">
      <div className="flex items-center gap-3">
        <span className="eyebrow text-sidebar-muted">Environment</span>
        <span className="tnum rounded-md border border-sidebar-border px-2 py-0.5 text-[0.72rem] text-sidebar-foreground">
          {environment}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-md border border-sidebar-border px-2.5 py-1.5 text-[0.75rem] text-sidebar-muted transition-colors hover:text-sidebar-foreground"
        >
          <Search size={14} />
          <span className="hidden sm:inline">Search</span>
          <kbd className="tnum ml-1 hidden rounded bg-sidebar-accent px-1.5 py-0.5 text-[0.65rem] sm:inline">
            Cmd K
          </kbd>
        </button>
        <ModeToggle />
        <div className="ml-1 border-l border-sidebar-border pl-3">
          <HealthPulse />
        </div>
      </div>
    </header>
  );
}
