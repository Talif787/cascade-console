"use client";

import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResultsTable } from "@/components/common/results-table";
import { PlanView } from "@/components/copilot/plan-view";
import { statusTone } from "@/lib/format";
import type { AskResponse } from "@/lib/api/copilot";

export function AskResult({ result }: { result: AskResponse }) {
  const rejected = Boolean(result.rejection_reason);
  return (
    <Card>
      <CardHeader>
        <div className="min-w-0">
          <div className="eyebrow mb-1">{result.view_name || "Copilot"}</div>
          <CardTitle className="truncate">{result.question}</CardTitle>
        </div>
        <Badge tone={statusTone(result.status)}>{result.status}</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {rejected ? (
          <div className="flex items-start gap-2 rounded-lg border border-[color-mix(in_srgb,var(--warn)_35%,transparent)] bg-[color-mix(in_srgb,var(--warn)_10%,transparent)] p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--warn)]" />
            <div>
              <p className="text-sm font-medium">Copilot could not answer this</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{result.rejection_reason}</p>
            </div>
          </div>
        ) : null}

        {result.translated ? (
          <div>
            <div className="eyebrow mb-1.5">Translated plan</div>
            <PlanView plan={result.translated} />
          </div>
        ) : null}

        {result.columns.length > 0 ? (
          <div>
            <div className="eyebrow mb-1.5">Result</div>
            <ResultsTable
              columns={result.columns}
              rows={result.rows}
              rowCount={result.row_count}
              pageSize={10}
            />
          </div>
        ) : !rejected && result.translated ? (
          <p className="text-[0.82rem] text-muted-foreground">
            Plan generated without execution. Enable Run to execute against the view.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
