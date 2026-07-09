/**
 * Calixo Platform - Analytics Annotation Registry
 *
 * Plain in-memory CRUD, same shape as every other registry in this
 * codebase (`SegmentRegistry`, `AnalyticsMetricRegistry`, ...). Not
 * persisted across a real page reload — same limitation every other
 * in-memory registry here has today.
 */
import { generateId } from "@/shared/utils/string";
import type { AnalyticsAnnotation } from "./types";

export class AnalyticsAnnotationRegistry {
  private annotations: AnalyticsAnnotation[] = [];

  create(chartId: string, date: string, note: string, author: string): AnalyticsAnnotation {
    const annotation: AnalyticsAnnotation = { id: generateId(10), chartId, date, note, author, createdAt: new Date().toISOString() };
    this.annotations.push(annotation);
    return annotation;
  }

  list(chartId: string): AnalyticsAnnotation[] {
    return this.annotations.filter(a => a.chartId === chartId).sort((a, b) => b.date.localeCompare(a.date));
  }

  remove(id: string): void {
    this.annotations = this.annotations.filter(a => a.id !== id);
  }
}

export const analyticsAnnotationRegistry = new AnalyticsAnnotationRegistry();
