"use client";

import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { statusTone, formatDateTime } from "@/lib/format";
import type { ApiError } from "@/lib/api/client";
import { useDeprecateVersion, type SchemaVersion } from "@/lib/api/contracts";

export function VersionPanel({
  contractId,
  versions,
}: {
  contractId: string;
  versions: SchemaVersion[];
}) {
  const deprecate = useDeprecateVersion(contractId);

  if (versions.length === 0) {
    return <p className="text-sm text-muted-foreground">No schema versions published yet.</p>;
  }

  const sorted = [...versions].sort((a, b) => b.version - a.version);

  return (
    <Accordion type="single" collapsible defaultValue={`v${sorted[0].version}`} className="rounded-xl border px-4">
      {sorted.map((ver) => (
        <AccordionItem key={ver.version} value={`v${ver.version}`}>
          <AccordionTrigger>
            <div className="flex flex-1 items-center gap-3 pr-3">
              <span className="tnum font-medium">v{ver.version}</span>
              <Badge tone={statusTone(ver.status)}>{ver.status}</Badge>
              <span className="text-[0.75rem] text-muted-foreground">
                {ver.fields.length} fields · {formatDateTime(ver.created_at)}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pb-2">
              <Card>
                <CardContent className="px-0 py-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="pl-4">Field</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Nullable</TableHead>
                        <TableHead>Default</TableHead>
                        <TableHead className="pr-4">Doc</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ver.fields.map((f) => (
                        <TableRow key={f.name}>
                          <TableCell className="pl-4 font-medium">
                            <span className="tnum">{f.name}</span>
                          </TableCell>
                          <TableCell className="tnum text-[0.8rem] text-muted-foreground">{f.type}</TableCell>
                          <TableCell className="text-muted-foreground">{f.nullable ? "yes" : "no"}</TableCell>
                          <TableCell className="text-muted-foreground">{f.has_default ? "yes" : "no"}</TableCell>
                          <TableCell className="pr-4 text-[0.8rem] text-muted-foreground">{f.doc || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              <div className="flex justify-end">
                {ver.status !== "deprecated" ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={deprecate.isPending}
                    onClick={() =>
                      deprecate.mutate(ver.version, {
                        onSuccess: () => toast.success(`Version ${ver.version} deprecated`),
                        onError: (e) =>
                          toast.error("Deprecate failed", { description: (e as ApiError)?.detail }),
                      })
                    }
                  >
                    Deprecate v{ver.version}
                  </Button>
                ) : (
                  <span className="text-[0.78rem] text-muted-foreground">This version is deprecated.</span>
                )}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
