"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import type { JsonSchema, JsonSchemaProp } from "@/lib/api/mcp";

export type FieldValues = Record<string, string | boolean>;

function isJsonField(prop: JsonSchemaProp): boolean {
  // Arrays of objects and nested objects are entered as raw JSON.
  if (prop.type === "object") return true;
  if (prop.type === "array" && (prop.items?.type ?? "object") === "object") return true;
  return false;
}

function isStringArray(prop: JsonSchemaProp): boolean {
  return prop.type === "array" && prop.items?.type === "string";
}

export function initialValues(schema: JsonSchema): FieldValues {
  const out: FieldValues = {};
  for (const [name, prop] of Object.entries(schema.properties ?? {})) {
    out[name] = prop.type === "boolean" ? false : "";
  }
  return out;
}

export interface BuildResult {
  ok: boolean;
  args: Record<string, unknown>;
  error?: string;
}

/** Assemble the arguments object, coercing each field by its schema type. */
export function buildArgs(schema: JsonSchema, values: FieldValues): BuildResult {
  const args: Record<string, unknown> = {};
  const required = new Set(schema.required ?? []);

  for (const [name, prop] of Object.entries(schema.properties ?? {})) {
    const raw = values[name];

    if (prop.type === "boolean") {
      if (raw === true) args[name] = true;
      continue;
    }

    const str = String(raw ?? "").trim();
    if (str === "") {
      if (required.has(name)) return { ok: false, args: {}, error: `${name} is required.` };
      continue;
    }

    if (prop.type === "integer" || prop.type === "number") {
      const n = Number(str);
      if (Number.isNaN(n)) return { ok: false, args: {}, error: `${name} must be a number.` };
      args[name] = n;
    } else if (isStringArray(prop)) {
      args[name] = str
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (isJsonField(prop)) {
      try {
        args[name] = JSON.parse(str);
      } catch {
        return { ok: false, args: {}, error: `${name} must be valid JSON.` };
      }
    } else {
      args[name] = str;
    }
  }

  return { ok: true, args };
}

function fieldHint(prop: JsonSchemaProp): string {
  if (isStringArray(prop)) return "one value per line";
  if (isJsonField(prop)) return "JSON";
  if (prop.type === "integer" || prop.type === "number") return "number";
  return prop.type ?? "string";
}

export function SchemaForm({
  schema,
  values,
  onChange,
}: {
  schema: JsonSchema;
  values: FieldValues;
  onChange: (v: FieldValues) => void;
}) {
  const props = Object.entries(schema.properties ?? {});
  const required = new Set(schema.required ?? []);

  if (props.length === 0) {
    return <p className="text-[0.82rem] text-muted-foreground">This tool takes no arguments.</p>;
  }

  function set(name: string, value: string | boolean) {
    onChange({ ...values, [name]: value });
  }

  return (
    <div className="space-y-3">
      {props.map(([name, prop]) => {
        const label = (
          <Label htmlFor={`arg-${name}`} className="flex items-center gap-1.5">
            <span className="tnum">{name}</span>
            {required.has(name) ? <span className="text-[var(--down)]">*</span> : null}
            <span className="text-[0.7rem] font-normal text-muted-foreground">({fieldHint(prop)})</span>
          </Label>
        );

        if (prop.type === "boolean") {
          return (
            <label key={name} className="flex items-center gap-2">
              <Checkbox
                checked={values[name] === true}
                onCheckedChange={(v) => set(name, Boolean(v))}
              />
              <span className="tnum text-[0.85rem]">{name}</span>
            </label>
          );
        }

        if (isStringArray(prop) || isJsonField(prop)) {
          return (
            <div key={name} className="space-y-1.5">
              {label}
              <Textarea
                id={`arg-${name}`}
                value={String(values[name] ?? "")}
                onChange={(e) => set(name, e.target.value)}
                placeholder={isJsonField(prop) ? '[{"column":"revenue","aggregation":"sum"}]' : "region\nday"}
                className="min-h-[64px] font-[family-name:var(--font-mono)] text-[0.78rem]"
              />
            </div>
          );
        }

        return (
          <div key={name} className="space-y-1.5">
            {label}
            <Input
              id={`arg-${name}`}
              type={prop.type === "integer" || prop.type === "number" ? "number" : "text"}
              value={String(values[name] ?? "")}
              onChange={(e) => set(name, e.target.value)}
            />
          </div>
        );
      })}
    </div>
  );
}
