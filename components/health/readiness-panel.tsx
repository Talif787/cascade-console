import { Card, CardHeader, CardBody } from "@/components/ui/card";
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
    // /readyz returns 503 with a body when a dependency is down; use that body.
    if (err.status === 503) {
      data = { status: "degraded" };
    } else {
      error = err.detail ?? "The control plane is unreachable.";
    }
  }

  return (
    <Card>
      <CardHeader
        eyebrow="Liveness and readiness"
        title="Control plane health"
        action={
          data ? (
            <Badge tone={tone(data.status)}>{data.status}</Badge>
          ) : (
            <Badge tone="down">unreachable</Badge>
          )
        }
      />
      <CardBody>
        {error ? (
          <div className="text-[0.85rem] text-[var(--color-text-muted)]">
            {error} Start the API with{" "}
            <code className="tnum rounded bg-[var(--color-hairline)] px-1 py-0.5 text-[0.78rem]">
              make run
            </code>{" "}
            and confirm{" "}
            <code className="tnum rounded bg-[var(--color-hairline)] px-1 py-0.5 text-[0.78rem]">
              CASCADE_API_URL
            </code>
            .
          </div>
        ) : data?.checks && data.checks.length > 0 ? (
          <ul className="divide-y divide-[var(--color-hairline)]">
            {data.checks.map((check) => (
              <li key={check.name} className="flex items-center justify-between py-2.5">
                <span className="text-[0.85rem] text-[var(--color-text)]">{check.name}</span>
                <div className="flex items-center gap-3">
                  {check.detail ? (
                    <span className="tnum text-[0.72rem] text-[var(--color-text-muted)]">
                      {check.detail}
                    </span>
                  ) : null}
                  <Badge tone={tone(check.status)}>{check.status}</Badge>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-[0.85rem] text-[var(--color-text-muted)]">
            Reporting <span className="text-[var(--color-text)]">{data?.status}</span>. Per-dependency
            detail appears here when the readiness endpoint returns individual checks.
          </div>
        )}
      </CardBody>
    </Card>
  );
}
