/**
 * Calixo Platform - Universal Connector Framework: Retry Manager
 *
 * Real exponential backoff for the 4 retryable failure classes the brief
 * names: timeout, network error, HTTP 429, and a temporary (5xx) provider
 * error. Everything else (400/401/403/404, validation errors) is NOT
 * retried — retrying a bad request or bad credentials forever would hide a
 * real configuration problem instead of surfacing it.
 */

export type RetryableErrorClass = "timeout" | "network_error" | "rate_limited" | "temporary_provider_error";

export interface RetryOptions {
  retries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  /** Defaults to `classifyError` below — override only for a provider with genuinely different semantics. */
  isRetryable?: (error: unknown) => boolean;
  onRetry?: (attempt: number, delayMs: number, error: unknown) => void;
}

/** A real, generic classifier: fetch's `AbortError`/timeout, network-level `TypeError: fetch failed`, an HTTP status of 429, or 5xx. */
export function classifyError(error: unknown): RetryableErrorClass | undefined {
  if (error instanceof Error) {
    if (error.name === "AbortError" || /timed? ?out/i.test(error.message)) return "timeout";
    if (/network|fetch failed|ECONNRESET|ETIMEDOUT|ENOTFOUND/i.test(error.message)) return "network_error";
  }
  const status = (error as { status?: number; statusCode?: number })?.status ?? (error as { statusCode?: number })?.statusCode;
  if (status === 429) return "rate_limited";
  if (status && status >= 500 && status < 600) return "temporary_provider_error";
  return undefined;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const retries = options.retries ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 500;
  const maxDelayMs = options.maxDelayMs ?? 15_000;
  const isRetryable = options.isRetryable ?? ((error: unknown) => classifyError(error) !== undefined);

  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (error) {
      attempt += 1;
      if (attempt > retries || !isRetryable(error)) throw error;
      const delayMs = Math.min(baseDelayMs * 2 ** (attempt - 1), maxDelayMs);
      options.onRetry?.(attempt, delayMs, error);
      await sleep(delayMs);
    }
  }
}

export const retryManager = { withRetry, classifyError };
