"use client";

import * as React from "react";
import { toast } from "sonner";
import { Play, Plus, X, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/common/states";
import { ResultsTable } from "@/components/common/results-table";
import type { ApiError } from "@/lib/api/client";
import {
  useRunQuery,
  useSyncView,
  type Column,
  type FilterPayload,
  type MeasurePayload,
  type ServingView,
} from "@/lib/api/serving";

// These vocabularies are not enumerated in the OpenAPI, so they are sensible
// defaults; the backend validates and any mismatch surfaces inline below.
const AGGREGATIONS = ["count", "sum", "avg", "min", "max"];
const OPERATORS = ["eq", "ne", "gt", "gte", "lt", "lte", "in"];

interface MeasureRow extends MeasurePayload {
  key: string;
}
interface FilterRow extends FilterPayload {
  key: string;
}

let counter = 0;
const nextKey = () => `r${counter++}`;

export function QueryBuilder({ view }: { view: ServingView }) {
  const columns = view.columns;
  const [dimensions, setDimensions] = React.useState<string[]>([]);
  const [measures, setMeasures] = React.useState<MeasureRow[]>([]);
  const [filters, setFilters] = React.useState<FilterRow[]>([]);
  const [limit, setLimit] = React.useState<number>(100);

  const run = useRunQuery(view.id);

  if (view.status !== "ready") {
    return <NotQueryable view={view} />;
  }

  function toggleDimension(name: string) {
    setDimensions((d) => (d.includes(name) ? d.filter((x) => x !== name) : [...d, name]));
  }

  function addMeasure() {
    const first = columns[0]?.name ?? "";
    setMeasures((m) => [...m, { key: nextKey(), column: first, aggregation: "sum" }]);
  }
  function addFilter() {
    const first = columns[0]?.name ?? "";
    setFilters((f) => [...f, { key: nextKey(), column: first, op: "eq", values: [""] }]);
  }

  function submit() {
    run.mutate({
      dimensions,
      measures: measures.map(({ column, aggregation }) => ({ column, aggregation })),
      filters: filters.map(({ column, op, values }) => ({
        column,
        op,
        values: values.filter((v) => v !== ""),
      })),
      limit,
    });
  }

  const hasSelection = dimensions.length > 0 || measures.length > 0;
  const err = run.error as ApiError | null;

  return (
    <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
      <Card className="self-start">
        <CardHeader>
          <div>
            <div className="eyebrow mb-1">Compose</div>
            <CardTitle>Query</CardTitle>
          </div>
          <Button size="sm" onClick={submit} disabled={run.isPending || !hasSelection}>
            <Play className="h-4 w-4" />
            {run.isPending ? "Running" : "Run"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>Dimensions</Label>
            <div className="flex flex-wrap gap-1.5">
              {columns.map((c: Column) => {
                const active = dimensions.includes(c.name);
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => toggleDimension(c.name)}
                    className={
                      "tnum rounded-full border px-2.5 py-1 text-[0.72rem] transition-colors " +
                      (active
                        ? "border-transparent bg-primary text-primary-foreground"
                        : "border-input text-muted-foreground hover:bg-accent hover:text-accent-foreground")
                    }
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Measures</Label>
              <Button variant="ghost" size="sm" onClick={addMeasure} className="h-7 px-2">
                <Plus className="h-3.5 w-3.5" /> Add
              </Button>
            </div>
            {measures.length === 0 ? (
              <p className="text-[0.78rem] text-muted-foreground">No measures. Add one to aggregate.</p>
            ) : (
              <div className="space-y-2">
                {measures.map((m) => (
                  <div key={m.key} className="flex items-center gap-1.5">
                    <Select
                      value={m.aggregation}
                      onValueChange={(v) =>
                        setMeasures((rows) => rows.map((r) => (r.key === m.key ? { ...r, aggregation: v } : r)))
                      }
                    >
                      <SelectTrigger className="h-8 w-[90px] shrink-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AGGREGATIONS.map((a) => (
                          <SelectItem key={a} value={a}>
                            {a}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={m.column}
                      onValueChange={(v) =>
                        setMeasures((rows) => rows.map((r) => (r.key === m.key ? { ...r, column: v } : r)))
                      }
                    >
                      <SelectTrigger className="h-8 flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {columns.map((c) => (
                          <SelectItem key={c.name} value={c.name}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => setMeasures((rows) => rows.filter((r) => r.key !== m.key))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Filters</Label>
              <Button variant="ghost" size="sm" onClick={addFilter} className="h-7 px-2">
                <Plus className="h-3.5 w-3.5" /> Add
              </Button>
            </div>
            {filters.length === 0 ? (
              <p className="text-[0.78rem] text-muted-foreground">No filters.</p>
            ) : (
              <div className="space-y-2">
                {filters.map((f) => (
                  <div key={f.key} className="flex items-center gap-1.5">
                    <Select
                      value={f.column}
                      onValueChange={(v) =>
                        setFilters((rows) => rows.map((r) => (r.key === f.key ? { ...r, column: v } : r)))
                      }
                    >
                      <SelectTrigger className="h-8 flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {columns.map((c) => (
                          <SelectItem key={c.name} value={c.name}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={f.op}
                      onValueChange={(v) =>
                        setFilters((rows) => rows.map((r) => (r.key === f.key ? { ...r, op: v } : r)))
                      }
                    >
                      <SelectTrigger className="h-8 w-[76px] shrink-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {OPERATORS.map((o) => (
                          <SelectItem key={o} value={o}>
                            {o}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      value={f.values.join(",")}
                      onChange={(e) =>
                        setFilters((rows) =>
                          rows.map((r) =>
                            r.key === f.key ? { ...r, values: e.target.value.split(",").map((s) => s.trim()) } : r,
                          ),
                        )
                      }
                      placeholder="value"
                      className="h-8 flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => setFilters((rows) => rows.filter((r) => r.key !== f.key))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="limit">Limit</Label>
            <Input
              id="limit"
              type="number"
              min={1}
              value={limit}
              onChange={(e) => setLimit(Math.max(1, Number(e.target.value) || 1))}
              className="h-8 w-28"
            />
          </div>
        </CardContent>
      </Card>

      <div className="min-w-0">
        {err ? (
          <div className="mb-4 rounded-lg border border-[color-mix(in_srgb,var(--down)_35%,transparent)] bg-[color-mix(in_srgb,var(--down)_10%,transparent)] p-4">
            <div className="mb-1 flex items-center gap-2 text-sm font-medium text-[var(--down)]">
              <AlertTriangle className="h-4 w-4" />
              Query rejected {err.status ? `(${err.status})` : ""}
            </div>
            <p className="text-sm text-muted-foreground">{err.detail}</p>
            {err.issues && err.issues.length > 0 ? (
              <ul className="mt-2 space-y-1">
                {err.issues.map((iss, i) => (
                  <li key={i} className="tnum text-[0.78rem] text-muted-foreground">
                    {iss.loc.join(".")}: {iss.msg}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        {run.data ? (
          <ResultsTable columns={run.data.columns} rows={run.data.rows} rowCount={run.data.row_count} />
        ) : !err ? (
          <EmptyState
            title="No results yet"
            description="Pick dimensions or add a measure, then Run to query this view through the control plane."
            icon={<Play className="h-6 w-6" />}
          />
        ) : null}
      </div>
    </div>
  );
}

function NotQueryable({ view }: { view: ServingView }) {
  const sync = useSyncView(view.id);
  return (
    <EmptyState
      title="This view is not queryable yet"
      description={`Its status is "${view.status}". Sync it to materialize the view, then build and run analytics queries here.`}
      icon={<RefreshCw className="h-6 w-6" />}
      action={
        <Button
          onClick={() =>
            sync.mutate(undefined, {
              onSuccess: () => toast.success("Sync complete"),
              onError: (e) => toast.error("Sync failed", { description: (e as ApiError)?.detail }),
            })
          }
          disabled={sync.isPending}
        >
          <RefreshCw className="h-4 w-4" /> {sync.isPending ? "Syncing" : "Sync now"}
        </Button>
      }
    />
  );
}
