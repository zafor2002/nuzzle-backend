export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  method?: string;
  path?: string;
  statusCode?: number;
  durationMs?: number;
  message: string;
  error?: unknown;
  meta?: Record<string, unknown>;
}

// In-memory circular buffer for recent request logs (for /api/health and monitoring)
const RECENT_LOGS_LIMIT = 50;
const recentLogs: LogEntry[] = [];

export function logRequest(entry: Omit<LogEntry, 'timestamp' | 'level'>) {
  const fullEntry: LogEntry = {
    ...entry,
    level: entry.statusCode && entry.statusCode >= 500 ? 'error' : entry.statusCode && entry.statusCode >= 400 ? 'warn' : 'info',
    timestamp: new Date().toISOString(),
  };

  recentLogs.unshift(fullEntry);
  if (recentLogs.length > RECENT_LOGS_LIMIT) {
    recentLogs.pop();
  }

  const prefix = `[${fullEntry.timestamp}] [${fullEntry.level.toUpperCase()}]`;
  const routeInfo = `${fullEntry.method || 'REQ'} ${fullEntry.path || ''} ${fullEntry.statusCode || ''} (${fullEntry.durationMs?.toFixed(1) || 0}ms)`;
  
  if (fullEntry.level === 'error') {
    console.error(`${prefix} ${routeInfo} - ${fullEntry.message}`, fullEntry.error || '');
  } else if (fullEntry.level === 'warn') {
    console.warn(`${prefix} ${routeInfo} - ${fullEntry.message}`);
  } else {
    console.log(`${prefix} ${routeInfo} - ${fullEntry.message}`);
  }
}

export function logError(message: string, error: unknown, meta?: Record<string, unknown>) {
  const fullEntry: LogEntry = {
    timestamp: new Date().toISOString(),
    level: 'error',
    message,
    error,
    meta,
  };

  recentLogs.unshift(fullEntry);
  if (recentLogs.length > RECENT_LOGS_LIMIT) {
    recentLogs.pop();
  }

  console.error(`[${fullEntry.timestamp}] [ERROR] ${message}`, error);
}

export function getRecentLogs(): LogEntry[] {
  return [...recentLogs];
}

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => {
    const fullEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      meta,
    };
    recentLogs.unshift(fullEntry);
    if (recentLogs.length > RECENT_LOGS_LIMIT) recentLogs.pop();
    console.log(`[${fullEntry.timestamp}] [INFO] ${message}`, meta || '');
  },
  warn: (message: string, meta?: Record<string, unknown>) => {
    const fullEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      meta,
    };
    recentLogs.unshift(fullEntry);
    if (recentLogs.length > RECENT_LOGS_LIMIT) recentLogs.pop();
    console.warn(`[${fullEntry.timestamp}] [WARN] ${message}`, meta || '');
  },
  error: (message: string, error?: unknown, meta?: Record<string, unknown>) => {
    logError(message, error, meta);
  },
};
