"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { PageMeta, Paginated } from "@/lib/api/serving";

export interface Slo {
  id: string;
  name: string;
  asset_kind: string;
  asset_id: string;
  max_staleness_minutes: number;
  severity: string;
  owner: string;
  description: string;
  status: string;
  state: string;
  last_evaluated_at: string | null;
  last_staleness_minutes: number | null;
  breach_count: number;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface EvaluateAllResponse {
  evaluated: Slo[];
}

export interface CostLine {
  key: string;
  amount_cents: number;
}

export interface CostReport {
  total_cents: number;
  by_category: CostLine[];
  by_asset: CostLine[];
}

export interface LineageNode {
  kind: string;
  id: string;
  name: string;
  status: string;
}

export interface LineageEdge {
  from_ref: string;
  to_ref: string;
}

export interface Lineage {
  root: string;
  nodes: LineageNode[];
  edges: LineageEdge[];
}

export type { PageMeta };

export interface ListSlosParams {
  page?: number;
  size?: number;
  status?: string;
  state?: string;
  asset_kind?: string;
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

export const governanceKeys = {
  slos: ["governance", "slos"] as const,
  sloList: (params: ListSlosParams) => ["governance", "slos", "list", params] as const,
  sloDetail: (id: string) => ["governance", "slos", "detail", id] as const,
  costReport: (start?: string, end?: string) => ["governance", "costs", start, end] as const,
  lineage: (kind: string, id: string) => ["governance", "lineage", kind, id] as const,
};

export function useSlos(params: ListSlosParams = {}) {
  const { page = 1, size = 100, status, state, asset_kind } = params;
  return useQuery({
    queryKey: governanceKeys.sloList({ page, size, status, state, asset_kind }),
    queryFn: () =>
      api.get<Paginated<Slo>>(
        `/api/v1/governance/slos${buildQuery({ page, size, status, state, asset_kind })}`,
      ),
  });
}

export function useSlo(id: string) {
  return useQuery({
    queryKey: governanceKeys.sloDetail(id),
    queryFn: () => api.get<Slo>(`/api/v1/governance/slos/${id}`),
    enabled: Boolean(id),
  });
}

function useSloAction(id: string, action: "evaluate" | "suspend" | "resume" | "retire") {
  const qc = useQueryClient();
  return useMutation<Slo, import("@/lib/api/client").ApiError, void>({
    mutationFn: () => api.post<Slo>(`/api/v1/governance/slos/${id}/${action}`),
    onSuccess: (updated) => {
      qc.setQueryData(governanceKeys.sloDetail(id), updated);
      qc.invalidateQueries({ queryKey: governanceKeys.slos });
    },
  });
}

export const useEvaluateSlo = (id: string) => useSloAction(id, "evaluate");
export const useSuspendSlo = (id: string) => useSloAction(id, "suspend");
export const useResumeSlo = (id: string) => useSloAction(id, "resume");
export const useRetireSlo = (id: string) => useSloAction(id, "retire");

export function useChangeTarget(id: string) {
  const qc = useQueryClient();
  return useMutation<Slo, import("@/lib/api/client").ApiError, number>({
    mutationFn: (max_staleness_minutes: number) =>
      api.put<Slo>(`/api/v1/governance/slos/${id}/target`, { max_staleness_minutes }),
    onSuccess: (updated) => {
      qc.setQueryData(governanceKeys.sloDetail(id), updated);
      qc.invalidateQueries({ queryKey: governanceKeys.slos });
    },
  });
}

export function useEvaluateAll() {
  const qc = useQueryClient();
  return useMutation<EvaluateAllResponse, import("@/lib/api/client").ApiError, void>({
    mutationFn: () => api.post<EvaluateAllResponse>("/api/v1/governance/slos/evaluate"),
    onSuccess: () => qc.invalidateQueries({ queryKey: governanceKeys.slos }),
  });
}

export function useCostReport(windowStart?: string, windowEnd?: string) {
  return useQuery({
    queryKey: governanceKeys.costReport(windowStart, windowEnd),
    queryFn: () =>
      api.get<CostReport>(
        `/api/v1/governance/costs/report${buildQuery({ window_start: windowStart, window_end: windowEnd })}`,
      ),
  });
}

export function useLineage(assetKind: string, assetId: string) {
  return useQuery({
    queryKey: governanceKeys.lineage(assetKind, assetId),
    queryFn: () =>
      api.get<Lineage>(`/api/v1/governance/lineage/${assetKind}/${encodeURIComponent(assetId)}`),
    enabled: Boolean(assetKind && assetId),
  });
}
