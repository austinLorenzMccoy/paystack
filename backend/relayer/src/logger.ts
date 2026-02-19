type LogLevel = "info" | "warn" | "error" | "debug";

const LEVEL_TAGS: Record<LogLevel, string> = {
  info: "INFO",
  warn: "WARN",
  error: "ERROR",
  debug: "DEBUG",
};

function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const timestamp = new Date().toISOString();
  if (meta) {
    console.log(`[${timestamp}] [${LEVEL_TAGS[level]}] ${message}`, meta);
  } else {
    console.log(`[${timestamp}] [${LEVEL_TAGS[level]}] ${message}`);
  }
}

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => log("info", message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => log("warn", message, meta),
  error: (message: string, meta?: Record<string, unknown>) => log("error", message, meta),
  debug: (message: string, meta?: Record<string, unknown>) => log("debug", message, meta),
};
