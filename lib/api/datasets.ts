"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { Paginated } from "@/lib/api/serving";

export interface DatasetUpstream {
  id: string;
  name: string;
  layer: string;
}

export interface Dataset {
  id: string;
  name: string;
  layer: string;
  status: string;
  upstreams: DatasetUpstream[];
  description: string;
}

export function useDatasets() {
  return useQuery({
    queryKey: ["datasets", "list"],
    queryFn: () => api.get<Paginated<Dataset>>("/api/v1/datasets?size=100"),
  });
}
