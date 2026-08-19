"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type ApiError } from "@/lib/api/client";

export interface Column {
  name: string;
  type: string;
  role: string;
  nullable: boolean;
}

export interface ServingView {
  id: string;
  name: string;
  source_dataset_id: string;
  engine: string;
  columns: Column[];
  order_by: string[];
  partition_by: string | null;
  refresh_mode: string;
  refresh_cron: string;
  refresh_enabled: boolean;
  status: string;
  last_sync_ref: string | null;
  last_row_count: number | null;
  last_synced_at: string | null;
  description: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface PageMeta {
  page: number;
  size: number;
  total: number;
  pages: number;
}

export interface Paginated<T> {
  items: T[];
  meta: PageMeta;
}

export interface MeasurePayload {
  column: string;
  aggregation: string;
}

export interface FilterPayload {
  column: string;
  op: string;
  values: string[];
}

export interface RunQueryRequest {
  dimensions?: string[];
  measures?: MeasurePayload[];
  filters?: FilterPayload[];
  limit?: number;
}

export interface QueryResponse {
  columns: string[];
  rows: Record<string, unknown>[];
  row_count: number;
}

export interface CatalogEntry {
  id: string;
  name: string;
  engine: string;
  columns: Column[];
  last_synced_at: string | null;
  row_count: number | null;
}

export interface CatalogResponse {
  entries: CatalogEntry[];
}

export interface ListServingViewsParams {
  page?: number;
  size?: number;
  status?: string;
  engine?: string;
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

export const servingKeys = {
  all: ["serving-views"] as const,
  list: (params: ListServingViewsParams) => ["serving-views", "list", params] as const,
  detail: (id: string) => ["serving-views", "detail", id] as const,
  catalog: ["serving-views", "catalog"] as const,
};

export function useServingViews(params: ListServingViewsParams = {}) {
  const { page = 1, size = 100, status, engine } = params;
  return useQuery({
    queryKey: servingKeys.list({ page, size, status, engine }),
    queryFn: () =>
      api.get<Paginated<ServingView>>(
        `/api/v1/serving-views${buildQuery({ page, size, status, engine })}`,
      ),
  });
}

export function useServingView(id: string) {
  return useQuery({
    queryKey: servingKeys.detail(id),
    queryFn: () => api.get<ServingView>(`/api/v1/serving-views/${id}`),
    enabled: Boolean(id),
  });
}

export function useCatalog() {
  return useQuery({
    queryKey: servingKeys.catalog,
    queryFn: () => api.get<CatalogResponse>("/api/v1/serving-views/catalog"),
  });
}

export function useRunQuery(viewId: string) {
  return useMutation<QueryResponse, ApiError, RunQueryRequest>({
    mutationFn: (body: RunQueryRequest) =>
      api.post<QueryResponse>(`/api/v1/serving-views/${viewId}/query`, body),
  });
}

/** Lifecycle actions. Each returns the updated view and refreshes its detail. */
function useViewAction(viewId: string, action: "sync" | "reconcile" | "retire") {
  const qc = useQueryClient();
  return useMutation<ServingView, ApiError, void>({
    mutationFn: () => api.post<ServingView>(`/api/v1/serving-views/${viewId}/${action}`),
    onSuccess: (updated) => {
      qc.setQueryData(servingKeys.detail(viewId), updated);
      qc.invalidateQueries({ queryKey: servingKeys.all });
    },
  });
}

export const useSyncView = (id: string) => useViewAction(id, "sync");
export const useReconcileView = (id: string) => useViewAction(id, "reconcile");
export const useRetireView = (id: string) => useViewAction(id, "retire");
