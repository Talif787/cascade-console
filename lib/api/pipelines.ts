"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type ApiError } from "@/lib/api/client";
import type { Paginated } from "@/lib/api/serving";

export interface Connector {
  type: string;
  resource: string;
  options: Record<string, unknown>;
}

export interface Pipeline {
  id: string;
  name: string;
  source: Connector;
  sink: Connector;
  status: string;
  description: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface ConnectorPayload {
  type: string;
  resource: string;
  options?: Record<string, unknown>;
}

export interface RegisterPipelineRequest {
  name: string;
  source: ConnectorPayload;
  sink: ConnectorPayload;
  description?: string;
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

export const pipelineKeys = {
  all: ["pipelines"] as const,
  list: (page: number, size: number, status?: string) =>
    ["pipelines", "list", page, size, status] as const,
  detail: (id: string) => ["pipelines", "detail", id] as const,
};

export function usePipelines(params: { page?: number; size?: number; status?: string } = {}) {
  const { page = 1, size = 100, status } = params;
  return useQuery({
    queryKey: pipelineKeys.list(page, size, status),
    queryFn: () =>
      api.get<Paginated<Pipeline>>(`/api/v1/pipelines${buildQuery({ page, size, status })}`),
  });
}

export function usePipeline(id: string) {
  return useQuery({
    queryKey: pipelineKeys.detail(id),
    queryFn: () => api.get<Pipeline>(`/api/v1/pipelines/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreatePipeline() {
  const qc = useQueryClient();
  return useMutation<Pipeline, ApiError, RegisterPipelineRequest>({
    mutationFn: (body) => api.post<Pipeline>("/api/v1/pipelines", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: pipelineKeys.all }),
  });
}

function usePipelineAction(id: string, action: "activate" | "pause" | "archive") {
  const qc = useQueryClient();
  return useMutation<Pipeline, ApiError, void>({
    mutationFn: () => api.post<Pipeline>(`/api/v1/pipelines/${id}/${action}`),
    onSuccess: async (updated) => {
      qc.setQueryData(pipelineKeys.detail(id), updated);
      await qc.refetchQueries({ queryKey: pipelineKeys.detail(id), exact: true });
      qc.invalidateQueries({ queryKey: pipelineKeys.all });
    },
  });
}

export const useActivatePipeline = (id: string) => usePipelineAction(id, "activate");
export const usePausePipeline = (id: string) => usePipelineAction(id, "pause");
export const useArchivePipeline = (id: string) => usePipelineAction(id, "archive");
