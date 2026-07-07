/**
 * Calixo Platform - Tracing Platform API
 */
import { tracingEngine } from "./TracingEngine";
import type { Span, SpanKind, SpanStatus, Trace } from "./types";

export class TracingPlatformAPI {
  startTrace(): string {
    return tracingEngine.startTrace();
  }

  startSpan(params: { traceId: string; name: string; kind: SpanKind; parentSpanId?: string; organizationId?: string; workspaceId?: string; attributes?: Record<string, unknown> }): Span {
    return tracingEngine.startSpan(params);
  }

  endSpan(spanId: string, status?: SpanStatus, error?: string): Span | undefined {
    return tracingEngine.endSpan(spanId, status, error);
  }

  withSpan<T>(params: { traceId: string; name: string; kind: SpanKind; parentSpanId?: string; organizationId?: string; workspaceId?: string; attributes?: Record<string, unknown> }, fn: (spanId: string) => Promise<T>): Promise<T> {
    return tracingEngine.withSpan(params, fn);
  }

  getTrace(traceId: string): Trace | undefined {
    return tracingEngine.getTrace(traceId);
  }

  getSpan(spanId: string): Span | undefined {
    return tracingEngine.getSpan(spanId);
  }

  listRecentTraces(limit?: number): Trace[] {
    return tracingEngine.listRecentTraces(limit);
  }
}

export const tracingPlatformAPI = new TracingPlatformAPI();
