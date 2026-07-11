/**
 * Calixo Platform - Report Data Source Binding
 *
 * Tags a `ReportDefinition` with which real platform facade backs its
 * dataset — the mechanism `ReportDataSourceRouter` uses to fetch genuine
 * data instead of `ReportEngine`'s deterministic-formula fallback. A
 * report with no binding (a fully custom/advanced hand-built report)
 * falls back to the formula generator, disclosed as such.
 */

export type ReportSourceId =
  | "analytics-executive"
  | "analytics-conversion"
  | "ads-performance"
  | "social-overview"
  | "reputation-health"
  | "content-history";

export interface ReportSourceBinding {
  sourceId: ReportSourceId;
}
