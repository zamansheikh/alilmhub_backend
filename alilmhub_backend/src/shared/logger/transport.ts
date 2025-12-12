import { format, transports } from "winston";
const { combine, timestamp, label, printf } = format;
import { AsyncLocalStorage } from "async_hooks";

// Create async local storage for request context
export const requestContext = new AsyncLocalStorage<{ requestId: string }>();

// Custom format to add requestId from async context or metadata
const addRequestId = format((info) => {
  // Try to get requestId from async local storage first
  const context = requestContext.getStore();
  if (context?.requestId) {
    info.requestId = context.requestId;
  }
  // If not in async context, keep existing requestId from metadata
  return info;
})();

const myFormat = printf(({ level, message, label, timestamp, ...metadata }) => {
  const date = new Date(timestamp as string);
  const hour = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  const meta = Object.keys(metadata).length ? JSON.stringify(metadata) : "";
  return `${date.toDateString()} ${hour}:${minutes}:${seconds} [${label}] ${level}: ${message} ${meta}`;
});

export const consoleTransport = new transports.Console({
  level: "info",
  format: combine(label({ label: "alilmhub" }), timestamp(), addRequestId, myFormat),
});
