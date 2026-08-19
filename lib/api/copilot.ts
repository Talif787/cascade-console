"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { api, type ApiError } from "@/lib/api/client";
import type { Paginated } from "@/lib/api/serving";

export interface TranslatedMeasure {
  column: string;
  aggregation: string;
}

export interface TranslatedFilter {
  column: string;
  op: string;
  values: string[];
}

export interface TranslatedQuery {
  dimensions: string[];
  measures: TranslatedMeasure[];
  filters: TranslatedFilter[];
  limit: number;
}

export interface AskRequest {
  question: string;
  view_id?: string | null;
  view_name?: string | null;
  execute?: boolean;
}

export interface AskResponse {
  id: string;
  question: string;
  view_id: string;
  view_name: string;
  status: string;
  translated: TranslatedQuery | null;
  rejection_reason: string | null;
  columns: string[];
  rows: Record<string, unknown>[];
  row_count: number | null;
}

export interface CopilotQuery {
  id: string;
  question: string;
  view_id: string;
  view_name: string;
  status: string;
  translated: TranslatedQuery | null;
  rejection_reason: string | null;
  row_count: number | null;
  created_at: string;
  updated_at: string;
}

export interface ListQueriesParams {
  view_id?: string;
  status?: string;
  page?: number;
  size?: number;
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

export const copilotKeys = {
  all: ["copilot"] as const,
  queries: (params: ListQueriesParams) => ["copilot", "queries", params] as const,
};

export function useAsk() {
  return useMutation<AskResponse, ApiError, AskRequest>({
    mutationFn: (body: AskRequest) => api.post<AskResponse>("/api/v1/copilot/ask", body),
  });
}

export function useCopilotQueries(params: ListQueriesParams = {}) {
  const { page = 1, size = 10, view_id, status } = params;
  return useQuery({
    queryKey: copilotKeys.queries({ page, size, view_id, status }),
    queryFn: () =>
      api.get<Paginated<CopilotQuery>>(
        `/api/v1/copilot/queries${buildQuery({ page, size, view_id, status })}`,
      ),
  });
}
