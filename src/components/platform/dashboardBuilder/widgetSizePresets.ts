/**
 * Calixo Platform - Widget Size Presets
 *
 * The brief's two sizing vocabularies — named T-shirt sizes (XS…Full
 * Width) and named grid spans (1x1…Full Width) — are the same underlying
 * concept at two different labels, so this is one real preset list rather
 * than two competing ones: each row carries both names, mapped onto the
 * same `{w, h}` grid units the free-form corner-drag resize (the primary
 * interaction) also produces. Units are on the 12-column grid `WidgetGrid`
 * renders (`w` in columns, `h` in rows of `ROW_HEIGHT` px).
 */

export interface WidgetSizePreset {
  id: string;
  label: string;
  span: string;
  w: number;
  h: number;
}

export const WIDGET_SIZE_PRESETS: WidgetSizePreset[] = [
  { id: "xs", label: "XS", span: "1×1", w: 2, h: 3 },
  { id: "small", label: "Small", span: "2×1", w: 4, h: 3 },
  { id: "medium", label: "Medium", span: "2×2", w: 4, h: 6 },
  { id: "large", label: "Large", span: "3×2", w: 6, h: 6 },
  { id: "xl", label: "XL", span: "4×2", w: 8, h: 6 },
  { id: "full", label: "Full Width", span: "12×2", w: 12, h: 6 },
];
