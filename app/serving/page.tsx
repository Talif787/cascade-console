"use client";

import * as React from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Table2 } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { ErrorState, EmptyState, TableSkeleton } from "@/components/common/states";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { statusTone, formatInt, formatRelative } from "@/lib/format";
import { useServingViews, type ServingView } from "@/lib/api/serving";

const columns: ColumnDef<ServingView>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <Link
        href={`/serving/${row.original.id}`}
        className="tnum font-medium text-foreground hover:text-primary"
      >
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: "engine",
    header: "Engine",
    cell: ({ getValue }) => <Badge tone="neutral">{String(getValue())}</Badge>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const s = String(getValue());
      return <Badge tone={statusTone(s)}>{s}</Badge>;
    },
  },
  {
    id: "columns",
    header: "Columns",
    accessorFn: (v) => v.columns.length,
    cell: ({ getValue }) => <span className="tnum text-[0.82rem]">{String(getValue())}</span>,
  },
  {
    accessorKey: "last_row_count",
    header: "Rows",
    cell: ({ getValue }) => <span className="tnum text-[0.82rem]">{formatInt(getValue() as number | null)}</span>,
  },
  {
    accessorKey: "last_synced_at",
    header: "Last synced",
    cell: ({ getValue }) => (
      <span className="text-[0.82rem] text-muted-foreground">{formatRelative(getValue() as string | null)}</span>
    ),
  },
];

export default function ServingPage() {
  const { data, isLoading, isError, error } = useServingViews({ page: 1, size: 100 });

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Serving"
        title="Serving views"
        description="Governed, queryable projections over the lakehouse. Open a view to inspect its schema and run analytics queries through the control plane."
        actions={
          data ? <Badge tone="neutral">{formatInt(data.meta.total)} total</Badge> : undefined
        }
      />

      {isLoading ? (
        <TableSkeleton rows={6} />
      ) : isError ? (
        <ErrorState error={error} title="Could not load serving views" />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          title="No serving views"
          description="Once views are registered on the control plane, they appear here."
          icon={<Table2 className="h-6 w-6" />}
        />
      ) : (
        <DataTable
          columns={columns}
          data={data.items}
          filterColumn={{ id: "name", placeholder: "Filter by name..." }}
          pageSize={15}
        />
      )}
    </div>
  );
}
