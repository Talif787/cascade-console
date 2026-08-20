"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCreateSource } from "@/lib/api/sources";
import { useContracts } from "@/lib/api/contracts";
import type { ApiError } from "@/lib/api/client";

function parseConfig(raw: string): Record<string, unknown> | null {
  if (raw.trim() === "") return {};
  try {
    const v = JSON.parse(raw);
    return v && typeof v === "object" ? v : null;
  } catch {
    return null;
  }
}

export function CreateSourceDialog() {
  const create = useCreateSource();
  const contracts = useContracts();
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [kind, setKind] = React.useState("kafka_topic");
  const [contractId, setContractId] = React.useState("");
  const [config, setConfig] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [onFailure, setOnFailure] = React.useState("dead_letter");
  const [dlqTopic, setDlqTopic] = React.useState("");
  const [maxRetries, setMaxRetries] = React.useState(3);
  const [tolerance, setTolerance] = React.useState(10);
  const [configError, setConfigError] = React.useState<string | null>(null);
  const [policyError, setPolicyError] = React.useState<string | null>(null);

  const contractItems = contracts.data?.items ?? [];

  function submit() {
    const cfg = parseConfig(config);
    if (cfg === null) {
      setConfigError("Config must be a valid JSON object.");
      return;
    }
    setConfigError(null);
    if (onFailure === "dead_letter" && dlqTopic.trim() === "") {
      setPolicyError("A dead-letter topic is required when on-failure is dead_letter.");
      return;
    }
    setPolicyError(null);
    create.mutate(
      {
        name,
        connector_kind: kind,
        contract_id: contractId,
        config: cfg,
        description,
        dead_letter: {
          on_failure: onFailure,
          dlq_topic: dlqTopic.trim() === "" ? null : dlqTopic,
          max_retries: maxRetries,
          tolerance,
        },
      },
      {
        onSuccess: () => {
          toast.success("Source registered");
          setOpen(false);
          setName("");
          setConfig("");
          setDescription("");
          setDlqTopic("");
        },
        onError: (e) => toast.error("Create failed", { description: (e as ApiError)?.detail }),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4" /> New source
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Register ingestion source</DialogTitle>
          <DialogDescription>
            A source ingests into the platform against a governing data contract.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="src-name">Name</Label>
            <Input id="src-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="orders-ingest" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Connector kind</Label>
              <Input value={kind} onChange={(e) => setKind(e.target.value)} placeholder="kafka_topic" />
            </div>
            <div className="space-y-2">
              <Label>Contract</Label>
              <Select value={contractId} onValueChange={setContractId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a contract" />
                </SelectTrigger>
                <SelectContent>
                  {contractItems.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Config (JSON, optional)</Label>
            <Textarea
              value={config}
              onChange={(e) => setConfig(e.target.value)}
              placeholder='{"topic":"orders","group":"cascade"}'
              className="min-h-[56px] font-[family-name:var(--font-mono)] text-[0.78rem]"
            />
          </div>
          <div className="rounded-lg border p-3">
            <div className="eyebrow mb-2">Dead-letter policy</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>On failure</Label>
                <Input value={onFailure} onChange={(e) => setOnFailure(e.target.value)} placeholder="dead_letter" />
              </div>
              <div className="space-y-2">
                <Label>DLQ topic</Label>
                <Input value={dlqTopic} onChange={(e) => setDlqTopic(e.target.value)} placeholder="orders.dlq" />
              </div>
              <div className="space-y-2">
                <Label>Max retries</Label>
                <Input type="number" min={0} value={maxRetries} onChange={(e) => setMaxRetries(Number(e.target.value) || 0)} />
              </div>
              <div className="space-y-2">
                <Label>Tolerance</Label>
                <Input type="number" min={0} value={tolerance} onChange={(e) => setTolerance(Number(e.target.value) || 0)} />
              </div>
            </div>
            {policyError ? <p className="mt-2 text-[0.8rem] text-[var(--down)]">{policyError}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="src-desc">Description</Label>
            <Textarea id="src-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          {configError ? <p className="text-[0.8rem] text-[var(--down)]">{configError}</p> : null}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button disabled={create.isPending || name.trim() === "" || contractId === ""} onClick={submit}>
            {create.isPending ? "Registering" : "Register"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
