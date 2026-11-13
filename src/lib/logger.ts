type Level = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_WEIGHT: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };
const minLevel: Level = import.meta.env.DEV ? 'debug' : 'warn';

function log(level: Level, scope: string, message: string, context?: unknown) {
  if (LEVEL_WEIGHT[level] < LEVEL_WEIGHT[minLevel]) return;
  const line = `[${scope}] ${message}`;
  if (context === undefined) console[level](line);
  else console[level](line, context);
}

export function createLogger(scope: string) {
  return {
    debug: (message: string, context?: unknown) => log('debug', scope, message, context),
    info: (message: string, context?: unknown) => log('info', scope, message, context),
    warn: (message: string, context?: unknown) => log('warn', scope, message, context),
    error: (message: string, context?: unknown) => log('error', scope, message, context),
  };
}
