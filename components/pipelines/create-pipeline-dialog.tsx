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
import { useCreatePipeline, type ConnectorPayload } from "@/lib/api/pipelines";
import type { ApiError } from "@/lib/api/client";

function parseOptions(raw: string): Record<string, unknown> | null {
  if (raw.trim() === "") return {};
  try {
    const v = JSON.parse(raw);
    return v && typeof v === "object" ? v : null;
  } catch {
    return null;
  }
}

export function CreatePipelineDialog() {
  const create = useCreatePipeline();
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [srcType, setSrcType] = React.useState("postgres_cdc");
  const [srcResource, setSrcResource] = React.useState("");
  const [srcOptions, setSrcOptions] = React.useState("");
  const [sinkType, setSinkType] = React.useState("iceberg");
  const [sinkResource, setSinkResource] = React.useState("");
  const [sinkOptions, setSinkOptions] = React.useState("");
  const [optionError, setOptionError] = React.useState<string | null>(null);

  function submit() {
    const so = parseOptions(srcOptions);
    const ko = parseOptions(sinkOptions);
    if (so === null || ko === null) {
      setOptionError("Options must be valid JSON objects.");
      return;
    }
    setOptionError(null);
    const source: ConnectorPayload = { type: srcType, resource: srcResource, options: so };
    const sink: ConnectorPayload = { type: sinkType, resource: sinkResource, options: ko };
    create.mutate(
      { name, source, sink, description },
      {
        onSuccess: () => {
          toast.success("Pipeline created");
          setOpen(false);
          setName("");
          setDescription("");
          setSrcResource("");
          setSinkResource("");
          setSrcOptions("");
          setSinkOptions("");
        },
        onError: (e) => toast.error("Create failed", { description: (e as ApiError)?.detail }),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4" /> New pipeline
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Register pipeline</DialogTitle>
          <DialogDescription>Define a source and sink connector for the pipeline.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pl-name">Name</Label>
            <Input id="pl-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="orders-cdc" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Source type</Label>
              <Input value={srcType} onChange={(e) => setSrcType(e.target.value)} placeholder="postgres_cdc" />
            </div>
            <div className="space-y-2">
              <Label>Source resource</Label>
              <Input value={srcResource} onChange={(e) => setSrcResource(e.target.value)} placeholder="topic.orders" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Source options (JSON, optional)</Label>
            <Textarea
              value={srcOptions}
              onChange={(e) => setSrcOptions(e.target.value)}
              placeholder='{"format":"avro"}'
              className="min-h-[52px] font-[family-name:var(--font-mono)] text-[0.78rem]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Sink type</Label>
              <Input value={sinkType} onChange={(e) => setSinkType(e.target.value)} placeholder="iceberg" />
            </div>
            <div className="space-y-2">
              <Label>Sink resource</Label>
              <Input value={sinkResource} onChange={(e) => setSinkResource(e.target.value)} placeholder="lake.bronze.orders" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Sink options (JSON, optional)</Label>
            <Textarea
              value={sinkOptions}
              onChange={(e) => setSinkOptions(e.target.value)}
              placeholder='{"partition":"day"}'
              className="min-h-[52px] font-[family-name:var(--font-mono)] text-[0.78rem]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pl-desc">Description</Label>
            <Textarea id="pl-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          {optionError ? <p className="text-[0.8rem] text-[var(--down)]">{optionError}</p> : null}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button disabled={create.isPending || name.trim() === ""} onClick={submit}>
            {create.isPending ? "Creating" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
