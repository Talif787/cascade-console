"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type ApiError } from "@/lib/api/client";
import type { Paginated } from "@/lib/api/serving";

export interface SchemaField {
  name: string;
  type: string;
  nullable: boolean;
  has_default: boolean;
  doc: string;
}

export interface SchemaFieldPayload {
  name: string;
  type: string;
  nullable?: boolean;
  has_default?: boolean;
  doc?: string;
}

export interface SchemaVersion {
  version: number;
  status: string;
  registry_id: number | null;
  created_at: string;
  fields: SchemaField[];
}

export interface Contract {
  id: string;
  name: string;
  schema_format: string;
  compatibility_mode: string;
  status: string;
  description: string;
  latest_version: number;
  version: number;
  created_at: string;
  updated_at: string;
  schema_versions: SchemaVersion[];
}

export interface SchemaPayload {
  fields: SchemaFieldPayload[];
}

export interface RegisterContractRequest {
  name: string;
  schema_format?: string;
  compatibility_mode?: string;
  schema: SchemaPayload;
  description?: string;
}

export interface CompatibilityReport {
  compatible: boolean;
  mode: string;
  violations: string[];
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

export const contractKeys = {
  all: ["contracts"] as const,
  list: (page: number, size: number, status?: string) =>
    ["contracts", "list", page, size, status] as const,
  detail: (id: string) => ["contracts", "detail", id] as const,
};

export function useContracts(params: { page?: number; size?: number; status?: string } = {}) {
  const { page = 1, size = 100, status } = params;
  return useQuery({
    queryKey: contractKeys.list(page, size, status),
    queryFn: () =>
      api.get<Paginated<Contract>>(`/api/v1/contracts${buildQuery({ page, size, status })}`),
  });
}

export function useContract(id: string) {
  return useQuery({
    queryKey: contractKeys.detail(id),
    queryFn: () => api.get<Contract>(`/api/v1/contracts/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateContract() {
  const qc = useQueryClient();
  return useMutation<Contract, ApiError, RegisterContractRequest>({
    mutationFn: (body) => api.post<Contract>("/api/v1/contracts", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: contractKeys.all }),
  });
}

export function usePublishVersion(id: string) {
  const qc = useQueryClient();
  return useMutation<SchemaVersion, ApiError, SchemaPayload>({
    mutationFn: (schema) =>
      api.post<SchemaVersion>(`/api/v1/contracts/${id}/versions`, { schema }),
    onSuccess: () => qc.invalidateQueries({ queryKey: contractKeys.detail(id) }),
  });
}

export function useCheckCompatibility(id: string) {
  return useMutation<CompatibilityReport, ApiError, SchemaPayload>({
    mutationFn: (schema) =>
      api.post<CompatibilityReport>(`/api/v1/contracts/${id}/compatibility`, { schema }),
  });
}

export function useChangeCompatibilityMode(id: string) {
  const qc = useQueryClient();
  return useMutation<Contract, ApiError, string>({
    mutationFn: (compatibility_mode) =>
      api.put<Contract>(`/api/v1/contracts/${id}/compatibility-mode`, { compatibility_mode }),
    onSuccess: async (updated) => {
      qc.setQueryData(contractKeys.detail(id), updated);
      await qc.refetchQueries({ queryKey: contractKeys.detail(id), exact: true });
      qc.invalidateQueries({ queryKey: contractKeys.all });
    },
  });
}

export function useDeprecateContract(id: string) {
  const qc = useQueryClient();
  return useMutation<Contract, ApiError, void>({
    mutationFn: () => api.post<Contract>(`/api/v1/contracts/${id}/deprecate`),
    onSuccess: async (updated) => {
      qc.setQueryData(contractKeys.detail(id), updated);
      await qc.refetchQueries({ queryKey: contractKeys.detail(id), exact: true });
      qc.invalidateQueries({ queryKey: contractKeys.all });
    },
  });
}

export function useDeprecateVersion(id: string) {
  const qc = useQueryClient();
  return useMutation<Contract, ApiError, number>({
    mutationFn: (version) =>
      api.post<Contract>(`/api/v1/contracts/${id}/versions/${version}/deprecate`),
    onSuccess: async (updated) => {
      qc.setQueryData(contractKeys.detail(id), updated);
      await qc.refetchQueries({ queryKey: contractKeys.detail(id), exact: true });
      qc.invalidateQueries({ queryKey: contractKeys.all });
    },
  });
}
