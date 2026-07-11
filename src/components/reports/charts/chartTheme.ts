import type { CSSProperties } from "react";

/**
 * Calixo Reports - Chart Theme
 *
 * Reads the validated categorical palette (`--chart-1..8`, added to
 * `globals.css` via the dataviz skill's method) and this app's existing
 * text/grid tokens — never hardcoded hex. Fixed slot order is the
 * CVD-safety mechanism: callers always index by position, never
 * reassign a color by a filtered/sorted rank.
 */

export const CHART_COLOR_VARS = ["--chart-1", "--chart-2", "--chart-3", "--chart-4", "--chart-5", "--chart-6", "--chart-7", "--chart-8"] as const;

/**
 * Fixed-order categorical color by slot index — never by a sorted/filtered
 * rank. Returns a literal `var(--chart-N)` reference (not a JS-resolved hex)
 * so it stays correct across light/dark without a re-render, and carries no
 * SSR/hydration mismatch risk.
 */
export function chartColor(index: number): string {
  return `var(${CHART_COLOR_VARS[index % CHART_COLOR_VARS.length]})`;
}

export const chartText = {
  primary: "var(--foreground)",
  secondary: "var(--muted-foreground)",
  grid: "var(--chart-grid)",
  axis: "var(--chart-axis)",
};

export const tooltipContentStyle: CSSProperties = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "10px",
  fontSize: "12px",
  color: "var(--foreground)",
  boxShadow: "var(--shadow-dropdown)",
};

export const tooltipLabelStyle: CSSProperties = {
  color: "var(--muted-foreground)",
  fontSize: "11px",
  marginBottom: "2px",
};

export function formatValue(value: unknown, format?: string): string {
  if (typeof value !== "number") return String(value ?? "—");
  if (format === "currency") return `$${value.toLocaleString()}`;
  if (format === "percent") return `${value.toFixed(1)}%`;
  if (format === "duration") return `${value.toLocaleString()}s`;
  return value.toLocaleString();
}
