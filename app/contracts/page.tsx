"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { FileCheck2 } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/common/states";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { CreateContractDialog } from "@/components/contracts/create-contract-dialog";
import { statusTone, formatRelative } from "@/lib/format";
import { useContracts, type Contract } from "@/lib/api/contracts";

const columns: ColumnDef<Contract>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <Link href={`/contracts/${row.original.id}`} className="tnum font-medium hover:text-primary">
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: "schema_format",
    header: "Format",
    cell: ({ getValue }) => <Badge tone="neutral">{String(getValue())}</Badge>,
  },
  {
    accessorKey: "compatibility_mode",
    header: "Compatibility",
    cell: ({ getValue }) => <span className="tnum text-[0.8rem]">{String(getValue())}</span>,
  },
  {
    accessorKey: "latest_version",
    header: "Latest",
    cell: ({ getValue }) => <span className="tnum text-[0.82rem]">v{String(getValue())}</span>,
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

export default function ContractsPage() {
  const { data, isLoading, isError, error } = useContracts();

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Data platform"
        title="Data contracts"
        description="Schema contracts and their versions, governed by compatibility rules. Create one, publish versions, and check compatibility."
        actions={<CreateContractDialog />}
      />
      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : isError ? (
        <ErrorState error={error} title="Could not load contracts" />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          title="No data contracts"
          description="Register a contract to govern a schema and its evolution."
          icon={<FileCheck2 className="h-6 w-6" />}
        />
      ) : (
        <DataTable
          columns={columns}
          data={data.items}
          filterColumn={{ id: "name", placeholder: "Filter contracts..." }}
          pageSize={15}
        />
      )}
    </div>
  );
}
