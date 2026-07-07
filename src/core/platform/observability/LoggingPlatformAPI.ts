/**
 * Calixo Platform - Logging Platform API
 */
import type { LogEntry, LogLevel } from "@/logging";
import { loggingEngine } from "./LoggingEngine";

export class LoggingPlatformAPI {
  log(level: LogLevel, module: string, message: string, context?: LogEntry["context"], data?: unknown, error?: unknown): void {
    loggingEngine.log(level, module, message, context, data, error);
  }

  debug(module: string, message: string, context?: LogEntry["context"], data?: unknown): void {
    loggingEngine.log("debug", module, message, context, data);
  }

  info(module: string, message: string, context?: LogEntry["context"], data?: unknown): void {
    loggingEngine.log("info", module, message, context, data);
  }

  warn(module: string, message: string, context?: LogEntry["context"], data?: unknown, error?: unknown): void {
    loggingEngine.log("warn", module, message, context, data, error);
  }

  error(module: string, message: string, context?: LogEntry["context"], error?: unknown, data?: unknown): void {
    loggingEngine.log("error", module, message, context, data, error);
  }
}

export const loggingPlatformAPI = new LoggingPlatformAPI();
