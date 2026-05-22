import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes";
import { logger } from "./lib/logger";
import {
  uploadDir,
  uploadUrlPath,
  isGcsEnabled,
  readGcsObjectStream,
} from "./lib/upload-storage";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  uploadUrlPath,
  express.static(uploadDir, {
    immutable: true,
    maxAge: "30d",
  }),
);

if (isGcsEnabled) {
  const escapedUploadPath = uploadUrlPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\/+$/, "");
  const uploadPathRegex = new RegExp(`^${escapedUploadPath}/(.+)$`);

  app.get(uploadPathRegex, async (req, res) => {
    const objectPath = req.params[0];
    if (!objectPath) {
      res.status(404).send("File not found");
      return;
    }

    try {
      const streamPayload = await readGcsObjectStream(objectPath);
      if (!streamPayload) {
        res.status(404).send("File not found");
        return;
      }

      if (streamPayload.metadata.contentType) {
        res.setHeader("Content-Type", streamPayload.metadata.contentType);
      }
      if (streamPayload.metadata.cacheControl) {
        res.setHeader("Cache-Control", streamPayload.metadata.cacheControl);
      }

      streamPayload.stream.on("error", (err) => {
        logger.error({ err, objectPath }, "Error streaming media from GCS");
        if (!res.headersSent) {
          res.status(500).send("Storage read error");
        }
      });
      streamPayload.stream.pipe(res);
    } catch (err) {
      logger.error({ err, objectPath }, "GCS media proxy failure");
      res.status(500).send("Storage service error");
    }
  });
}

app.use("/api", router);

// Serve the Vite-built frontend in production
if (process.env.NODE_ENV === "production") {
  const frontendDist = path.resolve(
    __dirname,
    "..",
    "..",
    "groupe-acharaf",
    "dist",
    "public",
  );
  app.use(express.static(frontendDist));
  // SPA fallback — send index.html for any non-API route (Express v5 syntax)
  app.get(/.*/, (_req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

export default app;
