import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import path from "path";
import { fileURLToPath } from "url";
import { eq } from "drizzle-orm";
import router from "./routes";
import seoRouter from "./routes/seo";
import { logger } from "./lib/logger";
import { db, projectsTable } from "@workspace/db";
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
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const isReadOnlyMode = process.env["READ_ONLY_MODE"] === "true";
if (isReadOnlyMode) {
  app.use("/api", (req, res, next) => {
    const method = req.method.toUpperCase();
    if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
      next();
      return;
    }

    res.status(503).json({
      message:
        "API locale en mode lecture seule. Les modifications sont désactivées pour protéger les données de production.",
    });
  });
}

app.use(
  uploadUrlPath,
  express.static(uploadDir, {
    immutable: true,
    maxAge: "30d",
  }),
);

const uploadsUpstreamBaseUrl = process.env["UPLOADS_UPSTREAM_BASE_URL"]?.replace(/\/+$/, "");

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
      const rangeHeader = req.headers.range;

      if (rangeHeader) {
        // Query metadata first to get total size
        const streamPayload = await readGcsObjectStream(objectPath);
        if (!streamPayload) {
          res.status(404).send("File not found");
          return;
        }

        const totalSize = Number(streamPayload.metadata.size || 0);
        const parts = rangeHeader.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;

        if (start >= totalSize || end >= totalSize) {
          res.status(416).setHeader("Content-Range", `bytes */${totalSize}`);
          res.end();
          return;
        }

        const chunksize = (end - start) + 1;

        res.writeHead(206, {
          "Content-Range": `bytes ${start}-${end}/${totalSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunksize,
          "Content-Type": streamPayload.metadata.contentType || "video/mp4",
          "Cache-Control": streamPayload.metadata.cacheControl || "public, max-age=31536000",
        });

        // Request partial stream
        const partialPayload = await readGcsObjectStream(objectPath, { start, end });
        if (!partialPayload) {
          res.status(404).send("File not found");
          return;
        }

        partialPayload.stream.on("error", (err: any) => {
          logger.error({ err, objectPath }, "Error streaming partial media from GCS");
          if (!res.headersSent) {
            res.status(500).send("Storage read error");
          }
        });
        partialPayload.stream.pipe(res);
        return;
      }

      // Standard non-range request fallback
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
      res.setHeader("Accept-Ranges", "bytes");

      streamPayload.stream.on("error", (err: any) => {
        logger.error({ err, objectPath }, "Error streaming media from GCS");
        if (!res.headersSent) {
          res.status(500).send("Storage read error");
        }
      });
      streamPayload.stream.pipe(res);
    } catch (err: any) {
      logger.error({ err, objectPath }, "GCS media proxy failure");
      res.status(500).send("Storage service error");
    }
  });
}

if (uploadsUpstreamBaseUrl) {
  const escapedUploadPath = uploadUrlPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\/+$/, "");
  const uploadPathRegex = new RegExp(`^${escapedUploadPath}/(.+)$`);

  app.get(uploadPathRegex, (req, res) => {
    const objectPath = req.params[0];
    if (!objectPath) {
      res.status(404).send("File not found");
      return;
    }

    const upstreamUrl = `${uploadsUpstreamBaseUrl}/${objectPath}`;
    res.redirect(302, upstreamUrl);
  });
}

app.use(seoRouter);
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

  app.get(/^\/(?:nos-projets|projets)\/(\d+)\/?$/, async (req, res, next) => {
    try {
      const projectId = Number(req.params[0]);
      if (!Number.isFinite(projectId)) {
        next();
        return;
      }

      const [project] = await db
        .select({ slug: projectsTable.slug })
        .from(projectsTable)
        .where(eq(projectsTable.id, projectId));

      if (!project?.slug) {
        next();
        return;
      }

      res.redirect(301, `/nos-projets/${project.slug}`);
    } catch {
      next();
    }
  });

  app.use(express.static(frontendDist));
  // SPA fallback — send index.html for any non-API route (Express v5 syntax)
  app.get(/.*/, (_req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

export default app;
