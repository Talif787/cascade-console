import { Badge } from "@/components/ui/badge";
import type { TranslatedQuery } from "@/lib/api/copilot";

function Chips({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="eyebrow mr-1">{label}</span>
      {children}
    </div>
  );
}

export function PlanView({ plan }: { plan: TranslatedQuery }) {
  const hasFilters = plan.filters.length > 0;
  return (
    <div className="space-y-2.5 rounded-lg border bg-muted/40 p-3">
      {plan.dimensions.length > 0 ? (
        <Chips label="Dimensions">
          {plan.dimensions.map((d) => (
            <Badge key={d} tone="neutral">
              {d}
            </Badge>
          ))}
        </Chips>
      ) : null}
      {plan.measures.length > 0 ? (
        <Chips label="Measures">
          {plan.measures.map((m, i) => (
            <Badge key={i} tone="primary">
              {m.aggregation}({m.column})
            </Badge>
          ))}
        </Chips>
      ) : null}
      {hasFilters ? (
        <Chips label="Filters">
          {plan.filters.map((f, i) => (
            <Badge key={i} tone="warn">
              {f.column} {f.op} {f.values.join(", ")}
            </Badge>
          ))}
        </Chips>
      ) : null}
      <Chips label="Limit">
        <span className="tnum text-[0.82rem]">{plan.limit}</span>
      </Chips>
    </div>
  );
}
