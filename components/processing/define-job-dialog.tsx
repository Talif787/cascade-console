"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCreateJob } from "@/lib/api/jobs";
import type { ApiError } from "@/lib/api/client";

export function DefineJobDialog() {
  const create = useCreateJob();
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [srcKind, setSrcKind] = React.useState("kafka_topic");
  const [srcResource, setSrcResource] = React.useState("");
  const [sinkKind, setSinkKind] = React.useState("iceberg");
  const [sinkResource, setSinkResource] = React.useState("");
  const [guarantee, setGuarantee] = React.useState("exactly_once");
  const [parallelism, setParallelism] = React.useState(1);
  const [description, setDescription] = React.useState("");

  function submit() {
    create.mutate(
      {
        name,
        source: { kind: srcKind, resource: srcResource },
        sink: { kind: sinkKind, resource: sinkResource },
        delivery_guarantee: guarantee,
        parallelism,
        description,
      },
      {
        onSuccess: () => {
          toast.success("Job defined");
          setOpen(false);
          setName("");
          setSrcResource("");
          setSinkResource("");
          setDescription("");
        },
        onError: (e) => toast.error("Create failed", { description: (e as ApiError)?.detail }),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4" /> New job
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Define processing job</DialogTitle>
          <DialogDescription>A stream job moves and transforms data from a source to a sink.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="job-name">Name</Label>
            <Input id="job-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="orders-enrichment" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Source kind</Label>
              <Input value={srcKind} onChange={(e) => setSrcKind(e.target.value)} placeholder="kafka_topic" />
            </div>
            <div className="space-y-2">
              <Label>Source resource</Label>
              <Input value={srcResource} onChange={(e) => setSrcResource(e.target.value)} placeholder="topic.orders" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Sink kind</Label>
              <Input value={sinkKind} onChange={(e) => setSinkKind(e.target.value)} placeholder="iceberg" />
            </div>
            <div className="space-y-2">
              <Label>Sink resource</Label>
              <Input value={sinkResource} onChange={(e) => setSinkResource(e.target.value)} placeholder="lake.silver.orders" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Delivery guarantee</Label>
              <Input value={guarantee} onChange={(e) => setGuarantee(e.target.value)} placeholder="exactly_once" />
            </div>
            <div className="space-y-2">
              <Label>Parallelism</Label>
              <Input type="number" min={1} value={parallelism} onChange={(e) => setParallelism(Math.max(1, Number(e.target.value) || 1))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="job-desc">Description</Label>
            <Textarea id="job-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button disabled={create.isPending || name.trim() === ""} onClick={submit}>
            {create.isPending ? "Defining" : "Define"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
