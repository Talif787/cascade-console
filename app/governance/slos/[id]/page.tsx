"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Activity, Pause, Play, Archive } from "lucide-react";
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
import { statusTone, formatDateTime } from "@/lib/format";
import type { ApiError } from "@/lib/api/client";
import {
  useSlo,
  useEvaluateSlo,
  useSuspendSlo,
  useResumeSlo,
  useRetireSlo,
  useChangeTarget,
  type Slo,
} from "@/lib/api/governance";

function Meta({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <span className="text-[0.8rem] text-muted-foreground">{label}</span>
      <span className="tnum text-right text-[0.82rem]">{value}</span>
    </div>
  );
}

function stalenessTone(slo: Slo): "ok" | "warn" | "down" | "neutral" {
  if (slo.last_staleness_minutes === null) return "neutral";
  const ratio = slo.last_staleness_minutes / Math.max(1, slo.max_staleness_minutes);
  if (ratio >= 1) return "down";
  if (ratio >= 0.8) return "warn";
  return "ok";
}

export default function SloDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { data: slo, isLoading, isError, error } = useSlo(id);

  const evaluate = useEvaluateSlo(id);
  const suspend = useSuspendSlo(id);
  const resume = useResumeSlo(id);
  const retire = useRetireSlo(id);
  const changeTarget = useChangeTarget(id);

  const [editing, setEditing] = React.useState(false);
  const [target, setTarget] = React.useState<number>(60);

  React.useEffect(() => {
    if (slo) setTarget(slo.max_staleness_minutes);
  }, [slo]);

  const suspended = slo?.status === "suspended";

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/governance"
        className="mb-4 inline-flex items-center gap-1.5 text-[0.8rem] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Governance
      </Link>

      {isLoading ? (
        <div className="space-y-6">
          <div className="h-8 w-64 animate-pulse rounded-md bg-muted" />
          <TableSkeleton rows={4} />
        </div>
      ) : isError || !slo ? (
        <ErrorState error={error} title="Could not load this SLO" />
      ) : (
        <>
          <PageHeader
            eyebrow={`${slo.severity} freshness SLO`}
            title={slo.name}
            description={slo.description || undefined}
            actions={
              <div className="flex items-center gap-2">
                <Badge tone={statusTone(slo.status)}>{slo.status}</Badge>
                <Badge tone={statusTone(slo.state)}>{slo.state}</Badge>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={evaluate.isPending}
                  onClick={() =>
                    evaluate.mutate(undefined, {
                      onSuccess: () => toast.success("Evaluated"),
                      onError: (e) => toast.error("Evaluate failed", { description: (e as ApiError)?.detail }),
                    })
                  }
                >
                  <Activity className="h-4 w-4" /> Evaluate
                </Button>
                {suspended ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={resume.isPending}
                    onClick={() =>
                      resume.mutate(undefined, {
                        onSuccess: () => toast.success("Resumed"),
                        onError: (e) => toast.error("Resume failed", { description: (e as ApiError)?.detail }),
                      })
                    }
                  >
                    <Play className="h-4 w-4" /> Resume
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={suspend.isPending}
                    onClick={() =>
                      suspend.mutate(undefined, {
                        onSuccess: () => toast.success("Suspended"),
                        onError: (e) => toast.error("Suspend failed", { description: (e as ApiError)?.detail }),
                      })
                    }
                  >
                    <Pause className="h-4 w-4" /> Suspend
                  </Button>
                )}
                {slo.status !== "retired" ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={retire.isPending}
                    onClick={() =>
                      retire.mutate(undefined, {
                        onSuccess: () => toast.success("SLO retired"),
                        onError: (e) => toast.error("Retire failed", { description: (e as ApiError)?.detail }),
                      })
                    }
                  >
                    <Archive className="h-4 w-4" /> Retire
                  </Button>
                ) : null}
              </div>
            }
          />

          <div className="grid gap-5 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <div>
                  <div className="eyebrow mb-1">Latest evaluation</div>
                  <CardTitle>Staleness</CardTitle>
                </div>
                <Badge tone={stalenessTone(slo)}>
                  {slo.last_staleness_minutes === null ? "not evaluated" : `${slo.last_staleness_minutes}m`}
                </Badge>
              </CardHeader>
              <CardContent className="divide-y py-0">
                <Meta label="Target (max staleness)" value={`${slo.max_staleness_minutes}m`} />
                <Meta
                  label="Last measured"
                  value={slo.last_staleness_minutes === null ? "-" : `${slo.last_staleness_minutes}m`}
                />
                <Meta label="Last evaluated" value={formatDateTime(slo.last_evaluated_at)} />
                <Meta label="Breach count" value={slo.breach_count} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <div className="eyebrow mb-1">Definition</div>
                  <CardTitle>Target and asset</CardTitle>
                </div>
                <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                  Change target
                </Button>
              </CardHeader>
              <CardContent className="divide-y py-0">
                <Meta label="Status" value={<Badge tone={statusTone(slo.status)}>{slo.status}</Badge>} />
                <Meta label="Severity" value={slo.severity} />
                <Meta label="Owner" value={slo.owner || "-"} />
                <Meta label="Asset" value={<span className="tnum">{slo.asset_kind} / {slo.asset_id.slice(0, 12)}</span>} />
                <Meta label="Version" value={`v${slo.version}`} />
              </CardContent>
            </Card>
          </div>

          <Dialog open={editing} onOpenChange={setEditing}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Change staleness target</DialogTitle>
                <DialogDescription>
                  The maximum staleness in minutes before {slo.name} is considered breached.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="target">Max staleness (minutes)</Label>
                <Input
                  id="target"
                  type="number"
                  min={1}
                  value={target}
                  onChange={(e) => setTarget(Math.max(1, Number(e.target.value) || 1))}
                  className="w-40"
                />
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
                <Button
                  disabled={changeTarget.isPending}
                  onClick={() =>
                    changeTarget.mutate(target, {
                      onSuccess: () => {
                        toast.success("Target updated");
                        setEditing(false);
                      },
                      onError: (e) =>
                        toast.error("Update failed", { description: (e as ApiError)?.detail }),
                    })
                  }
                >
                  {changeTarget.isPending ? "Saving" : "Save"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
