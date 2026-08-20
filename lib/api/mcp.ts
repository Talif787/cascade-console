"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

export interface JsonSchemaProp {
  type?: string;
  items?: { type?: string };
  description?: string;
}

export interface JsonSchema {
  type?: string;
  properties?: Record<string, JsonSchemaProp>;
  required?: string[];
}

export interface McpTool {
  name: string;
  description: string;
  inputSchema: JsonSchema;
}

export interface JsonRpcError {
  code: number;
  message: string;
  data?: unknown;
}

export interface JsonRpcResponse<T = unknown> {
  jsonrpc: string;
  id: number | string | null;
  result?: T;
  error?: JsonRpcError;
}

export interface McpContentBlock {
  type: string;
  text?: string;
  [key: string]: unknown;
}

export interface ToolCallResult {
  content?: McpContentBlock[];
  isError?: boolean;
  [key: string]: unknown;
}

export interface ServerInfo {
  protocolVersion: string;
  serverInfo: { name: string; version: string };
  capabilities: Record<string, unknown>;
}

let rpcId = 0;

function rpc<T>(method: string, params: Record<string, unknown> = {}) {
  return api.post<JsonRpcResponse<T>>("/mcp", {
    jsonrpc: "2.0",
    id: ++rpcId,
    method,
    params,
  });
}

export const mcp = {
  initialize: () =>
    rpc<ServerInfo>("initialize", {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "cascade-console", version: "1.0" },
    }),
  listTools: () => rpc<{ tools: McpTool[] }>("tools/list"),
  callTool: (name: string, args: Record<string, unknown>) =>
    rpc<ToolCallResult>("tools/call", { name, arguments: args }),
  raw: (method: string, params: Record<string, unknown>) => rpc<unknown>(method, params),
};

export const mcpKeys = {
  server: ["mcp", "server"] as const,
  tools: ["mcp", "tools"] as const,
};

export function useMcpServer() {
  return useQuery({
    queryKey: mcpKeys.server,
    queryFn: async () => {
      const res = await mcp.initialize();
      if (res.error) throw new Error(res.error.message);
      return res.result as ServerInfo;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useMcpTools() {
  return useQuery({
    queryKey: mcpKeys.tools,
    queryFn: async () => {
      const res = await mcp.listTools();
      if (res.error) throw new Error(res.error.message);
      return res.result?.tools ?? [];
    },
  });
}

export function useCallTool() {
  return useMutation<JsonRpcResponse<ToolCallResult>, import("@/lib/api/client").ApiError, { name: string; args: Record<string, unknown> }>({
    mutationFn: ({ name, args }) => mcp.callTool(name, args),
  });
}

export function useRawRpc() {
  return useMutation<JsonRpcResponse<unknown>, import("@/lib/api/client").ApiError, { method: string; params: Record<string, unknown> }>({
    mutationFn: ({ method, params }) => mcp.raw(method, params),
  });
}
