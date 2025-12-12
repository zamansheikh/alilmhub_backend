import { createLogger } from "winston";
import { consoleTransport, requestContext } from "./transport";

// Only use console transport for all environments
export const logger = createLogger({
  transports: [consoleTransport],
  exitOnError: false
});

// Helper function to log with a specific requestId (for non-HTTP contexts)
export const logWithRequestId = (requestId: string, level: string, message: string, meta?: any) => {
  requestContext.run({ requestId }, () => {
    (logger as any)[level](message, meta);
  });
};

