"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Archive } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { ErrorState, TableSkeleton } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VersionPanel } from "@/components/contracts/version-panel";
import { PublishVersionDialog } from "@/components/contracts/publish-version-dialog";
import { CompatibilityDialog } from "@/components/contracts/compatibility-dialog";
import { statusTone } from "@/lib/format";
import type { ApiError } from "@/lib/api/client";
import {
  useContract,
  useChangeCompatibilityMode,
  useDeprecateContract,
} from "@/lib/api/contracts";

function Meta({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <span className="text-[0.8rem] text-muted-foreground">{label}</span>
      <span className="tnum text-right text-[0.82rem]">{value}</span>
    </div>
  );
}

export default function ContractDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { data: contract, isLoading, isError, error } = useContract(id);

  const changeMode = useChangeCompatibilityMode(id);
  const deprecate = useDeprecateContract(id);
  const [editingMode, setEditingMode] = React.useState(false);
  const [mode, setMode] = React.useState("");

  React.useEffect(() => {
    if (contract) setMode(contract.compatibility_mode);
  }, [contract]);

  const latestFields = React.useMemo(() => {
    if (!contract) return [];
    const latest =
      contract.schema_versions.find((v) => v.version === contract.latest_version) ??
      contract.schema_versions[contract.schema_versions.length - 1];
    return latest?.fields ?? [];
  }, [contract]);

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/contracts"
        className="mb-4 inline-flex items-center gap-1.5 text-[0.8rem] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Data contracts
      </Link>

      {isLoading ? (
        <div className="space-y-6">
          <div className="h-8 w-64 animate-pulse rounded-md bg-muted" />
          <TableSkeleton rows={4} />
        </div>
      ) : isError || !contract ? (
        <ErrorState error={error} title="Could not load this contract" />
      ) : (
        <>
          <PageHeader
            eyebrow={`${contract.schema_format} contract`}
            title={contract.name}
            description={contract.description || undefined}
            actions={
              <div className="flex items-center gap-2">
                <Badge tone={statusTone(contract.status)}>{contract.status}</Badge>
                <CompatibilityDialog contractId={id} baseFields={latestFields} />
                <PublishVersionDialog contractId={id} baseFields={latestFields} />
                {contract.status !== "deprecated" ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={deprecate.isPending}
                    onClick={() =>
                      deprecate.mutate(undefined, {
                        onSuccess: () => toast.success("Contract deprecated"),
                        onError: (e) =>
                          toast.error("Deprecate failed", { description: (e as ApiError)?.detail }),
                      })
                    }
                  >
                    <Archive className="h-4 w-4" /> Deprecate
                  </Button>
                ) : null}
              </div>
            }
          />

          <div className="mb-6 grid gap-5 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div>
                  <div className="eyebrow mb-1">Definition</div>
                  <CardTitle>Contract</CardTitle>
                </div>
                <Button variant="outline" size="sm" onClick={() => setEditingMode(true)}>
                  Change mode
                </Button>
              </CardHeader>
              <CardContent className="divide-y py-0">
                <Meta label="Schema format" value={contract.schema_format} />
                <Meta label="Compatibility mode" value={<Badge tone="neutral">{contract.compatibility_mode}</Badge>} />
                <Meta label="Latest version" value={`v${contract.latest_version}`} />
                <Meta label="Versions" value={contract.schema_versions.length} />
              </CardContent>
            </Card>
          </div>

          <div className="mb-3 flex items-center justify-between">
            <div className="eyebrow">Schema versions</div>
          </div>
          <VersionPanel contractId={id} versions={contract.schema_versions} />

          <Dialog open={editingMode} onOpenChange={setEditingMode}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Change compatibility mode</DialogTitle>
                <DialogDescription>
                  The mode governs how new schema versions are validated against existing ones.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="mode">Compatibility mode</Label>
                <Input
                  id="mode"
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  placeholder="backward"
                  className="w-48"
                />
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setEditingMode(false)}>
                  Cancel
                </Button>
                <Button
                  disabled={changeMode.isPending}
                  onClick={() =>
                    changeMode.mutate(mode, {
                      onSuccess: () => {
                        toast.success("Compatibility mode updated");
                        setEditingMode(false);
                      },
                      onError: (e) =>
                        toast.error("Update failed", { description: (e as ApiError)?.detail }),
                    })
                  }
                >
                  {changeMode.isPending ? "Saving" : "Save"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
