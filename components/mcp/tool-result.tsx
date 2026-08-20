"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import type { JsonRpcResponse, ToolCallResult } from "@/lib/api/mcp";

function pretty(text: string): string {
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
}

export function ToolResult({ response }: { response: JsonRpcResponse<ToolCallResult> }) {
  if (response.error) {
    return (
      <div className="rounded-lg border border-[color-mix(in_srgb,var(--down)_35%,transparent)] bg-[color-mix(in_srgb,var(--down)_10%,transparent)] p-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <XCircle className="h-4 w-4 text-[var(--down)]" />
          Error {response.error.code}
        </div>
        <p className="mt-1 text-[0.82rem] text-muted-foreground">{response.error.message}</p>
      </div>
    );
  }

  const result = response.result;
  const blocks = result?.content ?? [];
  const isError = result?.isError === true;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium">
        {isError ? (
          <XCircle className="h-4 w-4 text-[var(--down)]" />
        ) : (
          <CheckCircle2 className="h-4 w-4 text-[var(--ok)]" />
        )}
        {isError ? "Tool reported an error" : "Result"}
      </div>
      {blocks.length > 0 ? (
        blocks.map((b, i) => (
          <pre
            key={i}
            className="max-h-80 overflow-auto rounded-lg border bg-card p-3 font-[family-name:var(--font-mono)] text-[0.75rem] leading-relaxed"
          >
            {b.type === "text" && typeof b.text === "string" ? pretty(b.text) : JSON.stringify(b, null, 2)}
          </pre>
        ))
      ) : (
        <pre className="max-h-80 overflow-auto rounded-lg border bg-card p-3 font-[family-name:var(--font-mono)] text-[0.75rem]">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
