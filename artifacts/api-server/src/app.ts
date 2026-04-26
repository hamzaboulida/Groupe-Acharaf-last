import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes";
import { logger } from "./lib/logger";

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

app.use("/api", router);

// Serve uploads: GCS Proxy in production, local fallback in dev
const gcsBucketName = process.env.GROUPE_ACHARAF_UPLOADS_BUCKET;
if (process.env.NODE_ENV === "production" && gcsBucketName) {
  app.get("/uploads/:filename", async (req, res) => {
    try {
      const { Storage } = await import("@google-cloud/storage");
      const storage = new Storage();
      const bucket = storage.bucket(gcsBucketName);
      const file = bucket.file(req.params.filename);
      
      const [exists] = await file.exists();
      if (!exists) {
        return res.status(404).send("File not found in GCS");
      }

      // Stream the file from GCS to the response
      const stream = file.createReadStream();
      stream.on("error", (err) => {
        logger.error({ err, filename: req.params.filename }, "Error streaming from GCS");
        res.status(500).send("Error reading file");
      });

      // Set content type if possible
      const [metadata] = await file.getMetadata();
      if (metadata.contentType) {
        res.setHeader("Content-Type", metadata.contentType);
      }
      
      stream.pipe(res);
    } catch (err) {
      logger.error({ err }, "GCS Proxy error");
      res.status(500).send("Storage service error");
    }
  });
} else {
  const localUploads = path.resolve(__dirname, "..", "..", "public", "uploads");
  app.use("/uploads", express.static(localUploads));
}

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
