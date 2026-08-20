"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type ApiError } from "@/lib/api/client";
import type { Paginated } from "@/lib/api/serving";

export interface Endpoint {
  kind: string;
  resource: string;
}

export interface CheckpointConfig {
  interval_ms: number;
  timeout_ms: number;
  min_pause_ms: number;
  max_concurrent: number;
}

export interface RestartStrategy {
  kind: string;
  attempts: number;
  delay_ms: number;
}

export interface Job {
  id: string;
  name: string;
  source: Endpoint;
  sink: Endpoint;
  delivery_guarantee: string;
  checkpoint_config: CheckpointConfig;
  restart_strategy: RestartStrategy;
  parallelism: number;
  contract_id: string | null;
  status: string;
  runtime_ref: string | null;
  savepoint_location: string | null;
  description: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface EndpointPayload {
  kind: string;
  resource: string;
}

export interface CheckpointPayload {
  interval_ms?: number;
  timeout_ms?: number;
  min_pause_ms?: number;
  max_concurrent?: number;
}

export interface RestartPayload {
  kind?: string;
  attempts?: number;
  delay_ms?: number;
}

export interface DefineJobRequest {
  name: string;
  source: EndpointPayload;
  sink: EndpointPayload;
  delivery_guarantee?: string;
  checkpoint?: CheckpointPayload;
  restart?: RestartPayload;
  parallelism?: number;
  contract_id?: string | null;
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

export const jobKeys = {
  all: ["jobs"] as const,
  list: (page: number, size: number, status?: string) =>
    ["jobs", "list", page, size, status] as const,
  detail: (id: string) => ["jobs", "detail", id] as const,
};

export function useJobs(params: { page?: number; size?: number; status?: string } = {}) {
  const { page = 1, size = 100, status } = params;
  return useQuery({
    queryKey: jobKeys.list(page, size, status),
    queryFn: () => api.get<Paginated<Job>>(`/api/v1/jobs${buildQuery({ page, size, status })}`),
  });
}

export function useJob(id: string) {
  return useQuery({
    queryKey: jobKeys.detail(id),
    queryFn: () => api.get<Job>(`/api/v1/jobs/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateJob() {
  const qc = useQueryClient();
  return useMutation<Job, ApiError, DefineJobRequest>({
    mutationFn: (body) => api.post<Job>("/api/v1/jobs", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: jobKeys.all }),
  });
}

function useJobAction(id: string, action: "submit" | "suspend" | "resume" | "cancel" | "savepoints") {
  const qc = useQueryClient();
  return useMutation<Job, ApiError, void>({
    mutationFn: () => api.post<Job>(`/api/v1/jobs/${id}/${action}`),
    onSuccess: async (updated) => {
      qc.setQueryData(jobKeys.detail(id), updated);
      await qc.refetchQueries({ queryKey: jobKeys.detail(id), exact: true });
      qc.invalidateQueries({ queryKey: jobKeys.all });
    },
  });
}

export const useSubmitJob = (id: string) => useJobAction(id, "submit");
export const useSuspendJob = (id: string) => useJobAction(id, "suspend");
export const useResumeJob = (id: string) => useJobAction(id, "resume");
export const useCancelJob = (id: string) => useJobAction(id, "cancel");
export const useTriggerSavepoint = (id: string) => useJobAction(id, "savepoints");

export function useChangeCheckpoint(id: string) {
  const qc = useQueryClient();
  return useMutation<Job, ApiError, CheckpointPayload>({
    mutationFn: (checkpoint) =>
      api.put<Job>(`/api/v1/jobs/${id}/checkpoint-config`, { checkpoint }),
    onSuccess: async (updated) => {
      qc.setQueryData(jobKeys.detail(id), updated);
      await qc.refetchQueries({ queryKey: jobKeys.detail(id), exact: true });
      qc.invalidateQueries({ queryKey: jobKeys.all });
    },
  });
}
