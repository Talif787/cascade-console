"use client";

import * as React from "react";
import { toast } from "sonner";
import { GitBranchPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  fieldsToRows,
  toPayload,
  type FieldRow,
} from "@/components/contracts/schema-field-editor";
import { usePublishVersion, type SchemaField } from "@/lib/api/contracts";
import type { ApiError } from "@/lib/api/client";

export function PublishVersionDialog({
  contractId,
  baseFields,
}: {
  contractId: string;
  baseFields: SchemaField[];
}) {
  const publish = usePublishVersion(contractId);
  const [open, setOpen] = React.useState(false);
  const [rows, setRows] = React.useState<FieldRow[]>([emptyField()]);

  function seed() {
    setRows(baseFields.length ? fieldsToRows(baseFields) : [emptyField()]);
  }

  function handleOpen(o: boolean) {
    setOpen(o);
    if (o) seed();
  }

  function submit() {
    publish.mutate(
      { fields: toPayload(rows) },
      {
        onSuccess: (v) => {
          toast.success(`Published version ${v.version}`);
          setOpen(false);
        },
        onError: (e) => toast.error("Publish failed", { description: (e as ApiError)?.detail }),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <GitBranchPlus className="h-4 w-4" /> Publish version
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Publish schema version</DialogTitle>
          <DialogDescription>
            Prefilled from the current schema. Edit the fields, then publish; the new version is
            validated against the contract compatibility mode.
          </DialogDescription>
        </DialogHeader>
        <SchemaFieldEditor rows={rows} onChange={setRows} />
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button disabled={publish.isPending} onClick={submit}>
            {publish.isPending ? "Publishing" : "Publish"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
