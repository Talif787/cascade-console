"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { Activity } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/common/states";
import { statusTone, formatRelative } from "@/lib/format";
import type { ApiError } from "@/lib/api/client";
import { useSlos, useEvaluateAll, type Slo } from "@/lib/api/governance";

function stalenessTone(slo: Slo): "ok" | "warn" | "down" | "neutral" {
  if (slo.last_staleness_minutes === null) return "neutral";
  const ratio = slo.last_staleness_minutes / Math.max(1, slo.max_staleness_minutes);
  if (ratio >= 1) return "down";
  if (ratio >= 0.8) return "warn";
  return "ok";
}

const columns: ColumnDef<Slo>[] = [
  {
    accessorKey: "name",
    header: "SLO",
    cell: ({ row }) => (
      <Link href={`/governance/slos/${row.original.id}`} className="tnum font-medium hover:text-primary">
        {row.original.name}
      </Link>
    ),
  },
  {
    id: "asset",
    header: "Asset",
    accessorFn: (s) => `${s.asset_kind}:${s.asset_id}`,
    cell: ({ row }) => (
      <span className="tnum text-[0.8rem] text-muted-foreground">
        {row.original.asset_kind} / {row.original.asset_id.slice(0, 8)}
      </span>
    ),
  },
  {
    accessorKey: "severity",
    header: "Severity",
    cell: ({ getValue }) => <Badge tone="neutral">{String(getValue())}</Badge>,
  },
  {
    accessorKey: "state",
    header: "State",
    cell: ({ getValue }) => {
      const s = String(getValue());
      return <Badge tone={statusTone(s)}>{s}</Badge>;
    },
  },
  {
    id: "staleness",
    header: "Staleness / target",
    cell: ({ row }) => {
      const s = row.original;
      const cur = s.last_staleness_minutes === null ? "-" : `${s.last_staleness_minutes}m`;
      return (
        <span className="tnum text-[0.82rem]">
          <Badge tone={stalenessTone(s)}>{cur}</Badge>
          <span className="ml-1.5 text-muted-foreground">/ {s.max_staleness_minutes}m</span>
        </span>
      );
    },
  },
  {
    accessorKey: "breach_count",
    header: "Breaches",
    cell: ({ getValue }) => <span className="tnum text-[0.82rem]">{String(getValue())}</span>,
  },
  {
    accessorKey: "last_evaluated_at",
    header: "Evaluated",
    cell: ({ getValue }) => (
      <span className="text-[0.82rem] text-muted-foreground">
        {formatRelative(getValue() as string | null)}
      </span>
    ),
  },
];

export function SloList() {
  const { data, isLoading, isError, error } = useSlos();
  const evaluateAll = useEvaluateAll();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[0.82rem] text-muted-foreground">
          Freshness SLOs across governed assets. Evaluate recomputes staleness against each target.
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={evaluateAll.isPending}
          onClick={() =>
            evaluateAll.mutate(undefined, {
              onSuccess: (r) => toast.success(`Evaluated ${r.evaluated.length} SLOs`),
              onError: (e) => toast.error("Evaluate failed", { description: (e as ApiError)?.detail }),
            })
          }
        >
          <Activity className="h-4 w-4" />
          {evaluateAll.isPending ? "Evaluating" : "Evaluate all"}
        </Button>
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : isError ? (
        <ErrorState error={error} title="Could not load SLOs" />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          title="No SLOs defined"
          description="Freshness SLOs registered on the control plane appear here."
          icon={<Activity className="h-6 w-6" />}
        />
      ) : (
        <DataTable
          columns={columns}
          data={data.items}
          filterColumn={{ id: "name", placeholder: "Filter SLOs..." }}
          pageSize={15}
        />
      )}
    </div>
  );
}
