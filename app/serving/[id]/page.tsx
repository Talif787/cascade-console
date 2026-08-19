"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, RefreshCw, GitCompareArrows, Archive } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { ErrorState, TableSkeleton } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SchemaPanel } from "@/components/serving/schema-panel";
import { QueryBuilder } from "@/components/serving/query-builder";
import { statusTone } from "@/lib/format";
import type { ApiError } from "@/lib/api/client";
import {
  useServingView,
  useSyncView,
  useReconcileView,
  useRetireView,
} from "@/lib/api/serving";

export default function ServingViewDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { data: view, isLoading, isError, error } = useServingView(id);

  const sync = useSyncView(id);
  const reconcile = useReconcileView(id);
  const retire = useRetireView(id);
  const [confirmRetire, setConfirmRetire] = React.useState(false);

  return (
    <div className="mx-auto max-w-6xl">
      <Link
        href="/serving"
        className="mb-4 inline-flex items-center gap-1.5 text-[0.8rem] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Serving views
      </Link>

      {isLoading ? (
        <div className="space-y-6">
          <div className="h-8 w-64 animate-pulse rounded-md bg-muted" />
          <TableSkeleton rows={6} />
        </div>
      ) : isError || !view ? (
        <ErrorState error={error} title="Could not load this serving view" />
      ) : (
        <>
          <PageHeader
            eyebrow={`${view.engine} view`}
            title={view.name}
            description={view.description || undefined}
            actions={
              <div className="flex items-center gap-2">
                <Badge tone={statusTone(view.status)}>{view.status}</Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    sync.mutate(undefined, {
                      onSuccess: () => toast.success("Sync complete"),
                      onError: (e) => toast.error("Sync failed", { description: (e as ApiError)?.detail }),
                    })
                  }
                  disabled={sync.isPending}
                >
                  <RefreshCw className="h-4 w-4" /> Sync
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    reconcile.mutate(undefined, {
                      onSuccess: () => toast.success("Reconcile complete"),
                      onError: (e) =>
                        toast.error("Reconcile failed", { description: (e as ApiError)?.detail }),
                    })
                  }
                  disabled={reconcile.isPending}
                >
                  <GitCompareArrows className="h-4 w-4" /> Reconcile
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirmRetire(true)}>
                  <Archive className="h-4 w-4" /> Retire
                </Button>
              </div>
            }
          />

          <Tabs defaultValue="schema">
            <TabsList>
              <TabsTrigger value="schema">Schema</TabsTrigger>
              <TabsTrigger value="query">Query</TabsTrigger>
            </TabsList>
            <TabsContent value="schema">
              <SchemaPanel view={view} />
            </TabsContent>
            <TabsContent value="query">
              <QueryBuilder view={view} />
            </TabsContent>
          </Tabs>

          <Dialog open={confirmRetire} onOpenChange={setConfirmRetire}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Retire this serving view?</DialogTitle>
                <DialogDescription>
                  Retiring {view.name} removes it from the queryable catalog. This action is
                  processed by the control plane.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setConfirmRetire(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  disabled={retire.isPending}
                  onClick={() =>
                    retire.mutate(undefined, {
                      onSuccess: () => {
                        toast.success("View retired");
                        setConfirmRetire(false);
                      },
                      onError: (e: unknown) =>
                        toast.error("Retire failed", { description: (e as ApiError)?.detail }),
                    })
                  }
                >
                  {retire.isPending ? "Retiring" : "Retire"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
