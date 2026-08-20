"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Waypoints } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/common/states";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { DefineJobDialog } from "@/components/processing/define-job-dialog";
import { statusTone, formatRelative } from "@/lib/format";
import { useJobs, type Job } from "@/lib/api/jobs";

const columns: ColumnDef<Job>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <Link href={`/processing/${row.original.id}`} className="tnum font-medium hover:text-primary">
        {row.original.name}
      </Link>
    ),
  },
  {
    id: "flow",
    header: "Source to sink",
    accessorFn: (j) => j.source.kind,
    cell: ({ row }) => (
      <span className="tnum text-[0.8rem] text-muted-foreground">
        {row.original.source.kind} &rarr; {row.original.sink.kind}
      </span>
    ),
  },
  {
    accessorKey: "delivery_guarantee",
    header: "Delivery",
    cell: ({ getValue }) => <Badge tone="neutral">{String(getValue())}</Badge>,
  },
  {
    accessorKey: "parallelism",
    header: "Parallelism",
    cell: ({ getValue }) => <span className="tnum text-[0.82rem]">{String(getValue())}</span>,
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

export default function ProcessingPage() {
  const { data, isLoading, isError, error } = useJobs();

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Data platform"
        title="Processing"
        description="Stream processing jobs with exactly-once state. Define a job, then submit, suspend, resume, cancel, and manage checkpoints and savepoints."
        actions={<DefineJobDialog />}
      />
      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : isError ? (
        <ErrorState error={error} title="Could not load jobs" />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          title="No processing jobs"
          description="Define a job to move and transform data between a source and a sink."
          icon={<Waypoints className="h-6 w-6" />}
        />
      ) : (
        <DataTable
          columns={columns}
          data={data.items}
          filterColumn={{ id: "name", placeholder: "Filter jobs..." }}
          pageSize={15}
        />
      )}
    </div>
  );
}
