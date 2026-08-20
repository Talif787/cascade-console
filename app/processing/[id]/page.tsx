"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Play, Pause, RotateCw, Ban, Save, SlidersHorizontal } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { ErrorState, TableSkeleton } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckpointDialog } from "@/components/processing/checkpoint-dialog";
import { statusTone } from "@/lib/format";
import type { ApiError } from "@/lib/api/client";
import {
  useJob,
  useSubmitJob,
  useSuspendJob,
  useResumeJob,
  useCancelJob,
  useTriggerSavepoint,
} from "@/lib/api/jobs";

function Meta({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <span className="text-[0.8rem] text-muted-foreground">{label}</span>
      <span className="tnum text-right text-[0.82rem]">{value}</span>
    </div>
  );
}

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { data: job, isLoading, isError, error } = useJob(id);

  const submit = useSubmitJob(id);
  const suspend = useSuspendJob(id);
  const resume = useResumeJob(id);
  const cancel = useCancelJob(id);
  const savepoint = useTriggerSavepoint(id);

  const [ckptOpen, setCkptOpen] = React.useState(false);

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/processing"
        className="mb-4 inline-flex items-center gap-1.5 text-[0.8rem] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Processing
      </Link>

      {isLoading ? (
        <div className="space-y-6">
          <div className="h-8 w-64 animate-pulse rounded-md bg-muted" />
          <TableSkeleton rows={4} />
        </div>
      ) : isError || !job ? (
        <ErrorState error={error} title="Could not load this job" />
      ) : (
        <>
          <PageHeader
            eyebrow={`v${job.version} job`}
            title={job.name}
            description={job.description || undefined}
            actions={
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={statusTone(job.status)}>{job.status}</Badge>
                <Button variant="outline" size="sm" disabled={submit.isPending}
                  onClick={() => submit.mutate(undefined, { onSuccess: () => toast.success("Submitted"), onError: (e) => toast.error("Submit failed", { description: (e as ApiError)?.detail }) })}>
                  <Play className="h-4 w-4" /> Submit
                </Button>
                <Button variant="outline" size="sm" disabled={suspend.isPending}
                  onClick={() => suspend.mutate(undefined, { onSuccess: () => toast.success("Suspended"), onError: (e) => toast.error("Suspend failed", { description: (e as ApiError)?.detail }) })}>
                  <Pause className="h-4 w-4" /> Suspend
                </Button>
                <Button variant="outline" size="sm" disabled={resume.isPending}
                  onClick={() => resume.mutate(undefined, { onSuccess: () => toast.success("Resumed"), onError: (e) => toast.error("Resume failed", { description: (e as ApiError)?.detail }) })}>
                  <RotateCw className="h-4 w-4" /> Resume
                </Button>
                <Button variant="outline" size="sm" disabled={savepoint.isPending}
                  onClick={() => savepoint.mutate(undefined, { onSuccess: () => toast.success("Savepoint triggered"), onError: (e) => toast.error("Savepoint failed", { description: (e as ApiError)?.detail }) })}>
                  <Save className="h-4 w-4" /> Savepoint
                </Button>
                {job.status !== "cancelled" ? (
                  <Button variant="ghost" size="sm" disabled={cancel.isPending}
                    onClick={() => cancel.mutate(undefined, { onSuccess: () => toast.success("Cancelled"), onError: (e) => toast.error("Cancel failed", { description: (e as ApiError)?.detail }) })}>
                    <Ban className="h-4 w-4" /> Cancel
                  </Button>
                ) : null}
              </div>
            }
          />

          <div className="grid gap-5 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div>
                  <div className="eyebrow mb-1">Topology</div>
                  <CardTitle>Source to sink</CardTitle>
                </div>
                <Badge tone="neutral">{job.delivery_guarantee}</Badge>
              </CardHeader>
              <CardContent className="divide-y py-0">
                <Meta label="Source" value={<span className="tnum">{job.source.kind}:{job.source.resource}</span>} />
                <Meta label="Sink" value={<span className="tnum">{job.sink.kind}:{job.sink.resource}</span>} />
                <Meta label="Parallelism" value={job.parallelism} />
                <Meta label="Runtime ref" value={job.runtime_ref || "-"} />
                <Meta label="Savepoint" value={job.savepoint_location || "-"} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <div className="eyebrow mb-1">Checkpointing</div>
                  <CardTitle>State snapshots</CardTitle>
                </div>
                <Button variant="outline" size="sm" onClick={() => setCkptOpen(true)}>
                  <SlidersHorizontal className="h-4 w-4" /> Change
                </Button>
              </CardHeader>
              <CardContent className="divide-y py-0">
                <Meta label="Interval" value={`${job.checkpoint_config.interval_ms} ms`} />
                <Meta label="Timeout" value={`${job.checkpoint_config.timeout_ms} ms`} />
                <Meta label="Min pause" value={`${job.checkpoint_config.min_pause_ms} ms`} />
                <Meta label="Max concurrent" value={job.checkpoint_config.max_concurrent} />
                <Meta
                  label="Restart"
                  value={`${job.restart_strategy.kind} (${job.restart_strategy.attempts}x, ${job.restart_strategy.delay_ms}ms)`}
                />
              </CardContent>
            </Card>
          </div>

          <CheckpointDialog jobId={id} current={job.checkpoint_config} open={ckptOpen} onOpenChange={setCkptOpen} />
        </>
      )}
    </div>
  );
}
