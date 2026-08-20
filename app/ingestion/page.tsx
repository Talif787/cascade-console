"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { DownloadCloud } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/common/states";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { CreateSourceDialog } from "@/components/ingestion/create-source-dialog";
import { statusTone, formatRelative } from "@/lib/format";
import { useSources, type Source } from "@/lib/api/sources";

const columns: ColumnDef<Source>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <Link href={`/ingestion/${row.original.id}`} className="tnum font-medium hover:text-primary">
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: "connector_kind",
    header: "Connector",
    cell: ({ getValue }) => (
      <span className="tnum text-[0.8rem] text-muted-foreground">{String(getValue())}</span>
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
    accessorKey: "dead_letter_count",
    header: "Dead letters",
    cell: ({ getValue }) => {
      const n = Number(getValue());
      return <Badge tone={n > 0 ? "warn" : "neutral"}>{n}</Badge>;
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

export default function IngestionPage() {
  const { data, isLoading, isError, error } = useSources();

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Data platform"
        title="Ingestion"
        description="Ingestion sources feeding the platform, each governed by a data contract. Provision, pause, resume, and manage dead-letter handling."
        actions={<CreateSourceDialog />}
      />
      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : isError ? (
        <ErrorState error={error} title="Could not load sources" />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          title="No ingestion sources"
          description="Register a source to start ingesting data against a contract."
          icon={<DownloadCloud className="h-6 w-6" />}
        />
      ) : (
        <DataTable
          columns={columns}
          data={data.items}
          filterColumn={{ id: "name", placeholder: "Filter sources..." }}
          pageSize={15}
        />
      )}
    </div>
  );
}
