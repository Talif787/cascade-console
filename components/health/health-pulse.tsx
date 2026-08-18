"use client";

import { useEffect, useState } from "react";
import { api, type ApiError } from "@/lib/api/client";
import type { ReadinessStatus } from "@/lib/api/types";

type State = "ok" | "degraded" | "down" | "loading";

const color: Record<State, string> = {
  ok: "var(--color-ok)",
  degraded: "var(--color-warn)",
  down: "var(--color-down)",
  loading: "var(--color-text-invert-muted)",
};

const label: Record<State, string> = {
  ok: "Ready",
  degraded: "Degraded",
  down: "Unreachable",
  loading: "Checking",
};

export function HealthPulse() {
  const [state, setState] = useState<State>("loading");

  useEffect(() => {
    let active = true;
    async function check() {
      try {
        const body = await api.get<ReadinessStatus>("/readyz");
        if (!active) return;
        setState(body?.status === "ok" ? "ok" : "degraded");
      } catch (err) {
        if (!active) return;
        const status = (err as ApiError)?.status;
        setState(status && status < 500 ? "degraded" : "down");
      }
    }
    check();
    const id = setInterval(check, 10000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="flex items-center gap-2">
      <span
        className={state === "loading" ? "h-2 w-2 rounded-full" : "pulse-dot h-2 w-2 rounded-full"}
        style={{ backgroundColor: color[state], ["--pulse-color" as string]: color[state] }}
        aria-hidden
      />
      <span className="text-[0.72rem] font-medium text-[var(--color-text-invert-muted)]">
        {label[state]}
      </span>
    </div>
  );
}
