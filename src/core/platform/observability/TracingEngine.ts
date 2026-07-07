/**
 * Calixo Platform - Distributed Tracing Platform
 *
 * Genuinely new — nothing in this codebase correlated a request/execution
 * across module boundaries before this (a grep for trace/span/correlation
 * concepts turned up only isolated `correlationId` fields on individual
 * event/job records, never a shared trace). "Distributed" is scoped
 * honestly: this correlates spans across Gateway -> Execution -> Workflow ->
 * Connector calls within one Node process — there is no multi-host
 * architecture in this codebase to trace across yet.
 */
import { generateId } from "@/shared/utils/string";
import type { Span, SpanKind, SpanStatus, Trace } from "./types";

const MAX_TRACES = 2000;

export class TracingEngine {
  private traces = new Map<string, Trace>();
  private spans = new Map<string, Span>();
  private traceOrder: string[] = [];

  startTrace(): string {
    const traceId = generateId(16);
    this.traces.set(traceId, { id: traceId, spans: [], startedAt: new Date().toISOString() });
    this.traceOrder.push(traceId);
    if (this.traceOrder.length > MAX_TRACES) {
      const evicted = this.traceOrder.shift();
      if (evicted) {
        for (const span of this.traces.get(evicted)?.spans ?? []) this.spans.delete(span.id);
        this.traces.delete(evicted);
      }
    }
    return traceId;
  }

  startSpan(params: {
    traceId: string;
    name: string;
    kind: SpanKind;
    parentSpanId?: string;
    organizationId?: string;
    workspaceId?: string;
    attributes?: Record<string, unknown>;
  }): Span {
    const span: Span = {
      id: generateId(12),
      traceId: params.traceId,
      parentSpanId: params.parentSpanId,
      name: params.name,
      kind: params.kind,
      status: "ok",
      startedAt: new Date().toISOString(),
      organizationId: params.organizationId,
      workspaceId: params.workspaceId,
      attributes: params.attributes ?? {},
    };
    this.spans.set(span.id, span);
    this.traces.get(params.traceId)?.spans.push(span);
    return { ...span };
  }

  endSpan(spanId: string, status: SpanStatus = "ok", error?: string): Span | undefined {
    const span = this.spans.get(spanId);
    if (!span) return undefined;
    span.endedAt = new Date().toISOString();
    span.durationMs = new Date(span.endedAt).getTime() - new Date(span.startedAt).getTime();
    span.status = status;
    if (error) span.error = error;
    this.refreshTraceDuration(span.traceId);
    return { ...span };
  }

  private refreshTraceDuration(traceId: string): void {
    const trace = this.traces.get(traceId);
    if (!trace) return;
    const allEnded = trace.spans.every(s => s.endedAt);
    if (allEnded && trace.spans.length > 0) {
      trace.endedAt = trace.spans.reduce((latest, s) => (s.endedAt && s.endedAt > latest ? s.endedAt : latest), trace.spans[0].endedAt!);
      trace.durationMs = new Date(trace.endedAt).getTime() - new Date(trace.startedAt).getTime();
    }
  }

  /** Starts a span, runs `fn`, ends the span on success or error — mirrors `MetricsEngine.time()`'s ergonomics so instrumenting a call site is one wrapper, not four manual calls. */
  async withSpan<T>(
    params: { traceId: string; name: string; kind: SpanKind; parentSpanId?: string; organizationId?: string; workspaceId?: string; attributes?: Record<string, unknown> },
    fn: (spanId: string) => Promise<T>
  ): Promise<T> {
    const span = this.startSpan(params);
    try {
      const result = await fn(span.id);
      this.endSpan(span.id, "ok");
      return result;
    } catch (error) {
      this.endSpan(span.id, "error", (error as Error).message);
      throw error;
    }
  }

  getTrace(traceId: string): Trace | undefined {
    const trace = this.traces.get(traceId);
    return trace ? { ...trace, spans: [...trace.spans] } : undefined;
  }

  getSpan(spanId: string): Span | undefined {
    const span = this.spans.get(spanId);
    return span ? { ...span } : undefined;
  }

  listRecentTraces(limit = 50): Trace[] {
    return this.traceOrder.slice(-limit).map(id => this.traces.get(id)!).filter(Boolean);
  }

  count(): number {
    return this.traces.size;
  }
}

export const tracingEngine = new TracingEngine();
