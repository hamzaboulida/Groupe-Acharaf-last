import app from "./app";
import { logger } from "./lib/logger";
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

// Start listening immediately to satisfy Cloud Run health checks
app.listen(port, "0.0.0.0", (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening on 0.0.0.0");

  // Seed demo data asynchronously in the background
  seedIfEmpty().catch((err) => {
    logger.error({ err }, "Background seed failed");
  });
});
