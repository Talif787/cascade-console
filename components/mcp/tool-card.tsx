"use client";

import * as React from "react";
import { toast } from "sonner";
import { Play, Terminal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SchemaForm, initialValues, buildArgs, type FieldValues } from "@/components/mcp/schema-form";
import { ToolResult } from "@/components/mcp/tool-result";
import { useCallTool, type McpTool } from "@/lib/api/mcp";

export function ToolCard({ tool }: { tool: McpTool }) {
  const call = useCallTool();
  const [open, setOpen] = React.useState(false);
  const [values, setValues] = React.useState<FieldValues>(() => initialValues(tool.inputSchema));

  const argCount = Object.keys(tool.inputSchema.properties ?? {}).length;

  function handleOpen(o: boolean) {
    setOpen(o);
    if (o) {
      setValues(initialValues(tool.inputSchema));
      call.reset();
    }
  }

  function run() {
    const built = buildArgs(tool.inputSchema, values);
    if (!built.ok) {
      toast.error(built.error ?? "Invalid arguments");
      return;
    }
    call.mutate({ name: tool.name, args: built.args });
  }

  return (
    <>
      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="tnum text-[0.95rem]">{tool.name}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col justify-between gap-4">
          <p className="text-[0.82rem] text-muted-foreground">{tool.description}</p>
          <div className="flex items-center justify-between">
            <Badge tone="neutral">{argCount === 0 ? "no args" : `${argCount} args`}</Badge>
            <Button size="sm" variant="outline" onClick={() => handleOpen(true)}>
              <Play className="h-4 w-4" /> Run
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={handleOpen}>
        <DialogContent className="flex max-h-[85vh] max-w-lg flex-col">
          <DialogHeader>
            <DialogTitle className="tnum">{tool.name}</DialogTitle>
            <DialogDescription>{tool.description}</DialogDescription>
          </DialogHeader>
          <div className="-mx-1 flex-1 space-y-4 overflow-y-auto px-1">
            <SchemaForm schema={tool.inputSchema} values={values} onChange={setValues} />
            {call.data ? <ToolResult response={call.data} /> : null}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Close
            </Button>
            <Button disabled={call.isPending} onClick={run}>
              {call.isPending ? "Running" : "Call tool"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
