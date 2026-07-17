/**
 * Calixo Platform - Widget Auto-Pack Layout
 *
 * Deterministic shelf-packing over a fixed 12-column grid: walks widgets in
 * order, placing each to the right of the last until it would overflow the
 * row, then wraps. Used to compute default `x/y/w/h` for the module's base
 * widget set and every seeded template — the same 12-column grid the real
 * `WidgetGrid` UI renders (`components/platform/dashboardBuilder/WidgetGrid.tsx`).
 */
import type { WidgetGridPosition } from "./types";

export const GRID_COLUMNS = 12;

export function packWidgets(items: { w: number; h: number }[]): WidgetGridPosition[] {
  let cursorX = 0;
  let cursorY = 0;
  let rowHeight = 0;
  const positions: WidgetGridPosition[] = [];
  for (const item of items) {
    const w = Math.min(item.w, GRID_COLUMNS);
    if (cursorX + w > GRID_COLUMNS) {
      cursorX = 0;
      cursorY += rowHeight;
      rowHeight = 0;
    }
    positions.push({ x: cursorX, y: cursorY, w, h: item.h });
    cursorX += w;
    rowHeight = Math.max(rowHeight, item.h);
  }
  return positions;
}
