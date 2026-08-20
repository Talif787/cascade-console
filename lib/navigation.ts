import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Table2,
  Sparkles,
  ShieldCheck,
  Workflow,
  FileCheck2,
  DownloadCloud,
  Waypoints,
  Plug,
  Palette,
} from "lucide-react";

export interface NavItem {
  key: string;
  label: string;
  href: string;
  icon: LucideIcon;
  ready: boolean;
  phase?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { key: "overview", label: "Overview", href: "/", icon: LayoutDashboard, ready: true },
  { key: "serving", label: "Serving views", href: "/serving", icon: Table2, ready: true },
  { key: "copilot", label: "Copilot", href: "/copilot", icon: Sparkles, ready: true },
  { key: "governance", label: "Governance", href: "/governance", icon: ShieldCheck, ready: true },
  { key: "pipelines", label: "Pipelines", href: "/pipelines", icon: Workflow, ready: true },
  { key: "contracts", label: "Data contracts", href: "/contracts", icon: FileCheck2, ready: true },
  { key: "ingestion", label: "Ingestion", href: "/ingestion", icon: DownloadCloud, ready: true },
  { key: "processing", label: "Processing", href: "/processing", icon: Waypoints, ready: true },
  { key: "mcp", label: "MCP tools", href: "/mcp", icon: Plug, ready: true },
  { key: "showcase", label: "Components", href: "/showcase", icon: Palette, ready: true },
];
