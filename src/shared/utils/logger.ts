/**
 * Platform logger - NOT for production-sensitive logging.
 * This is a client-side logger for development debugging only.
 * Production-safe logging should use server-side logging services.
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
} as const;

type LogLevel = keyof typeof LOG_LEVELS;

const CURRENT_LEVEL: LogLevel = 
  (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') 
    ? 'INFO' 
    : 'DEBUG';

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[CURRENT_LEVEL];
}

function formatMessage(level: LogLevel, module: string, message: string, data?: unknown): string {
  const timestamp = new Date().toISOString();
  const dataStr = data !== undefined ? ` ${JSON.stringify(data)}` : '';
  return `[${timestamp}] [${level}] [${module}] ${message}${dataStr}`;
}

export const logger = {
  debug(module: string, message: string, data?: unknown): void {
    if (!shouldLog('DEBUG')) return;
    if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
      console.debug(formatMessage('DEBUG', module, message, data));
    }
  },

  info(module: string, message: string, data?: unknown): void {
    if (!shouldLog('INFO')) return;
    console.info(formatMessage('INFO', module, message, data));
  },

  warn(module: string, message: string, data?: unknown): void {
    if (!shouldLog('WARN')) return;
    console.warn(formatMessage('WARN', module, message, data));
  },

  error(module: string, message: string, error?: unknown): void {
    if (!shouldLog('ERROR')) return;
    console.error(formatMessage('ERROR', module, message), error);
  },

  group(module: string, label: string): void {
    if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
      console.group(`[${module}] ${label}`);
    }
  },

  groupEnd(): void {
    if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
      console.groupEnd();
    }
  },
};

export type Logger = typeof logger;