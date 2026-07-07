/**
 * Calixo Platform - Application Logging Framework
 * 
 * Production-safe logging with environment-aware behavior.
 * In development, logs to console with full detail.
 * In production, logs are structured for aggregation services.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  data?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
  context?: {
    userId?: string;
    organizationId?: string;
    workspaceId?: string;
    sessionId?: string;
    traceId?: string;
    correlationId?: string;
    executionId?: string;
    connectorId?: string;
    apiId?: string;
    aiContext?: { model?: string; provider?: string };
  };
}

export interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  sampleRate: number;
}

const DEFAULT_CONFIG: LoggerConfig = {
  minLevel: typeof process !== 'undefined' && process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  enableConsole: true,
  enableRemote: false,
  sampleRate: 1.0,
};

const LOG_LEVEL_RANK: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class AppLogger {
  private config: LoggerConfig;
  private context: LogEntry['context'] = {};

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  setContext(context: LogEntry['context']): void {
    this.context = { ...this.context, ...context };
  }

  setConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Returns a scoped logger carrying the given context on every call,
   * without mutating the shared `this.context` — `setContext()` is process-
   * global and unsafe for per-request/per-execution data in a concurrent
   * async runtime (one request's context could leak into another's log
   * lines between awaits). This is the Observability Platform's real entry
   * point for trace/correlation/execution-scoped structured logging.
   */
  withContext(context: LogEntry['context']): Pick<AppLogger, 'debug' | 'info' | 'warn' | 'error'> {
    const merged: LogEntry['context'] = { ...this.context, ...context };
    return {
      debug: (module: string, message: string, data?: unknown) => this.output(this.createEntry('debug', module, message, data, undefined, merged)),
      info: (module: string, message: string, data?: unknown) => this.output(this.createEntry('info', module, message, data, undefined, merged)),
      warn: (module: string, message: string, data?: unknown, error?: unknown) => this.output(this.createEntry('warn', module, message, data, error, merged)),
      error: (module: string, message: string, error?: unknown, data?: unknown) => this.output(this.createEntry('error', module, message, data, error, merged)),
    };
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_RANK[level] >= LOG_LEVEL_RANK[this.config.minLevel];
  }

  private shouldSample(): boolean {
    return Math.random() < this.config.sampleRate;
  }

  private createEntry(level: LogLevel, module: string, message: string, data?: unknown, error?: unknown, contextOverride?: LogEntry['context']): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      module,
      message,
      context: contextOverride ?? this.context,
    };

    if (data !== undefined) {
      entry.data = data as Record<string, unknown>;
    }

    if (error instanceof Error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: typeof process !== 'undefined' && process.env.NODE_ENV !== 'production' ? error.stack : undefined,
        code: (error as { code?: string }).code,
      };
    }

    return entry;
  }

  private output(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) return;
    if (!this.shouldSample()) return;

    if (this.config.enableConsole) {
      const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.module}]`;
      switch (entry.level) {
        case 'debug':
          console.debug(prefix, entry.message, entry.data || '', entry.error || '');
          break;
        case 'info':
          console.info(prefix, entry.message, entry.data || '');
          break;
        case 'warn':
          console.warn(prefix, entry.message, entry.data || '', entry.error || '');
          break;
        case 'error':
          console.error(prefix, entry.message, entry.error || '', entry.data || '');
          break;
      }
    }

    if (this.config.enableRemote && this.config.remoteEndpoint) {
      this.sendToRemote(entry);
    }
  }

  private async sendToRemote(entry: LogEntry): Promise<void> {
    try {
      const payload = JSON.stringify(entry);
      if (navigator.sendBeacon) {
        navigator.sendBeacon(this.config.remoteEndpoint!, payload);
      } else {
        await fetch(this.config.remoteEndpoint!, {
          method: 'POST',
          body: payload,
          headers: { 'Content-Type': 'application/json' },
          keepalive: true,
        });
      }
    } catch {
      // Silently fail - logging should never break the app
    }
  }

  debug(module: string, message: string, data?: unknown): void {
    this.output(this.createEntry('debug', module, message, data));
  }

  info(module: string, message: string, data?: unknown): void {
    this.output(this.createEntry('info', module, message, data));
  }

  warn(module: string, message: string, data?: unknown, error?: unknown): void {
    this.output(this.createEntry('warn', module, message, data, error));
  }

  error(module: string, message: string, error?: unknown, data?: unknown): void {
    this.output(this.createEntry('error', module, message, data, error));
  }

  time<T>(module: string, label: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    return fn().finally(() => {
      const duration = performance.now() - start;
      this.debug(module, `${label} completed in ${duration.toFixed(2)}ms`);
    });
  }
}

export const appLogger = new AppLogger();
export default appLogger;