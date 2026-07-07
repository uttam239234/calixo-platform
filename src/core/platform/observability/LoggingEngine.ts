/**
 * Calixo Platform - Structured Logging Platform
 *
 * `appLogger` (`@/logging`) is already the real, adopted structured logger
 * — used in 70 files, zero stray `console.*` calls anywhere else in this
 * codebase. This does not replace it; it's the one place that stamps rich,
 * request/execution-scoped context (trace/correlation/execution/connector/
 * API/AI ids) onto a log line via `appLogger.withContext()` rather than
 * every caller building that context object by hand.
 */
import { appLogger } from "@/logging";
import type { LogEntry, LogLevel } from "@/logging";

export class LoggingEngine {
  log(level: LogLevel, module: string, message: string, context?: LogEntry["context"], data?: unknown, error?: unknown): void {
    const scoped = appLogger.withContext(context ?? {});
    switch (level) {
      case "debug":
        scoped.debug(module, message, data);
        return;
      case "info":
        scoped.info(module, message, data);
        return;
      case "warn":
        scoped.warn(module, message, data, error);
        return;
      case "error":
        scoped.error(module, message, error, data);
        return;
    }
  }
}

export const loggingEngine = new LoggingEngine();
