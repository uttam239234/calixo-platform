"use client";

/**
 * Calixo Platform - Widget Grid
 *
 * The real drag/resize/pin/hide/duplicate/expand/collapse/reset surface —
 * a `react-grid-layout` `ResponsiveGridLayout` wrapping each widget in a
 * `WidgetShell`. Generic over the module's widget-key union so Dashboard
 * and Analytics (and any future module) share one implementation.
 *
 * Mobile: `cols.xxs = 1` forces every widget to full width below 480px —
 * a real single-column stack, not a CSS trick layered on top.
 * Auto-save: RGL reports layout changes continuously during a drag; those
 * are debounced 400ms before reaching `onWidgetsChange` so a 3-second drag
 * doesn't fire a save on every animation frame. Discrete actions (hide,
 * pin, duplicate, resize-to-preset) call it immediately — they're already
 * one deliberate click, not a continuous gesture.
 */

import { useCallback, useMemo, useRef, useState } from "react";
import { ResponsiveGridLayout, useContainerWidth } from "react-grid-layout";
import type { Layout as RGLLayout, LayoutItem as RGLLayoutItem } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "./widgetGrid.css";
import { useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import type { DashboardWidgetCatalogEntry, DashboardWidgetConfig } from "@/core/platform/dashboardBuilder";
import WidgetShell from "./WidgetShell";

const BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
const COLS = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 1 };
const ROW_HEIGHT = 32;
const MARGIN: [number, number] = [16, 16];
const AUTOSAVE_DEBOUNCE_MS = 400;

export interface WidgetGridProps<TKey extends string> {
  widgets: DashboardWidgetConfig<TKey>[];
  catalog: DashboardWidgetCatalogEntry<TKey>[];
  readOnly?: boolean;
  renderWidget: (config: DashboardWidgetConfig<TKey>) => React.ReactNode;
  onWidgetsChange: (widgets: DashboardWidgetConfig<TKey>[]) => void;
  onDuplicateWidget: (instanceId: string) => void;
  onRemoveWidget: (instanceId: string) => void;
  onResetWidget: (instanceId: string) => void;
}

export default function WidgetGrid<TKey extends string>({
  widgets,
  catalog,
  readOnly = false,
  renderWidget,
  onWidgetsChange,
  onDuplicateWidget,
  onRemoveWidget,
  onResetWidget,
}: WidgetGridProps<TKey>) {
  const catalogByKey = useMemo(() => new Map(catalog.map(c => [c.key, c])), [catalog]);
  const visible = useMemo(() => [...widgets.filter(w => w.visible)].sort((a, b) => a.order - b.order), [widgets]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const { width, containerRef } = useContainerWidth({ measureBeforeMount: false, initialWidth: 1200 });

  const rglLayout: RGLLayoutItem[] = useMemo(
    () =>
      visible.map(w => {
        const entry = catalogByKey.get(w.key);
        return {
          i: w.instanceId,
          x: w.layout.x,
          y: w.layout.y,
          w: w.layout.w,
          h: w.collapsed ? Math.min(w.layout.h, 2) : w.layout.h,
          minW: entry?.minSize?.w ?? 2,
          minH: w.collapsed ? undefined : (entry?.minSize?.h ?? 2),
          maxW: entry?.maxSize?.w,
          maxH: w.collapsed ? undefined : entry?.maxSize?.h,
          static: w.pinned || readOnly,
        };
      }),
    [visible, catalogByKey, readOnly]
  );

  const commit = useCallback(
    (next: DashboardWidgetConfig<TKey>[], immediate = false) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (immediate) {
        onWidgetsChange(next);
        return;
      }
      debounceRef.current = setTimeout(() => onWidgetsChange(next), AUTOSAVE_DEBOUNCE_MS);
    },
    [onWidgetsChange]
  );

  const handleLayoutChange = useCallback(
    (layout: RGLLayout) => {
      if (readOnly) return;
      const byId = new Map(layout.map(item => [item.i, item]));
      let changed = false;
      const next = widgets.map(w => {
        if (w.collapsed) return w;
        const item = byId.get(w.instanceId);
        if (!item) return w;
        if (item.x === w.layout.x && item.y === w.layout.y && item.w === w.layout.w && item.h === w.layout.h) return w;
        changed = true;
        return { ...w, layout: { x: item.x, y: item.y, w: item.w, h: item.h } };
      });
      if (changed) commit(next);
    },
    [widgets, readOnly, commit]
  );

  const updateWidget = useCallback(
    (instanceId: string, patch: Partial<DashboardWidgetConfig<TKey>>) => {
      const next = widgets.map(w => (w.instanceId === instanceId ? { ...w, ...patch } : w));
      commit(next, true);
    },
    [widgets, commit]
  );

  const expandedWidget = expandedId ? widgets.find(w => w.instanceId === expandedId) : undefined;

  return (
    <div ref={containerRef}>
      <ResponsiveGridLayout
        width={width}
        breakpoints={BREAKPOINTS}
        cols={COLS}
        layouts={{ lg: rglLayout }}
        rowHeight={ROW_HEIGHT}
        margin={MARGIN}
        containerPadding={[0, 0]}
        dragConfig={{ enabled: !readOnly, handle: ".widget-drag-handle", threshold: 3 }}
        resizeConfig={{ enabled: !readOnly, handles: ["se"] }}
        onLayoutChange={handleLayoutChange}
        className={prefersReducedMotion ? "widget-grid widget-grid--no-motion" : "widget-grid"}
      >
        {visible.map(w => (
          <div key={w.instanceId} id={`widget-${w.key}`}>
            <WidgetShell
              entry={catalogByKey.get(w.key)}
              pinned={w.pinned}
              collapsed={w.collapsed}
              expanded={expandedId === w.instanceId}
              readOnly={readOnly}
              onTogglePin={() => updateWidget(w.instanceId, { pinned: !w.pinned })}
              onToggleCollapse={() => updateWidget(w.instanceId, { collapsed: !w.collapsed })}
              onToggleExpand={() => setExpandedId(id => (id === w.instanceId ? null : w.instanceId))}
              onHide={() => updateWidget(w.instanceId, { visible: false })}
              onDuplicate={() => onDuplicateWidget(w.instanceId)}
              onRemove={() => onRemoveWidget(w.instanceId)}
              onReset={() => onResetWidget(w.instanceId)}
              onApplySize={preset => updateWidget(w.instanceId, { layout: { ...w.layout, w: preset.w, h: preset.h } })}
            >
              {renderWidget(w)}
            </WidgetShell>
          </div>
        ))}
      </ResponsiveGridLayout>

      {expandedWidget && (
        <div role="dialog" aria-modal="true" aria-label={catalogByKey.get(expandedWidget.key)?.label ?? "Widget"} className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-6 backdrop-blur-sm">
          <div className="flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
            <div className="flex flex-shrink-0 items-center justify-between border-b border-border px-4 py-3">
              <span className="text-sm font-semibold text-foreground">{catalogByKey.get(expandedWidget.key)?.label}</span>
              <button type="button" aria-label="Close" onClick={() => setExpandedId(null)} className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto p-4">{renderWidget(expandedWidget)}</div>
          </div>
        </div>
      )}
    </div>
  );
}
