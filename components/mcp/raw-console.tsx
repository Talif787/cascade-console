"use client";

import * as React from "react";
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
} from "@/components/ui/dialog";
import { useRawRpc } from "@/lib/api/mcp";

export function RawConsole({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const raw = useRawRpc();
  const [method, setMethod] = React.useState("tools/list");
  const [params, setParams] = React.useState("{}");
  const [paramError, setParamError] = React.useState<string | null>(null);

  function send() {
    let parsed: Record<string, unknown>;
    try {
      parsed = params.trim() === "" ? {} : JSON.parse(params);
    } catch {
      setParamError("Params must be valid JSON.");
      return;
    }
    setParamError(null);
    raw.mutate({ method, params: parsed });
  }

  const response = raw.data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-xl flex-col">
        <DialogHeader>
          <DialogTitle>Raw JSON-RPC</DialogTitle>
          <DialogDescription>
            Send any method to the governed MCP endpoint. Try initialize, tools/list, or tools/call.
          </DialogDescription>
        </DialogHeader>
        <div className="-mx-1 flex-1 space-y-3 overflow-y-auto px-1">
          <div className="space-y-1.5">
            <Label htmlFor="rpc-method">Method</Label>
            <Input id="rpc-method" value={method} onChange={(e) => setMethod(e.target.value)} className="tnum" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rpc-params">Params (JSON)</Label>
            <Textarea
              id="rpc-params"
              value={params}
              onChange={(e) => setParams(e.target.value)}
              className="min-h-[72px] font-[family-name:var(--font-mono)] text-[0.78rem]"
            />
            {paramError ? <p className="text-[0.8rem] text-[var(--down)]">{paramError}</p> : null}
          </div>
          {response ? (
            <pre className="max-h-72 overflow-auto rounded-lg border bg-card p-3 font-[family-name:var(--font-mono)] text-[0.74rem] leading-relaxed">
              {JSON.stringify(response, null, 2)}
            </pre>
          ) : null}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button disabled={raw.isPending} onClick={send}>
            {raw.isPending ? "Sending" : "Send"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
