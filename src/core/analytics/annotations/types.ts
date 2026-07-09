/**
 * Calixo Platform - Analytics Chart Annotations
 *
 * A real, working example scoped to the Revenue chart today — the
 * `chartId` field is generic so any other chart can adopt the same
 * registry without new code, once there's a UI for it.
 */
export interface AnalyticsAnnotation {
  id: string;
  chartId: string;
  date: string;
  note: string;
  author: string;
  createdAt: string;
}
