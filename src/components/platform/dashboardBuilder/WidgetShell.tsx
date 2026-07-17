"use client";

/**
 * Calixo Platform - Widget Shell
 *
 * The chrome around every widget rendered inside `WidgetGrid`: a drag
 * handle, and a "..." menu carrying every per-widget action the brief
 * names (Hide, Pin/Unpin, Duplicate, Expand Full Screen, Collapse, Reset
 * Position, resize-to-preset). Every action is a real, keyboard-reachable
 * button — dragging is the primary way to move/resize a widget, but never
 * the only way, so keyboard and screen-reader users retain full control.
 */

import { useEffect, useRef, useState } from "react";
import { GripVertical, MoreHorizontal, EyeOff, Pin, PinOff, Copy, Maximize2, Minimize2, ChevronsUpDown, RotateCcw, X, Ruler } from "lucide-react";
import type { DashboardWidgetCatalogEntry } from "@/core/platform/dashboardBuilder";
import { WIDGET_SIZE_PRESETS } from "./widgetSizePresets";

interface WidgetShellProps<TKey extends string> {
  entry: DashboardWidgetCatalogEntry<TKey> | undefined;
  pinned: boolean;
  collapsed: boolean;
  expanded: boolean;
  readOnly: boolean;
  onTogglePin: () => void;
  onToggleCollapse: () => void;
  onToggleExpand: () => void;
  onHide: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
  onReset: () => void;
  onApplySize: (preset: { w: number; h: number }) => void;
  children: React.ReactNode;
}

export default function WidgetShell<TKey extends string>({
  entry,
  pinned,
  collapsed,
  expanded,
  readOnly,
  onTogglePin,
  onToggleCollapse,
  onToggleExpand,
  onHide,
  onDuplicate,
  onRemove,
  onReset,
  onApplySize,
  children,
}: WidgetShellProps<TKey>) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sizeSubmenu, setSizeSubmenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setSizeSubmenu(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [menuOpen]);

  return (
    <div
      className={`widget-shell group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-primary/40 ${pinned ? "ring-1 ring-primary/25" : ""}`}
      data-collapsed={collapsed || undefined}
    >
      <div className="widget-drag-handle flex flex-shrink-0 cursor-grab items-center justify-between gap-2 border-b border-border/60 px-3 py-2 active:cursor-grabbing">
        <div className="flex min-w-0 items-center gap-1.5">
          {!readOnly && <GripVertical size={14} className="flex-shrink-0 text-muted-foreground/50" aria-hidden="true" />}
          <span className="truncate text-sm font-medium text-foreground">{entry?.label ?? "Widget"}</span>
          {pinned && <Pin size={11} className="flex-shrink-0 fill-primary text-primary" aria-label="Pinned" />}
        </div>
        {!readOnly && (
          <div className="relative flex-shrink-0" ref={menuRef}>
            <button
              type="button"
              aria-label="Widget options"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(o => !o)}
              className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <MoreHorizontal size={15} />
            </button>
            {menuOpen && (
              <div role="menu" className="absolute right-0 top-full z-40 mt-1 w-52 rounded-xl border border-border bg-card p-1 shadow-lg">
                {!sizeSubmenu ? (
                  <>
                    <MenuItem icon={<ChevronsUpDown size={14} />} label={collapsed ? "Expand" : "Collapse"} onClick={onToggleCollapse} />
                    <MenuItem icon={expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />} label={expanded ? "Exit Full Screen" : "Full Screen"} onClick={onToggleExpand} />
                    <MenuItem icon={<Ruler size={14} />} label="Resize to…" onClick={() => setSizeSubmenu(true)} hasSubmenu />
                    <MenuItem icon={pinned ? <PinOff size={14} /> : <Pin size={14} />} label={pinned ? "Unpin" : "Pin"} onClick={onTogglePin} />
                    <MenuItem icon={<Copy size={14} />} label="Duplicate" onClick={onDuplicate} />
                    <MenuItem icon={<RotateCcw size={14} />} label="Reset Position" onClick={onReset} />
                    <div className="my-1 border-t border-border/60" />
                    <MenuItem icon={<EyeOff size={14} />} label="Hide" onClick={onHide} />
                    {!entry?.alwaysAvailable && <MenuItem icon={<X size={14} />} label="Remove" onClick={onRemove} destructive />}
                  </>
                ) : (
                  <>
                    <button type="button" onClick={() => setSizeSubmenu(false)} className="mb-1 flex w-full items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-muted-foreground hover:bg-accent">
                      ← Back
                    </button>
                    {WIDGET_SIZE_PRESETS.map(preset => (
                      <MenuItem key={preset.id} label={`${preset.label}`} description={preset.span} onClick={() => onApplySize(preset)} />
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <div className={`min-h-0 flex-1 ${collapsed ? "overflow-hidden opacity-60" : "overflow-auto"}`} style={collapsed ? { maxHeight: 0 } : undefined}>
        {children}
      </div>
    </div>
  );
}

function MenuItem({ icon, label, description, onClick, hasSubmenu, destructive }: { icon?: React.ReactNode; label: string; description?: string; onClick: () => void; hasSubmenu?: boolean; destructive?: boolean }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={() => onClick()}
      className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm hover:bg-accent ${destructive ? "text-destructive" : "text-foreground"}`}
    >
      <span className="flex items-center gap-2">
        {icon}
        {label}
      </span>
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        {description}
        {hasSubmenu && <span aria-hidden="true">›</span>}
      </span>
    </button>
  );
}
