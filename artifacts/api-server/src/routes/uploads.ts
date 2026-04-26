import { Router, type Request, type Response } from "express";
import multer from "multer";
import { Storage } from "@google-cloud/storage";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Use memory storage for multer as we'll either write to GCS or Local
const upload = multer({ storage: multer.memoryStorage() });

const gcsBucketName = process.env.GROUPE_ACHARAF_UPLOADS_BUCKET;
// Google Cloud Storage client will automatically use Application Default Credentials
// In Cloud Run, it uses the service account automatically.
const gcs = gcsBucketName ? new Storage() : null;

router.post("/uploads", upload.single("file"), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const filename = `${Date.now()}-${req.file.originalname.replace(/\s+/g, "-")}`;

    if (gcs && gcsBucketName) {
      const bucket = gcs.bucket(gcsBucketName);
      const blob = bucket.file(filename);
      const blobStream = blob.createWriteStream({
        resumable: false,
        contentType: req.file.mimetype,
        metadata: {
            cacheControl: 'public, max-age=31536000',
        }
      });

      blobStream.on("error", (err) => {
        res.status(500).json({ error: err.message });
      });

      blobStream.on("finish", () => {
        // Return a relative URL so it goes through our /uploads proxy
        res.json({ url: `/uploads/${filename}` });
      });

      blobStream.end(req.file.buffer);
    } else {
      // Local fallback for development
      const uploadDir = path.resolve(__dirname, "..", "..", "public", "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const filepath = path.join(uploadDir, filename);
      fs.writeFileSync(filepath, req.file.buffer);
      
      // We assume the server is configured to serve /uploads as static
      res.json({ url: `/uploads/${filename}` });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Upload failed" });
  }
});

export default router;
