"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useChangeDeadLetterPolicy, type DeadLetterPolicy } from "@/lib/api/sources";
import type { ApiError } from "@/lib/api/client";

export function DeadLetterPolicyDialog({
  sourceId,
  current,
  open,
  onOpenChange,
}: {
  sourceId: string;
  current: DeadLetterPolicy;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const change = useChangeDeadLetterPolicy(sourceId);
  const [onFailure, setOnFailure] = React.useState(current.on_failure);
  const [dlqTopic, setDlqTopic] = React.useState(current.dlq_topic ?? "");
  const [maxRetries, setMaxRetries] = React.useState(current.max_retries);
  const [tolerance, setTolerance] = React.useState(current.tolerance);

  React.useEffect(() => {
    if (open) {
      setOnFailure(current.on_failure);
      setDlqTopic(current.dlq_topic ?? "");
      setMaxRetries(current.max_retries);
      setTolerance(current.tolerance);
    }
  }, [open, current]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change dead-letter policy</DialogTitle>
          <DialogDescription>How failed records are handled during ingestion.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>On failure</Label>
            <Input value={onFailure} onChange={(e) => setOnFailure(e.target.value)} placeholder="dead_letter" />
          </div>
          <div className="space-y-2">
            <Label>Dead-letter queue topic (optional)</Label>
            <Input value={dlqTopic} onChange={(e) => setDlqTopic(e.target.value)} placeholder="orders.dlq" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Max retries</Label>
              <Input type="number" min={0} value={maxRetries} onChange={(e) => setMaxRetries(Number(e.target.value) || 0)} />
            </div>
            <div className="space-y-2">
              <Label>Tolerance</Label>
              <Input type="number" min={0} value={tolerance} onChange={(e) => setTolerance(Number(e.target.value) || 0)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={change.isPending}
            onClick={() =>
              change.mutate(
                {
                  on_failure: onFailure,
                  dlq_topic: dlqTopic.trim() === "" ? null : dlqTopic,
                  max_retries: maxRetries,
                  tolerance,
                },
                {
                  onSuccess: () => {
                    toast.success("Policy updated");
                    onOpenChange(false);
                  },
                  onError: (e) => toast.error("Update failed", { description: (e as ApiError)?.detail }),
                },
              )
            }
          >
            {change.isPending ? "Saving" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
