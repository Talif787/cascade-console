import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Connector } from "@/lib/api/pipelines";

export function ConnectorCard({ label, connector }: { label: string; connector: Connector }) {
  const optionKeys = Object.keys(connector.options ?? {});
  return (
    <Card>
      <CardHeader>
        <div>
          <div className="eyebrow mb-1">{label}</div>
          <CardTitle>{connector.type}</CardTitle>
        </div>
        <Badge tone="neutral">{connector.type}</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="text-[0.72rem] text-muted-foreground">Resource</div>
          <div className="tnum text-[0.85rem]">{connector.resource}</div>
        </div>
        {optionKeys.length > 0 ? (
          <div>
            <div className="mb-1 text-[0.72rem] text-muted-foreground">Options</div>
            <div className="space-y-1">
              {optionKeys.map((k) => (
                <div key={k} className="flex justify-between gap-3 text-[0.78rem]">
                  <span className="tnum text-muted-foreground">{k}</span>
                  <span className="tnum">{String(connector.options[k])}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
