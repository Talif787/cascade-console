"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type ApiError } from "@/lib/api/client";
import type { Paginated } from "@/lib/api/serving";

export interface DeadLetterPolicy {
  on_failure: string;
  dlq_topic: string | null;
  max_retries: number;
  tolerance: number;
}

export interface Source {
  id: string;
  name: string;
  connector_kind: string;
  config: Record<string, unknown>;
  contract_id: string;
  pipeline_id: string | null;
  status: string;
  dead_letter_policy: DeadLetterPolicy;
  dead_letter_count: number;
  runtime_ref: string | null;
  description: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface DeadLetterPolicyPayload {
  on_failure?: string;
  dlq_topic?: string | null;
  max_retries?: number;
  tolerance?: number;
}

export interface RegisterSourceRequest {
  name: string;
  connector_kind: string;
  config?: Record<string, unknown>;
  contract_id: string;
  pipeline_id?: string | null;
  dead_letter?: DeadLetterPolicyPayload;
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

export const sourceKeys = {
  all: ["sources"] as const,
  list: (page: number, size: number, status?: string) =>
    ["sources", "list", page, size, status] as const,
  detail: (id: string) => ["sources", "detail", id] as const,
};

export function useSources(params: { page?: number; size?: number; status?: string } = {}) {
  const { page = 1, size = 100, status } = params;
  return useQuery({
    queryKey: sourceKeys.list(page, size, status),
    queryFn: () =>
      api.get<Paginated<Source>>(`/api/v1/sources${buildQuery({ page, size, status })}`),
  });
}

export function useSource(id: string) {
  return useQuery({
    queryKey: sourceKeys.detail(id),
    queryFn: () => api.get<Source>(`/api/v1/sources/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateSource() {
  const qc = useQueryClient();
  return useMutation<Source, ApiError, RegisterSourceRequest>({
    mutationFn: (body) => api.post<Source>("/api/v1/sources", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: sourceKeys.all }),
  });
}

function useSourceAction(id: string, action: "provision" | "pause" | "resume" | "decommission") {
  const qc = useQueryClient();
  return useMutation<Source, ApiError, void>({
    mutationFn: () => api.post<Source>(`/api/v1/sources/${id}/${action}`),
    onSuccess: async (updated) => {
      qc.setQueryData(sourceKeys.detail(id), updated);
      await qc.refetchQueries({ queryKey: sourceKeys.detail(id), exact: true });
      qc.invalidateQueries({ queryKey: sourceKeys.all });
    },
  });
}

export const useProvisionSource = (id: string) => useSourceAction(id, "provision");
export const usePauseSource = (id: string) => useSourceAction(id, "pause");
export const useResumeSource = (id: string) => useSourceAction(id, "resume");
export const useDecommissionSource = (id: string) => useSourceAction(id, "decommission");

export function useChangeDeadLetterPolicy(id: string) {
  const qc = useQueryClient();
  return useMutation<Source, ApiError, DeadLetterPolicyPayload>({
    mutationFn: (dead_letter) =>
      api.put<Source>(`/api/v1/sources/${id}/dead-letter-policy`, { dead_letter }),
    onSuccess: async (updated) => {
      qc.setQueryData(sourceKeys.detail(id), updated);
      await qc.refetchQueries({ queryKey: sourceKeys.detail(id), exact: true });
      qc.invalidateQueries({ queryKey: sourceKeys.all });
    },
  });
}

export function useRecordDeadLetters(id: string) {
  const qc = useQueryClient();
  return useMutation<Source, ApiError, number>({
    mutationFn: (count) =>
      api.post<Source>(`/api/v1/sources/${id}/dead-letters`, { count }),
    onSuccess: async (updated) => {
      qc.setQueryData(sourceKeys.detail(id), updated);
      await qc.refetchQueries({ queryKey: sourceKeys.detail(id), exact: true });
      qc.invalidateQueries({ queryKey: sourceKeys.all });
    },
  });
}
