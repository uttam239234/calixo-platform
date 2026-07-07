/**
 * Calixo Platform - Default Analytics Segments
 *
 * A few realistic starting segments so "Saved Segments" isn't an empty
 * state on first load — each one a genuine filter combination over real
 * channel/audience values from the fact generator's own banks.
 */

import { segmentRegistry, SegmentRegistry } from "./SegmentRegistry";

const OWNER = "system";

let seeded = false;

export function seedAnalyticsSegments(registry: SegmentRegistry = segmentRegistry): void {
  if (seeded) return;
  const now = new Date().toISOString();
  registry.registerMany([
    { id: "segment-high-intent", name: "High Intent Visitors", description: "Returning, high-intent audience across all channels", kind: "audience", filters: { audience: "High Intent" }, owner: OWNER, createdAt: now },
    { id: "segment-google-ads", name: "Google Ads Only", description: "Traffic and conversions attributed to Google Ads", kind: "campaign", filters: { channel: "Google Ads" }, owner: OWNER, createdAt: now },
    { id: "segment-enterprise-us", name: "Enterprise — United States", description: "Enterprise audience segment in the United States", kind: "audience", filters: { audience: "Enterprise", region: "United States" }, owner: OWNER, createdAt: now },
  ]);
  seeded = true;
}
