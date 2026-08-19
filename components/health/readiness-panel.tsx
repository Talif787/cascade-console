import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cascadeFetch, type CascadeError } from "@/lib/api/server";
import type { ReadinessStatus } from "@/lib/api/types";

function tone(status: string): "ok" | "warn" | "down" {
  if (status === "ok" || status === "up") return "ok";
  if (status === "down" || status === "error") return "down";
  return "warn";
}

export async function ReadinessPanel() {
  let data: ReadinessStatus | null = null;
  let error: string | null = null;

  try {
    data = await cascadeFetch<ReadinessStatus>("/readyz");
  } catch (e) {
    const err = e as CascadeError;
    if (err.status === 503) {
      data = { status: "degraded" };
    } else {
      error = err.detail ?? "The control plane is unreachable.";
    }
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <div className="eyebrow mb-1">Liveness and readiness</div>
          <CardTitle>Control plane health</CardTitle>
        </div>
        {data ? (
          <Badge tone={tone(data.status)}>{data.status}</Badge>
        ) : (
          <Badge tone="down">unreachable</Badge>
        )}
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-[0.85rem] text-muted-foreground">
            {error} Start the API with{" "}
            <code className="tnum rounded bg-muted px-1 py-0.5 text-[0.78rem]">make run</code> and
            confirm{" "}
            <code className="tnum rounded bg-muted px-1 py-0.5 text-[0.78rem]">CASCADE_API_URL</code>.
          </div>
        ) : data?.checks && data.checks.length > 0 ? (
          <ul className="divide-y">
            {data.checks.map((check) => (
              <li key={check.name} className="flex items-center justify-between py-2.5">
                <span className="text-[0.85rem]">{check.name}</span>
                <div className="flex items-center gap-3">
                  {check.detail ? (
                    <span className="tnum text-[0.72rem] text-muted-foreground">{check.detail}</span>
                  ) : null}
                  <Badge tone={tone(check.status)}>{check.status}</Badge>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-[0.85rem] text-muted-foreground">
            Reporting <span className="text-foreground">{data?.status}</span>. Per-dependency detail
            appears here when the readiness endpoint returns individual checks.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
