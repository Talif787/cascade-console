import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight } from "lucide-react";
import { NAV_ITEMS } from "@/lib/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReadinessPanel } from "@/components/health/readiness-panel";

export const dynamic = "force-dynamic";

const CONTEXT_BLURB: Record<string, string> = {
  serving: "Browse serving views and run governed queries against them.",
  copilot: "Ask questions in plain language and get validated, executed SQL.",
  governance: "Freshness SLOs, cost reporting, and dataset lineage.",
  pipelines: "Register and track ingestion-to-serving pipelines.",
  contracts: "Data contracts and the schema registry with compatibility rules.",
  ingestion: "Source connectors and change-data-capture status.",
  processing: "Stream jobs and their exactly-once processing state.",
  mcp: "The governed MCP tool catalog exposed to AI agents.",
};

export default function OverviewPage() {
  const contexts = NAV_ITEMS.filter((i) => i.key !== "overview");

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <div className="eyebrow mb-1.5">Control plane</div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-[var(--color-text)]">
          Overview
        </h1>
        <p className="mt-1.5 max-w-2xl text-[0.9rem] text-[var(--color-text-muted)]">
          A single console over the Cascade control plane: serving and query, governance,
          the data-platform lifecycle, and the governed agent surface. Health is live below.
        </p>
      </div>

      <div className="mb-8">
        <Suspense
          fallback={
            <Card>
              <div className="px-5 py-8 text-[0.85rem] text-[var(--color-text-muted)]">
                Checking control plane health...
              </div>
            </Card>
          }
        >
          <ReadinessPanel />
        </Suspense>
      </div>

      <div className="eyebrow mb-3">Capabilities</div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {contexts.map((item) => {
          const Icon = item.icon;
          const blurb = CONTEXT_BLURB[item.key] ?? "";
          const inner = (
            <Card
              className={
                item.ready
                  ? "h-full transition-colors hover:border-[var(--color-iris)]"
                  : "h-full opacity-70"
              }
            >
              <div className="flex h-full flex-col px-5 py-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-iris-soft)] text-[var(--color-iris)]">
                    <Icon size={17} strokeWidth={1.75} />
                  </span>
                  {item.ready ? (
                    <ArrowRight size={15} className="text-[var(--color-text-muted)]" />
                  ) : (
                    <Badge tone="neutral">{item.phase}</Badge>
                  )}
                </div>
                <h3 className="font-[family-name:var(--font-display)] text-[0.95rem] font-semibold tracking-tight text-[var(--color-text)]">
                  {item.label}
                </h3>
                <p className="mt-1 text-[0.82rem] leading-relaxed text-[var(--color-text-muted)]">
                  {blurb}
                </p>
              </div>
            </Card>
          );

          return item.ready ? (
            <Link key={item.key} href={item.href} className="block">
              {inner}
            </Link>
          ) : (
            <div key={item.key} title={`Arrives in phase ${item.phase}`}>
              {inner}
            </div>
          );
        })}
      </div>
    </div>
  );
}
