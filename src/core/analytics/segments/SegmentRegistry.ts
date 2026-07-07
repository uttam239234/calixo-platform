/**
 * Calixo Platform - Analytics Segment Registry
 *
 * Real bookkeeping for saved filter presets: register/list/lookup plus
 * create/rename/remove. Segments are "dynamic" by construction — they
 * store a filter combination, not a static list of rows, so every segment
 * re-evaluates against the live fact table each time it's applied.
 */

import { generateId } from "@/shared/utils/string";
import type { AnalyticsFilterState } from "../types";
import type { AnalyticsSegment, SegmentKind } from "./types";

export class SegmentRegistry {
  private segments: Map<string, AnalyticsSegment> = new Map();

  register(segment: AnalyticsSegment): void {
    this.segments.set(segment.id, segment);
  }

  registerMany(segments: AnalyticsSegment[]): void {
    for (const segment of segments) this.register(segment);
  }

  create(params: { name: string; description: string; kind: SegmentKind; filters: AnalyticsFilterState; owner: string }): AnalyticsSegment {
    const segment: AnalyticsSegment = { id: `segment-${generateId(10)}`, createdAt: new Date().toISOString(), ...params };
    this.segments.set(segment.id, segment);
    return segment;
  }

  rename(id: string, name: string): AnalyticsSegment | undefined {
    const segment = this.segments.get(id);
    if (!segment) return undefined;
    segment.name = name;
    return { ...segment };
  }

  remove(id: string): boolean {
    return this.segments.delete(id);
  }

  lookup(id: string): AnalyticsSegment | undefined {
    return this.segments.get(id);
  }

  list(): AnalyticsSegment[] {
    return Array.from(this.segments.values());
  }

  count(): number {
    return this.segments.size;
  }
}

export const segmentRegistry = new SegmentRegistry();
