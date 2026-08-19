"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/common/states";
import { formatCell, formatInt } from "@/lib/format";

export function ResultsTable({
  columns,
  rows,
  rowCount,
  pageSize = 20,
}: {
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number | null;
  pageSize?: number;
}) {
  const defs = React.useMemo<ColumnDef<Record<string, unknown>>[]>(
    () =>
      columns.map((name) => ({
        accessorKey: name,
        header: name,
        cell: ({ getValue }) => <span className="tnum text-[0.82rem]">{formatCell(getValue())}</span>,
      })),
    [columns],
  );

  if (rows.length === 0) {
    return <EmptyState title="No rows" description="The query was valid but matched nothing." />;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Badge tone="ok">{formatInt(rowCount)} rows</Badge>
        <span className="text-[0.78rem] text-muted-foreground">{columns.length} columns</span>
      </div>
      <DataTable columns={defs} data={rows} pageSize={pageSize} />
    </div>
  );
}
