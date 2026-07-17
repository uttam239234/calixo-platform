"use client";

/**
 * Calixo Platform - Generic Dashboard Switcher
 *
 * Shared, reusable UI for any module built on the
 * `core/platform/dashboardBuilder` registry — Dashboard and Analytics both
 * render this same component rather than each shipping their own copy.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Star, ChevronDown, Copy, Pencil, Plus, Trash2, CheckCircle2, RotateCcw, BookMarked } from "lucide-react";
import type { DashboardLayout, DashboardLayoutTemplateVisibility } from "@/core/platform/dashboardBuilder";

interface DashboardSwitcherProps<TKey extends string> {
  layouts: DashboardLayout<TKey>[];
  active?: DashboardLayout<TKey>;
  onSwitch: (id: string) => void;
  onCreate: (name: string, description: string, templateId?: string) => Promise<unknown>;
  onClone: (id: string, name: string) => Promise<unknown>;
  onRename: (id: string, name: string) => Promise<unknown>;
  onDelete: (id: string) => Promise<unknown>;
  onToggleFavorite: (id: string) => void;
  onSetDefault: (id: string) => void;
  onResetToTemplate: (id: string) => void;
  onSaveAsTemplate: (sourceId: string, name: string, visibility: DashboardLayoutTemplateVisibility) => Promise<unknown>;
}

const TEMPLATE_VISIBILITIES: { value: DashboardLayoutTemplateVisibility; label: string }[] = [
  { value: "private", label: "Private" },
  { value: "workspace", label: "Workspace" },
  { value: "organization", label: "Organization" },
];

export default function DashboardSwitcher<TKey extends string>({
  layouts,
  active,
  onSwitch,
  onCreate,
  onClone,
  onRename,
  onDelete,
  onToggleFavorite,
  onSetDefault,
  onResetToTemplate,
  onSaveAsTemplate,
}: DashboardSwitcherProps<TKey>) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"list" | "create" | "clone" | "rename" | "template">("list");
  const [draftName, setDraftName] = useState("");
  const [templateVisibility, setTemplateVisibility] = useState<DashboardLayoutTemplateVisibility>("private");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const close = () => {
    setOpen(false);
    setMode("list");
    setDraftName("");
    setError(null);
    setPending(false);
  };

  const enterMode = (next: "create" | "clone" | "rename" | "template") => {
    setError(null);
    setMode(next);
  };

  const errorMessage = (err: unknown) => (err instanceof Error ? err.message : "Something went wrong. Please try again.");

  const handleSave = async () => {
    const name = draftName.trim();
    if (!name || pending) return;
    setPending(true);
    setError(null);
    try {
      if (mode === "create") await onCreate(name, "Custom dashboard", active?.id);
      else if (mode === "clone" && active) await onClone(active.id, name);
      else if (mode === "rename" && active) await onRename(active.id, name);
      else if (mode === "template" && active) await onSaveAsTemplate(active.id, name, templateVisibility);
      close();
    } catch (err) {
      setError(errorMessage(err));
      setPending(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteError(null);
    setDeletingId(id);
    try {
      await onDelete(id);
    } catch (err) {
      setDeleteError(errorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="relative">
      <Button variant="outline" size="md" className="gap-2" onClick={() => setOpen(o => !o)}>
        {active?.isFavorite && <Star size={14} className="fill-warning text-warning" />}
        {active?.name ?? "Dashboard"}
        <ChevronDown size={14} />
      </Button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-2 w-80 rounded-2xl border border-border bg-card p-2 shadow-lg">
          {mode === "list" && (
            <>
              <div className="max-h-72 overflow-y-auto">
                {layouts.map(layout => (
                  <div key={layout.id} className={`flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-sm hover:bg-accent/60 ${layout.id === active?.id ? "bg-primary/5" : ""}`}>
                    <button
                      className="flex min-w-0 flex-1 items-center gap-2 text-left"
                      onClick={() => {
                        onSwitch(layout.id);
                        close();
                      }}
                    >
                      {layout.isDefault && <CheckCircle2 size={13} className="flex-shrink-0 text-primary" />}
                      <span className="truncate font-medium text-foreground">{layout.name}</span>
                    </button>
                    <div className="flex flex-shrink-0 items-center gap-0.5">
                      <button aria-label="Favourite" onClick={() => onToggleFavorite(layout.id)} className="rounded p-1 hover:bg-accent">
                        <Star size={13} className={layout.isFavorite ? "fill-warning text-warning" : "text-muted-foreground"} />
                      </button>
                      {!layout.isTemplate && (
                        <>
                          <button
                            aria-label="Rename"
                            onClick={() => {
                              setDraftName(layout.name);
                              onSwitch(layout.id);
                              enterMode("rename");
                            }}
                            className="rounded p-1 hover:bg-accent"
                          >
                            <Pencil size={13} className="text-muted-foreground" />
                          </button>
                          <button
                            aria-label="Delete"
                            disabled={deletingId === layout.id}
                            onClick={() => handleDelete(layout.id)}
                            className="rounded p-1 hover:bg-accent disabled:opacity-50"
                          >
                            <Trash2 size={13} className="text-muted-foreground" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {deleteError && <p className="mt-2 px-2.5 text-xs text-destructive">{deleteError}</p>}
              <div className="mt-2 space-y-1 border-t border-border pt-2">
                <button className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-primary hover:bg-primary/5" onClick={() => enterMode("create")}>
                  <Plus size={14} /> Create Dashboard
                </button>
                {active && !active.isTemplate && (
                  <button className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-muted-foreground hover:bg-accent/60" onClick={() => onResetToTemplate(active.id)}>
                    <RotateCcw size={14} /> Reset Layout
                  </button>
                )}
                {active && (
                  <button className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-muted-foreground hover:bg-accent/60" onClick={() => onSetDefault(active.id)}>
                    <CheckCircle2 size={14} /> Set as Default
                  </button>
                )}
                <button
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-muted-foreground hover:bg-accent/60"
                  onClick={() => {
                    setDraftName(active ? `${active.name} Copy` : "New Dashboard");
                    enterMode("clone");
                  }}
                >
                  <Copy size={14} /> Clone Current
                </button>
                {active && (
                  <button
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-muted-foreground hover:bg-accent/60"
                    onClick={() => {
                      setDraftName(`${active.name} Template`);
                      setTemplateVisibility("private");
                      enterMode("template");
                    }}
                  >
                    <BookMarked size={14} /> Save as Template
                  </button>
                )}
              </div>
            </>
          )}

          {(mode === "create" || mode === "clone" || mode === "rename" || mode === "template") && (
            <div className="space-y-2 p-1">
              <p className="text-xs font-medium text-muted-foreground">
                {mode === "create" ? "New dashboard name" : mode === "clone" ? "Clone as" : mode === "template" ? "Template name" : "Rename dashboard"}
              </p>
              <input autoFocus value={draftName} onChange={e => setDraftName(e.target.value)} className="input w-full text-sm" placeholder="Dashboard name" />
              {mode === "template" && (
                <div className="flex gap-1.5">
                  {TEMPLATE_VISIBILITIES.map(v => (
                    <button
                      key={v.value}
                      type="button"
                      onClick={() => setTemplateVisibility(v.value)}
                      className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors ${
                        templateVisibility === v.value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-accent"
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              )}
              {error && <p className="text-xs text-destructive">{error}</p>}
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" disabled={pending} onClick={() => setMode("list")}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" disabled={!draftName.trim() || pending} onClick={handleSave}>
                  {pending ? "Saving…" : "Save"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
