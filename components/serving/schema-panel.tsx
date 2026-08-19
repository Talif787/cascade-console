import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime, formatInt, isMeasureRole } from "@/lib/format";
import type { ServingView } from "@/lib/api/serving";

function Meta({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <span className="text-[0.8rem] text-muted-foreground">{label}</span>
      <span className="tnum text-right text-[0.82rem]">{value}</span>
    </div>
  );
}

export function SchemaPanel({ view }: { view: ServingView }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
      <Card>
        <CardHeader>
          <div>
            <div className="eyebrow mb-1">Schema</div>
            <CardTitle>Columns</CardTitle>
          </div>
          <Badge tone="neutral">{view.columns.length} columns</Badge>
        </CardHeader>
        <CardContent className="px-0 py-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-5">Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="pr-5 text-right">Nullable</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {view.columns.map((col) => (
                <TableRow key={col.name}>
                  <TableCell className="pl-5 font-medium">
                    <span className="tnum">{col.name}</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <span className="tnum text-[0.8rem]">{col.type}</span>
                  </TableCell>
                  <TableCell>
                    <Badge tone={isMeasureRole(col.role) ? "primary" : "neutral"}>{col.role}</Badge>
                  </TableCell>
                  <TableCell className="pr-5 text-right text-muted-foreground">
                    {col.nullable ? "yes" : "no"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle>Refresh</CardTitle>
          </CardHeader>
          <CardContent className="divide-y py-0">
            <Meta label="Mode" value={view.refresh_mode} />
            <Meta label="Schedule" value={view.refresh_cron || "not set"} />
            <Meta
              label="Enabled"
              value={<Badge tone={view.refresh_enabled ? "ok" : "neutral"}>{view.refresh_enabled ? "on" : "off"}</Badge>}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Freshness</CardTitle>
          </CardHeader>
          <CardContent className="divide-y py-0">
            <Meta label="Last synced" value={formatDateTime(view.last_synced_at)} />
            <Meta label="Last row count" value={formatInt(view.last_row_count)} />
            <Meta label="Version" value={`v${view.version}`} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Layout</CardTitle>
          </CardHeader>
          <CardContent className="divide-y py-0">
            <Meta label="Engine" value={view.engine} />
            <Meta label="Source dataset" value={<span className="tnum">{view.source_dataset_id}</span>} />
            <Meta label="Order by" value={view.order_by.join(", ") || "-"} />
            <Meta label="Partition by" value={view.partition_by || "-"} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
