"use client";

import type { CSSProperties } from "react";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { NAV_ITEMS } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/app-shell/sidebar-context";

const CONSOLE_VERSION = "v1.0.0";

export function Sidebar() {
  const pathname = usePathname();
  const { open, setOpen } = useSidebar();

  // Close the drawer whenever the route changes (mobile navigation).
  useEffect(() => {
    setOpen(false);
  }, [pathname, setOpen]);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  return (
    <>
      {/* Backdrop, mobile only, shown when the drawer is open. */}
      {open ? (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      ) : null}

      <aside
        className={cn(
          "flex h-full w-[236px] shrink-0 flex-col bg-sidebar text-sidebar-foreground",
          // Mobile: fixed off-canvas drawer that slides in.
          "fixed inset-y-0 left-0 z-50 transition-transform duration-200 md:static md:z-auto md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
        aria-label="Primary"
      >
        <div className="flex h-14 items-center justify-between px-5">
          <div className="flex items-center gap-2.5">
            <span
              className="pulse-dot inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: "var(--signal)", "--pulse-color": "var(--signal)" } as CSSProperties}
              aria-hidden
            />
            <span className="font-[family-name:var(--font-display)] text-[0.95rem] font-semibold tracking-tight">
              Cascade
            </span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-md p-1 text-sidebar-muted hover:text-sidebar-foreground md:hidden"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="mt-2 flex-1 overflow-y-auto px-3">
          <div className="eyebrow px-2 pb-2 text-sidebar-muted">Control plane</div>
          <ul className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              const Icon = item.icon;
              const content = (
                <span
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[0.83rem] transition-colors",
                    active
                      ? "bg-[color-mix(in_srgb,var(--primary)_24%,var(--sidebar))] text-white"
                      : "text-sidebar-muted",
                    item.ready && !active ? "hover:bg-sidebar-accent hover:text-sidebar-foreground" : "",
                    !item.ready ? "cursor-default opacity-70" : "",
                  )}
                >
                  <Icon size={16} strokeWidth={1.75} className="shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {!item.ready && item.phase ? (
                    <span className="tnum rounded bg-sidebar-accent px-1.5 py-0.5 text-[0.6rem] text-sidebar-muted">
                      {item.phase}
                    </span>
                  ) : null}
                </span>
              );

              return (
                <li key={item.key}>
                  {item.ready ? (
                    <Link href={item.href} aria-current={active ? "page" : undefined}>
                      {content}
                    </Link>
                  ) : (
                    <div aria-disabled title={`Arrives in phase ${item.phase}`}>{content}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="px-5 py-4 text-[0.68rem] text-sidebar-muted">
          <span className="tnum">{CONSOLE_VERSION}</span> console
        </div>
      </aside>
    </>
  );
}
