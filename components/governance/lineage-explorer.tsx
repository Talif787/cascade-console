"use client";

import * as React from "react";
import { Waypoints } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/common/states";
import { LineageGraph } from "@/components/governance/lineage-graph";
import { useDatasets } from "@/lib/api/datasets";
import { useLineage } from "@/lib/api/governance";

// Datasets carry upstream references, so they are the natural entry point for
// lineage. The asset kind for a dataset is passed as the path segment.
const ASSET_KIND = "dataset";

export function LineageExplorer() {
  const datasets = useDatasets();
  const [assetId, setAssetId] = React.useState<string>("");

  const items = React.useMemo(() => datasets.data?.items ?? [], [datasets.data]);

  React.useEffect(() => {
    if (!assetId && items.length > 0) setAssetId(items[0].id);
  }, [assetId, items]);

  const lineage = useLineage(ASSET_KIND, assetId);

  return (
    <div className="space-y-4">
      <div className="max-w-sm space-y-2">
        <Label htmlFor="asset">Dataset</Label>
        {datasets.isLoading ? (
          <div className="h-9 animate-pulse rounded-md bg-muted" />
        ) : (
          <Select value={assetId} onValueChange={setAssetId}>
            <SelectTrigger id="asset">
              <SelectValue placeholder="Choose a dataset" />
            </SelectTrigger>
            <SelectContent>
              {items.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {!assetId ? (
        <EmptyState
          title="Select a dataset"
          description="Choose a dataset to trace its upstream and downstream lineage."
          icon={<Waypoints className="h-6 w-6" />}
        />
      ) : lineage.isLoading ? (
        <TableSkeleton rows={4} />
      ) : lineage.isError ? (
        <ErrorState error={lineage.error} title="Could not load lineage" />
      ) : lineage.data ? (
        <LineageGraph lineage={lineage.data} />
      ) : null}
    </div>
  );
}
