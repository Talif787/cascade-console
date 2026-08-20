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
import { useChangeCheckpoint, type CheckpointConfig } from "@/lib/api/jobs";
import type { ApiError } from "@/lib/api/client";

export function CheckpointDialog({
  jobId,
  current,
  open,
  onOpenChange,
}: {
  jobId: string;
  current: CheckpointConfig;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const change = useChangeCheckpoint(jobId);
  const [interval, setInterval] = React.useState(current.interval_ms);
  const [timeout, setTimeoutMs] = React.useState(current.timeout_ms);
  const [minPause, setMinPause] = React.useState(current.min_pause_ms);
  const [maxConc, setMaxConc] = React.useState(current.max_concurrent);

  React.useEffect(() => {
    if (open) {
      setInterval(current.interval_ms);
      setTimeoutMs(current.timeout_ms);
      setMinPause(current.min_pause_ms);
      setMaxConc(current.max_concurrent);
    }
  }, [open, current]);

  const field = (label: string, value: number, set: (n: number) => void) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type="number" min={0} value={value} onChange={(e) => set(Number(e.target.value) || 0)} />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change checkpoint config</DialogTitle>
          <DialogDescription>Checkpointing controls exactly-once state snapshots.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          {field("Interval (ms)", interval, setInterval)}
          {field("Timeout (ms)", timeout, setTimeoutMs)}
          {field("Min pause (ms)", minPause, setMinPause)}
          {field("Max concurrent", maxConc, setMaxConc)}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={change.isPending}
            onClick={() =>
              change.mutate(
                { interval_ms: interval, timeout_ms: timeout, min_pause_ms: minPause, max_concurrent: maxConc },
                {
                  onSuccess: () => {
                    toast.success("Checkpoint config updated");
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
