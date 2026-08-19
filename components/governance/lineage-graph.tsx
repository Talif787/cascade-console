"use client";

import * as React from "react";
import { statusTone, type Tone } from "@/lib/format";
import type { Lineage, LineageNode } from "@/lib/api/governance";

const toneColor: Record<Tone, string> = {
  ok: "var(--ok)",
  warn: "var(--warn)",
  down: "var(--down)",
  neutral: "var(--muted-foreground)",
};

const NODE_W = 168;
const NODE_H = 52;
const COL_GAP = 96;
const ROW_GAP = 22;
const PAD = 16;

interface Placed {
  node: LineageNode;
  ref: string;
  col: number;
  row: number;
  x: number;
  y: number;
}

/**
 * Assigns each node a column by its longest upstream distance to the root, then
 * stacks nodes within a column. Edges are drawn from the right of the source to
 * the left of the target. The layout is deterministic and dependency-free.
 */
function layout(lineage: Lineage): { placed: Placed[]; width: number; height: number; refOf: Map<string, Placed> } {
  const byRef = new Map<string, LineageNode>();
  for (const n of lineage.nodes) byRef.set(`${n.kind}:${n.id}`, n);

  // Column = longest path from any source (node with no upstreams) via BFS depth.
  const depth = new Map<string, number>();
  const refs = Array.from(byRef.keys());
  for (const r of refs) depth.set(r, 0);
  // Relax depths across edges a bounded number of times (DAG assumption).
  for (let i = 0; i < refs.length; i++) {
    for (const e of lineage.edges) {
      const d = (depth.get(e.from_ref) ?? 0) + 1;
      if (d > (depth.get(e.to_ref) ?? 0)) depth.set(e.to_ref, d);
    }
  }

  const cols = new Map<number, string[]>();
  for (const r of refs) {
    const c = depth.get(r) ?? 0;
    (cols.get(c) ?? cols.set(c, []).get(c)!).push(r);
  }

  const placed: Placed[] = [];
  const refOf = new Map<string, Placed>();
  let maxRows = 0;
  for (const [c, list] of Array.from(cols.entries()).sort((a, b) => a[0] - b[0])) {
    list.sort((a, b) => (byRef.get(a)?.name ?? "").localeCompare(byRef.get(b)?.name ?? ""));
    maxRows = Math.max(maxRows, list.length);
    list.forEach((r, row) => {
      const p: Placed = {
        node: byRef.get(r)!,
        ref: r,
        col: c,
        row,
        x: PAD + c * (NODE_W + COL_GAP),
        y: PAD + row * (NODE_H + ROW_GAP),
      };
      placed.push(p);
      refOf.set(r, p);
    });
  }

  const colCount = cols.size;
  const width = PAD * 2 + colCount * NODE_W + (colCount - 1) * COL_GAP;
  const height = PAD * 2 + maxRows * NODE_H + (maxRows - 1) * ROW_GAP;
  return { placed, width, height, refOf };
}

export function LineageGraph({ lineage }: { lineage: Lineage }) {
  const { placed, width, height, refOf } = React.useMemo(() => layout(lineage), [lineage]);

  if (lineage.nodes.length === 0) {
    return <p className="text-sm text-muted-foreground">No lineage recorded for this asset.</p>;
  }

  return (
    <div className="overflow-auto rounded-xl border bg-card p-2">
      <svg width={width} height={Math.max(height, NODE_H + PAD * 2)} role="img" aria-label="Lineage graph">
        <defs>
          <marker id="lin-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill="var(--border)" />
          </marker>
        </defs>

        {lineage.edges.map((e, i) => {
          const a = refOf.get(e.from_ref);
          const b = refOf.get(e.to_ref);
          if (!a || !b) return null;
          const x1 = a.x + NODE_W;
          const y1 = a.y + NODE_H / 2;
          const x2 = b.x;
          const y2 = b.y + NODE_H / 2;
          const mx = (x1 + x2) / 2;
          return (
            <path
              key={i}
              d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`}
              fill="none"
              stroke="var(--border)"
              strokeWidth={1.5}
              markerEnd="url(#lin-arrow)"
            />
          );
        })}

        {placed.map((p) => {
          const isRoot = p.ref === lineage.root;
          const accent = toneColor[statusTone(p.node.status)];
          return (
            <g key={p.ref} transform={`translate(${p.x}, ${p.y})`}>
              <rect
                width={NODE_W}
                height={NODE_H}
                rx={9}
                fill="var(--background)"
                stroke={isRoot ? "var(--primary)" : "var(--border)"}
                strokeWidth={isRoot ? 2 : 1}
              />
              <rect x={0} y={0} width={4} height={NODE_H} rx={2} fill={accent} />
              <text x={14} y={21} fontSize={12} fontWeight={600} fill="var(--foreground)">
                {truncate(p.node.name, 20)}
              </text>
              <text x={14} y={38} fontSize={10.5} fill="var(--muted-foreground)">
                {p.node.kind} · {p.node.status}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}
