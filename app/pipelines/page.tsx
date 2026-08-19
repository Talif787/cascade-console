"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Workflow } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/common/states";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { CreatePipelineDialog } from "@/components/pipelines/create-pipeline-dialog";
import { statusTone, formatRelative } from "@/lib/format";
import { usePipelines, type Pipeline } from "@/lib/api/pipelines";

const columns: ColumnDef<Pipeline>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <Link href={`/pipelines/${row.original.id}`} className="tnum font-medium hover:text-primary">
        {row.original.name}
      </Link>
    ),
  },
  {
    id: "source",
    header: "Source",
    accessorFn: (p) => p.source.type,
    cell: ({ row }) => (
      <span className="tnum text-[0.8rem] text-muted-foreground">
        {row.original.source.type}:{row.original.source.resource}
      </span>
    ),
  },
  {
    id: "sink",
    header: "Sink",
    accessorFn: (p) => p.sink.type,
    cell: ({ row }) => (
      <span className="tnum text-[0.8rem] text-muted-foreground">
        {row.original.sink.type}:{row.original.sink.resource}
      </span>
    ),
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
    accessorKey: "updated_at",
    header: "Updated",
    cell: ({ getValue }) => (
      <span className="text-[0.82rem] text-muted-foreground">{formatRelative(getValue() as string)}</span>
    ),
  },
];

export default function PipelinesPage() {
  const { data, isLoading, isError, error } = usePipelines();

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Data platform"
        title="Pipelines"
        description="Source-to-sink data pipelines across the platform. Create one, then activate, pause, or archive it."
        actions={<CreatePipelineDialog />}
      />
      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : isError ? (
        <ErrorState error={error} title="Could not load pipelines" />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          title="No pipelines"
          description="Register a pipeline to move data from a source to a sink."
          icon={<Workflow className="h-6 w-6" />}
        />
      ) : (
        <DataTable
          columns={columns}
          data={data.items}
          filterColumn={{ id: "name", placeholder: "Filter pipelines..." }}
          pageSize={15}
        />
      )}
    </div>
  );
}
