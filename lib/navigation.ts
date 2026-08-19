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
  { key: "serving", label: "Serving views", href: "/serving", icon: Table2, ready: false, phase: "F3" },
  { key: "copilot", label: "Copilot", href: "/copilot", icon: Sparkles, ready: false, phase: "F3" },
  { key: "governance", label: "Governance", href: "/governance", icon: ShieldCheck, ready: false, phase: "F4" },
  { key: "pipelines", label: "Pipelines", href: "/pipelines", icon: Workflow, ready: false, phase: "F5" },
  { key: "contracts", label: "Data contracts", href: "/contracts", icon: FileCheck2, ready: false, phase: "F5" },
  { key: "ingestion", label: "Ingestion", href: "/ingestion", icon: DownloadCloud, ready: false, phase: "F5" },
  { key: "processing", label: "Processing", href: "/processing", icon: Waypoints, ready: false, phase: "F5" },
  { key: "mcp", label: "MCP tools", href: "/mcp", icon: Plug, ready: false, phase: "F6" },
  { key: "showcase", label: "Components", href: "/showcase", icon: Palette, ready: true },
];
