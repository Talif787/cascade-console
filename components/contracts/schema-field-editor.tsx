"use client";

import * as React from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { SchemaField, SchemaFieldPayload } from "@/lib/api/contracts";

export interface FieldRow extends SchemaFieldPayload {
  key: string;
}

let counter = 0;
const nextKey = () => `f${counter++}`;

export function emptyField(): FieldRow {
  return { key: nextKey(), name: "", type: "string", nullable: false, has_default: false, doc: "" };
}

/** Convert an existing version's fields into editable rows with fresh keys. */
export function fieldsToRows(fields: SchemaField[]): FieldRow[] {
  return fields.map((f) => ({
    key: nextKey(),
    name: f.name,
    type: f.type,
    nullable: f.nullable,
    has_default: f.has_default,
    doc: f.doc,
  }));
}

export function toPayload(rows: FieldRow[]): SchemaFieldPayload[] {
  return rows
    .filter((r) => r.name.trim() !== "")
    .map(({ name, type, nullable, has_default, doc }) => ({ name, type, nullable, has_default, doc }));
}

export function SchemaFieldEditor({
  rows,
  onChange,
}: {
  rows: FieldRow[];
  onChange: (rows: FieldRow[]) => void;
}) {
  function update(key: string, patch: Partial<FieldRow>) {
    onChange(rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Schema fields</Label>
        <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => onChange([...rows, emptyField()])}>
          <Plus className="h-3.5 w-3.5" /> Add field
        </Button>
      </div>
      {rows.length === 0 ? (
        <p className="text-[0.78rem] text-muted-foreground">No fields. Add at least one.</p>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <div key={r.key} className="flex items-center gap-1.5">
              <Input
                value={r.name}
                onChange={(e) => update(r.key, { name: e.target.value })}
                placeholder="field_name"
                className="h-8 flex-1"
              />
              <Input
                value={r.type}
                onChange={(e) => update(r.key, { type: e.target.value })}
                placeholder="type"
                className="h-8 w-28"
              />
              <label className="flex items-center gap-1 text-[0.72rem] text-muted-foreground">
                <Checkbox
                  checked={r.nullable}
                  onCheckedChange={(v) => update(r.key, { nullable: Boolean(v) })}
                />
                null
              </label>
              <label className="flex items-center gap-1 text-[0.72rem] text-muted-foreground">
                <Checkbox
                  checked={r.has_default}
                  onCheckedChange={(v) => update(r.key, { has_default: Boolean(v) })}
                />
                default
              </label>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => onChange(rows.filter((x) => x.key !== r.key))}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
