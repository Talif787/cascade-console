"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/common/states";
import { useCostReport, type CostLine } from "@/lib/api/governance";

function dollars(cents: number): string {
  return (cents / 100).toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function BarChart({ lines }: { lines: CostLine[] }) {
  const max = Math.max(1, ...lines.map((l) => l.amount_cents));
  return (
    <div className="space-y-2.5">
      {lines.map((line) => {
        const pct = Math.round((line.amount_cents / max) * 100);
        return (
          <div key={line.key} className="grid grid-cols-[130px_1fr_90px] items-center gap-3">
            <span className="truncate text-[0.8rem] text-muted-foreground" title={line.key}>
              {line.key}
            </span>
            <div className="h-5 overflow-hidden rounded bg-muted">
              <div
                className="h-full rounded bg-primary transition-all"
                style={{ width: `${Math.max(2, pct)}%` }}
              />
            </div>
            <span className="tnum text-right text-[0.8rem]">{dollars(line.amount_cents)}</span>
          </div>
        );
      })}
    </div>
  );
}

export function CostReport() {
  const { data, isLoading, isError, error } = useCostReport();

  if (isLoading) return <TableSkeleton rows={5} />;
  if (isError) return <ErrorState error={error} title="Could not load the cost report" />;
  if (!data || (data.by_category.length === 0 && data.by_asset.length === 0)) {
    return (
      <EmptyState
        title="No cost data"
        description="Costs recorded or imported on the control plane are reported here, broken down by category and asset."
      />
    );
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <div>
            <div className="eyebrow mb-1">Total</div>
            <CardTitle>Reporting period spend</CardTitle>
          </div>
          <span className="tnum text-2xl font-semibold">{dollars(data.total_cents)}</span>
        </CardHeader>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>By category</CardTitle>
          </CardHeader>
          <CardContent>
            {data.by_category.length ? (
              <BarChart lines={data.by_category} />
            ) : (
              <p className="text-sm text-muted-foreground">No category breakdown.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>By asset</CardTitle>
          </CardHeader>
          <CardContent className="px-0 py-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-5">Asset</TableHead>
                  <TableHead className="pr-5 text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.by_asset.map((line) => (
                  <TableRow key={line.key}>
                    <TableCell className="pl-5">
                      <span className="tnum text-[0.82rem]">{line.key}</span>
                    </TableCell>
                    <TableCell className="pr-5 text-right">
                      <span className="tnum text-[0.82rem]">{dollars(line.amount_cents)}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
