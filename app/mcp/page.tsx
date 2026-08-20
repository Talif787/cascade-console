"use client";

import * as React from "react";
import { Plug, Code2 } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ToolCard } from "@/components/mcp/tool-card";
import { RawConsole } from "@/components/mcp/raw-console";
import { useMcpTools, useMcpServer } from "@/lib/api/mcp";

export default function McpPage() {
  const { data: tools, isLoading, isError, error } = useMcpTools();
  const server = useMcpServer();
  const [rawOpen, setRawOpen] = React.useState(false);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Governed agent surface"
        title="MCP tools"
        description="The governed data tools an agent can call over the Model Context Protocol. Each tool runs through the same policy and validation as the rest of the control plane."
        actions={
          <div className="flex items-center gap-2">
            {server.data ? (
              <Badge tone="neutral">
                {server.data.serverInfo.name} v{server.data.serverInfo.version}
              </Badge>
            ) : null}
            <Button variant="outline" size="sm" onClick={() => setRawOpen(true)}>
              <Code2 className="h-4 w-4" /> Raw JSON-RPC
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <TableSkeleton rows={4} />
      ) : isError ? (
        <ErrorState error={error} title="Could not list tools" />
      ) : !tools || tools.length === 0 ? (
        <EmptyState
          title="No tools exposed"
          description="The MCP endpoint returned no tools. Confirm the governed agent surface is enabled on the control plane."
          icon={<Plug className="h-6 w-6" />}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <ToolCard key={tool.name} tool={tool} />
          ))}
        </div>
      )}

      <RawConsole open={rawOpen} onOpenChange={setRawOpen} />
    </div>
  );
}
