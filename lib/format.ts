/**
 * Presentation helpers shared across the feature surfaces. The backend serializes
 * status and role as free-form strings (no enum in the OpenAPI), so tone mapping
 * is heuristic and falls back to neutral for anything unrecognized.
 */

export type Tone = "ok" | "warn" | "down" | "neutral";

export function statusTone(status: string | null | undefined): Tone {
  const s = (status ?? "").toLowerCase();
  if (!s) return "neutral";
  if (/(active|ready|live|synced|healthy|answered|succeeded|success|passed|ok)/.test(s)) return "ok";
  if (/(retir|error|failed|failure|stale|breached|rejected|down|cancel)/.test(s)) return "down";
  if (/(pending|syncing|running|draft|scheduled|translating|reconcil|degrad|warn)/.test(s)) return "warn";
  return "neutral";
}

/** Best-effort role classification for query-builder affordances. */
export function isMeasureRole(role: string | null | undefined): boolean {
  return /(measure|metric|numeric|value)/i.test(role ?? "");
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "never";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelative(iso: string | null | undefined): string {
  if (!iso) return "never";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  const diffMs = Date.now() - d.getTime();
  const sec = Math.round(diffMs / 1000);
  if (sec < 60) return "just now";
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 30) return `${day}d ago`;
  return formatDateTime(iso);
}

export function formatInt(n: number | null | undefined): string {
  if (n === null || n === undefined) return "-";
  return n.toLocaleString();
}

export function formatCell(value: unknown): string {
  if (value === null || value === undefined) return "-";
  if (typeof value === "number") return value.toLocaleString();
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
