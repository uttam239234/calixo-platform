/**
 * Calixo Platform - Analytics Segments
 *
 * A Segment is a named, reusable `AnalyticsFilterState` preset — "Saved
 * Segments", "Audience Segments", "Campaign Segments", and "Dynamic
 * Segments" from the mandate are all the same underlying object with
 * different filter combinations; there is no need for four separate
 * engines.
 */

import type { AnalyticsFilterState } from "../types";

export type SegmentKind = "audience" | "campaign" | "custom";

export interface AnalyticsSegment {
  id: string;
  name: string;
  description: string;
  kind: SegmentKind;
  filters: AnalyticsFilterState;
  owner: string;
  createdAt: string;
}
