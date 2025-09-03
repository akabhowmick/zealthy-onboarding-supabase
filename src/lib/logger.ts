export type LogLevel = "info" | "warn" | "error" | "debug";

function log(level: LogLevel, message: string, meta?: unknown) {
  const timestamp = new Date().toISOString();
  console[level](`[${timestamp}] [${level.toUpperCase()}] ${message}`, meta ?? "");
}

export const logger = {
  info: (msg: string, meta?: unknown) => log("info", msg, meta),
  warn: (msg: string, meta?: unknown) => log("warn", msg, meta),
  error: (msg: string, meta?: unknown) => log("error", msg, meta),
  debug: (msg: string, meta?: unknown) => log("debug", msg, meta),
};
