import { logger } from "./lib/logger";

// Register global error handlers IMMEDIATELY before any other imports
process.on("uncaughtException", (err) => {
  console.error("CRITICAL: Uncaught Exception during startup", err);
  logger.error({ err }, "Uncaught Exception during startup");
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("CRITICAL: Unhandled Rejection during startup", reason);
  logger.error({ reason }, "Unhandled Rejection during startup");
});

import app from "./app";
import { seedIfEmpty } from "./seed";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

logger.info("Server process starting...");

// Start listening immediately to satisfy Cloud Run health checks
try {
  const server = app.listen(port, "0.0.0.0", () => {
    logger.info({ port }, "Server successfully listening on 0.0.0.0");

    // Seed demo data asynchronously in the background
    seedIfEmpty().catch((err) => {
      logger.error({ err }, "Background seed failed");
    });
  });

  server.on("error", (err) => {
    logger.error({ err }, "Server error after starting");
    process.exit(1);
  });
} catch (err) {
  logger.error({ err }, "Failed to call app.listen");
  process.exit(1);
}
