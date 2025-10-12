import pino from "pino";

/**
 * Create a configured pino logger instance
 *
 * @param name - The name for the logger instance
 * @returns A configured pino logger
 */
export const createLogger = (name: string) => {
  return pino({
    name,
    level: process.env.LOG_LEVEL || "info",
    transport:
      process.env.NODE_ENV !== "production"
        ? {
            target: "pino-pretty",
            options: {
              colorize: true,
              translateTime: "HH:MM:ss Z",
              ignore: "pid,hostname",
            },
          }
        : undefined,
  });
};

/**
 * Default logger instance
 */
export const logger = createLogger("neon-prototype");
