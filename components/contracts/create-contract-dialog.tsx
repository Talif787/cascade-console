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
import {
  SchemaFieldEditor,
  emptyField,
  toPayload,
  type FieldRow,
} from "@/components/contracts/schema-field-editor";
import { useCreateContract } from "@/lib/api/contracts";
import type { ApiError } from "@/lib/api/client";

export function CreateContractDialog() {
  const create = useCreateContract();
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [format, setFormat] = React.useState("avro");
  const [mode, setMode] = React.useState("backward");
  const [description, setDescription] = React.useState("");
  const [rows, setRows] = React.useState<FieldRow[]>([emptyField()]);

  function submit() {
    create.mutate(
      {
        name,
        schema_format: format,
        compatibility_mode: mode,
        description,
        schema: { fields: toPayload(rows) },
      },
      {
        onSuccess: () => {
          toast.success("Contract created");
          setOpen(false);
          setName("");
          setDescription("");
          setRows([emptyField()]);
        },
        onError: (e) => toast.error("Create failed", { description: (e as ApiError)?.detail }),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4" /> New contract
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Register data contract</DialogTitle>
          <DialogDescription>Define the schema and compatibility rules.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ct-name">Name</Label>
            <Input id="ct-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="orders.v1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Schema format</Label>
              <Input value={format} onChange={(e) => setFormat(e.target.value)} placeholder="avro" />
            </div>
            <div className="space-y-2">
              <Label>Compatibility mode</Label>
              <Input value={mode} onChange={(e) => setMode(e.target.value)} placeholder="backward" />
            </div>
          </div>
          <SchemaFieldEditor rows={rows} onChange={setRows} />
          <div className="space-y-2">
            <Label htmlFor="ct-desc">Description</Label>
            <Textarea id="ct-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
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
