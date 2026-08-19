"use client";

import * as React from "react";
import { ShieldCheck, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { useCheckCompatibility, type SchemaField } from "@/lib/api/contracts";

export function CompatibilityDialog({
  contractId,
  baseFields,
}: {
  contractId: string;
  baseFields: SchemaField[];
}) {
  const check = useCheckCompatibility(contractId);
  const [open, setOpen] = React.useState(false);
  const [rows, setRows] = React.useState<FieldRow[]>([emptyField()]);

  function handleOpen(o: boolean) {
    setOpen(o);
    if (o) {
      setRows(baseFields.length ? fieldsToRows(baseFields) : [emptyField()]);
      check.reset();
    } else {
      check.reset();
    }
  }

  const report = check.data;

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <ShieldCheck className="h-4 w-4" /> Check compatibility
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Check schema compatibility</DialogTitle>
          <DialogDescription>
            Prefilled from the current schema. Edit a candidate and check it against the contract
            without publishing.
          </DialogDescription>
        </DialogHeader>
        <SchemaFieldEditor rows={rows} onChange={setRows} />

        {report ? (
          <div
            className={
              "rounded-lg border p-3 " +
              (report.compatible
                ? "border-[color-mix(in_srgb,var(--ok)_35%,transparent)] bg-[color-mix(in_srgb,var(--ok)_10%,transparent)]"
                : "border-[color-mix(in_srgb,var(--down)_35%,transparent)] bg-[color-mix(in_srgb,var(--down)_10%,transparent)]")
            }
          >
            <div className="flex items-center gap-2 text-sm font-medium">
              {report.compatible ? (
                <CheckCircle2 className="h-4 w-4 text-[var(--ok)]" />
              ) : (
                <XCircle className="h-4 w-4 text-[var(--down)]" />
              )}
              {report.compatible ? "Compatible" : "Incompatible"}
              <Badge tone="neutral">{report.mode}</Badge>
            </div>
            {report.violations.length > 0 ? (
              <ul className="mt-2 space-y-1">
                {report.violations.map((v, i) => (
                  <li key={i} className="text-[0.8rem] text-muted-foreground">
                    {v}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Close
          </Button>
          <Button disabled={check.isPending} onClick={() => check.mutate({ fields: toPayload(rows) })}>
            {check.isPending ? "Checking" : "Check"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
