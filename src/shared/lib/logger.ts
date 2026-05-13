type LogLevel = 'info' | 'warn' | 'error'

interface LogEvent {
  level: LogLevel
  message: string
  context?: Record<string, unknown>
  timestamp: string
}

function log(level: LogLevel, message: string, context?: Record<string, unknown>) {
  const event: LogEvent = { level, message, context, timestamp: new Date().toISOString() }
  if (import.meta.env.DEV) {
    console[level](`[${event.timestamp}] ${message}`, context ?? '')
  }
  // [프로덕션 주석] 실제 환경에서는 Sentry.captureMessage() 또는 자체 로깅 엔드포인트 POST 호출
}

export const logger = {
  info: (message: string, context?: Record<string, unknown>) => log('info', message, context),
  warn: (message: string, context?: Record<string, unknown>) => log('warn', message, context),
  error: (message: string, context?: Record<string, unknown>) => log('error', message, context),
}
