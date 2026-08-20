"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Play, Pause, RotateCw, Power, ShieldAlert, PlusCircle } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { ErrorState, TableSkeleton } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeadLetterPolicyDialog } from "@/components/ingestion/dead-letter-policy-dialog";
import { statusTone } from "@/lib/format";
import type { ApiError } from "@/lib/api/client";
import {
  useSource,
  useProvisionSource,
  usePauseSource,
  useResumeSource,
  useDecommissionSource,
  useRecordDeadLetters,
} from "@/lib/api/sources";

function Meta({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <span className="text-[0.8rem] text-muted-foreground">{label}</span>
      <span className="tnum text-right text-[0.82rem]">{value}</span>
    </div>
  );
}

export default function SourceDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { data: source, isLoading, isError, error } = useSource(id);

  const provision = useProvisionSource(id);
  const pause = usePauseSource(id);
  const resume = useResumeSource(id);
  const decommission = useDecommissionSource(id);
  const recordDl = useRecordDeadLetters(id);

  const [policyOpen, setPolicyOpen] = React.useState(false);

  const configEntries = source ? Object.entries(source.config ?? {}) : [];

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/ingestion"
        className="mb-4 inline-flex items-center gap-1.5 text-[0.8rem] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Ingestion
      </Link>

      {isLoading ? (
        <div className="space-y-6">
          <div className="h-8 w-64 animate-pulse rounded-md bg-muted" />
          <TableSkeleton rows={4} />
        </div>
      ) : isError || !source ? (
        <ErrorState error={error} title="Could not load this source" />
      ) : (
        <>
          <PageHeader
            eyebrow={`${source.connector_kind} source`}
            title={source.name}
            description={source.description || undefined}
            actions={
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={statusTone(source.status)}>{source.status}</Badge>
                <Button variant="outline" size="sm" disabled={provision.isPending}
                  onClick={() => provision.mutate(undefined, { onSuccess: () => toast.success("Provisioned"), onError: (e) => toast.error("Provision failed", { description: (e as ApiError)?.detail }) })}>
                  <Play className="h-4 w-4" /> Provision
                </Button>
                <Button variant="outline" size="sm" disabled={pause.isPending}
                  onClick={() => pause.mutate(undefined, { onSuccess: () => toast.success("Paused"), onError: (e) => toast.error("Pause failed", { description: (e as ApiError)?.detail }) })}>
                  <Pause className="h-4 w-4" /> Pause
                </Button>
                <Button variant="outline" size="sm" disabled={resume.isPending}
                  onClick={() => resume.mutate(undefined, { onSuccess: () => toast.success("Resumed"), onError: (e) => toast.error("Resume failed", { description: (e as ApiError)?.detail }) })}>
                  <RotateCw className="h-4 w-4" /> Resume
                </Button>
                {source.status !== "decommissioned" ? (
                  <Button variant="ghost" size="sm" disabled={decommission.isPending}
                    onClick={() => decommission.mutate(undefined, { onSuccess: () => toast.success("Decommissioned"), onError: (e) => toast.error("Decommission failed", { description: (e as ApiError)?.detail }) })}>
                    <Power className="h-4 w-4" /> Decommission
                  </Button>
                ) : null}
              </div>
            }
          />

          <div className="grid gap-5 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div>
                  <div className="eyebrow mb-1">Runtime</div>
                  <CardTitle>Source</CardTitle>
                </div>
                <Badge tone={source.dead_letter_count > 0 ? "warn" : "neutral"}>
                  {source.dead_letter_count} dead letters
                </Badge>
              </CardHeader>
              <CardContent className="divide-y py-0">
                <Meta label="Connector kind" value={source.connector_kind} />
                <Meta label="Contract" value={<span className="tnum">{source.contract_id.slice(0, 12)}</span>} />
                <Meta label="Pipeline" value={source.pipeline_id ? source.pipeline_id.slice(0, 12) : "-"} />
                <Meta label="Runtime ref" value={source.runtime_ref || "-"} />
                <Meta label="Version" value={`v${source.version}`} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <div className="eyebrow mb-1">Dead-letter policy</div>
                  <CardTitle>Failure handling</CardTitle>
                </div>
                <Button variant="outline" size="sm" onClick={() => setPolicyOpen(true)}>
                  <ShieldAlert className="h-4 w-4" /> Change
                </Button>
              </CardHeader>
              <CardContent className="divide-y py-0">
                <Meta label="On failure" value={source.dead_letter_policy.on_failure} />
                <Meta label="DLQ topic" value={source.dead_letter_policy.dlq_topic || "-"} />
                <Meta label="Max retries" value={source.dead_letter_policy.max_retries} />
                <Meta label="Tolerance" value={source.dead_letter_policy.tolerance} />
                <div className="flex items-center justify-between py-2">
                  <span className="text-[0.8rem] text-muted-foreground">Simulate failures</span>
                  <Button variant="ghost" size="sm" disabled={recordDl.isPending}
                    onClick={() => recordDl.mutate(5, { onSuccess: () => toast.success("Recorded 5 dead letters"), onError: (e) => toast.error("Failed", { description: (e as ApiError)?.detail }) })}>
                    <PlusCircle className="h-4 w-4" /> Record 5
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {configEntries.length > 0 ? (
            <Card className="mt-5">
              <CardHeader>
                <CardTitle>Config</CardTitle>
              </CardHeader>
              <CardContent className="divide-y py-0">
                {configEntries.map(([k, v]) => (
                  <Meta key={k} label={k} value={<span className="tnum">{String(v)}</span>} />
                ))}
              </CardContent>
            </Card>
          ) : null}

          <DeadLetterPolicyDialog
            sourceId={id}
            current={source.dead_letter_policy}
            open={policyOpen}
            onOpenChange={setPolicyOpen}
          />
        </>
      )}
    </div>
  );
}
