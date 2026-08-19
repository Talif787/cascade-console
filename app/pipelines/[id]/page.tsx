"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Play, Pause, Archive } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { ErrorState, TableSkeleton } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConnectorCard } from "@/components/pipelines/connector-card";
import { statusTone } from "@/lib/format";
import type { ApiError } from "@/lib/api/client";
import {
  usePipeline,
  useActivatePipeline,
  usePausePipeline,
  useArchivePipeline,
} from "@/lib/api/pipelines";

export default function PipelineDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { data: pipeline, isLoading, isError, error } = usePipeline(id);

  const activate = useActivatePipeline(id);
  const pause = usePausePipeline(id);
  const archive = useArchivePipeline(id);

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/pipelines"
        className="mb-4 inline-flex items-center gap-1.5 text-[0.8rem] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Pipelines
      </Link>

      {isLoading ? (
        <div className="space-y-6">
          <div className="h-8 w-64 animate-pulse rounded-md bg-muted" />
          <TableSkeleton rows={3} />
        </div>
      ) : isError || !pipeline ? (
        <ErrorState error={error} title="Could not load this pipeline" />
      ) : (
        <>
          <PageHeader
            eyebrow={`v${pipeline.version} pipeline`}
            title={pipeline.name}
            description={pipeline.description || undefined}
            actions={
              <div className="flex items-center gap-2">
                <Badge tone={statusTone(pipeline.status)}>{pipeline.status}</Badge>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={activate.isPending}
                  onClick={() =>
                    activate.mutate(undefined, {
                      onSuccess: () => toast.success("Activated"),
                      onError: (e) => toast.error("Activate failed", { description: (e as ApiError)?.detail }),
                    })
                  }
                >
                  <Play className="h-4 w-4" /> Activate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pause.isPending}
                  onClick={() =>
                    pause.mutate(undefined, {
                      onSuccess: () => toast.success("Paused"),
                      onError: (e) => toast.error("Pause failed", { description: (e as ApiError)?.detail }),
                    })
                  }
                >
                  <Pause className="h-4 w-4" /> Pause
                </Button>
                {pipeline.status !== "archived" ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={archive.isPending}
                    onClick={() =>
                      archive.mutate(undefined, {
                        onSuccess: () => toast.success("Archived"),
                        onError: (e) => toast.error("Archive failed", { description: (e as ApiError)?.detail }),
                      })
                    }
                  >
                    <Archive className="h-4 w-4" /> Archive
                  </Button>
                ) : null}
              </div>
            }
          />
          <div className="grid gap-5 md:grid-cols-2">
            <ConnectorCard label="Source" connector={pipeline.source} />
            <ConnectorCard label="Sink" connector={pipeline.sink} />
          </div>
        </>
      )}
    </div>
  );
}
