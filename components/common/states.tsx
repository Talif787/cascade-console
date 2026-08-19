import type { ReactNode } from "react";
import { AlertTriangle, Inbox } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { ApiError } from "@/lib/api/client";

export function ErrorState({ error, title }: { error: unknown; title?: string }) {
  const e = error as Partial<ApiError> | undefined;
  const detail = e?.detail ?? "Something went wrong.";
  const status = e?.status;
  const unreachable = status === 502 || status === undefined;
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-12 text-center">
      <AlertTriangle className="mb-3 h-6 w-6 text-[var(--warn)]" />
      <p className="text-sm font-medium">{title ?? "Unable to load"}</p>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        {unreachable
          ? "The control plane is unreachable. Start the API with make run and confirm CASCADE_API_URL."
          : detail}
      </p>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-12 text-center">
      <div className="mb-3 text-muted-foreground">{icon ?? <Inbox className="h-6 w-6" />}</div>
      <p className="text-sm font-medium">{title}</p>
      {description ? (
        <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2 rounded-xl border p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="h-5 flex-[2]" />
          <Skeleton className="h-5 flex-1" />
          <Skeleton className="h-5 flex-1" />
          <Skeleton className="h-5 flex-1" />
        </div>
      ))}
    </div>
  );
}
