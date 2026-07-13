"use client";

import { useEffect, useRef, useState } from "react";
import { Building2, Boxes, Check, ChevronDown } from "lucide-react";
import { useOrganization } from "@/organizations/hooks/useOrganization";
import { useWorkspace } from "@/workspaces/hooks/useWorkspace";
import { cn } from "@/lib/utils";

/**
 * The brief's one "mandatory, display globally" requirement — replaces
 * Header.tsx's static "Growth Engine" placeholder. Two real levels in one
 * compact control: Organization (`useOrganization()`, unchanged since the
 * earlier Organizations round) and Workspace (`useWorkspace()`, now backed
 * by the real, previously-dead Workspace Platform via this round's adapter
 * fix). Switching either dimension never requires a re-login.
 */
export function GlobalWorkspaceSwitcher() {
  const { organization, organizations, switchOrganization } = useOrganization();
  const { workspace, workspaces, switchWorkspace, isSwitching } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!organization) return null;

  return (
    <div ref={ref} className="relative hidden xl:block">
      <button
        type="button"
        onClick={() => setIsOpen(v => !v)}
        className="flex items-center gap-2 rounded-2xl border border-header-border px-3 py-1.5 text-left text-[13px] font-medium text-muted-foreground transition-all duration-150 hover:bg-accent hover:text-foreground"
        aria-label="Switch organization or workspace"
        aria-expanded={isOpen}
      >
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-[11px] font-bold text-primary">{organization.name.charAt(0).toUpperCase()}</div>
        <div className="min-w-0 leading-tight">
          <p className="truncate text-[10px] text-muted-foreground/80">{organization.name}</p>
          <p className="truncate text-[13px] font-semibold text-foreground">{workspace?.name ?? "No workspace"}</p>
        </div>
        <ChevronDown size={13} className={cn("flex-shrink-0 text-muted-foreground/50 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-72 overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
          <div className="border-b border-border p-2">
            <p className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              <Building2 size={11} /> Organization
            </p>
            <div className="max-h-40 overflow-y-auto">
              {organizations.map(org => (
                <button
                  key={org.id}
                  type="button"
                  onClick={async () => {
                    await switchOrganization(org.id);
                  }}
                  className={cn("flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left text-sm hover:bg-accent", org.id === organization.id && "bg-primary/10")}
                >
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-[10px] font-bold text-white" style={{ backgroundColor: org.branding.colors.primary }}>
                    {org.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="min-w-0 flex-1 truncate text-foreground">{org.name}</span>
                  {org.id === organization.id && <Check size={14} className="flex-shrink-0 text-primary" />}
                </button>
              ))}
            </div>
          </div>

          <div className="p-2">
            <p className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              <Boxes size={11} /> Workspace
            </p>
            <div className="max-h-40 overflow-y-auto">
              {workspaces.length === 0 ? (
                <p className="px-2 py-3 text-center text-xs text-muted-foreground">No workspaces yet.</p>
              ) : (
                workspaces.map(ws => (
                  <button
                    key={ws.id}
                    type="button"
                    disabled={isSwitching}
                    onClick={async () => {
                      await switchWorkspace(ws.id);
                      setIsOpen(false);
                    }}
                    className={cn("flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left text-sm hover:bg-accent disabled:opacity-50", ws.id === workspace?.id && "bg-primary/10")}
                  >
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-[10px] font-bold text-white" style={{ backgroundColor: ws.branding.theme.primary }}>
                      {ws.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="min-w-0 flex-1 truncate text-foreground">{ws.name}</span>
                    {ws.id === workspace?.id && <Check size={14} className="flex-shrink-0 text-primary" />}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
