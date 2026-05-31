import { Router, type IRouter, type Request } from "express";
import { saveUploadedAsset } from "../lib/upload-storage";

const router: IRouter = Router();

const MAX_REQUEST_SIZE = Number(process.env["MAX_UPLOAD_REQUEST_BYTES"] ?? 60 * 1024 * 1024);
const maxImageSize = Number(process.env["MAX_UPLOAD_IMAGE_BYTES"] ?? 5 * 1024 * 1024);
const maxVideoSize = Number(process.env["MAX_UPLOAD_VIDEO_BYTES"] ?? 50 * 1024 * 1024);
const maxDocumentSize = Number(process.env["MAX_UPLOAD_DOCUMENT_BYTES"] ?? 5 * 1024 * 1024);

const imageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const videoTypes = new Set(["video/mp4", "video/webm"]);
const documentTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

type MultipartFile = {
  fieldName: string;
  filename: string;
  mimeType: string;
  content: Buffer;
};

class UploadError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
  }
}

function toErrorDetail(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

function mapUnknownUploadError(error: unknown): UploadError {
  const detail = toErrorDetail(error).toLowerCase();
  const code = (error as { code?: string | number } | undefined)?.code;

  if (code === "EACCES" || code === "EROFS") {
    return new UploadError(500, "Le dossier uploads est inaccessible.");
  }
  if (code === "ENOSPC") {
    return new UploadError(500, "Espace disque insuffisant pour enregistrer le fichier.");
  }
  if (detail.includes("default credentials")) {
    return new UploadError(500, "Configuration stockage manquante (credentials cloud indisponibles).");
  }
  if (detail.includes("storage.objects.create") || detail.includes("forbidden") || detail.includes("403")) {
    return new UploadError(500, "Le service de stockage n'a pas les permissions d'écriture nécessaires.");
  }
  if (detail.includes("bucket") && detail.includes("not")) {
    return new UploadError(500, "Configuration stockage manquante (bucket introuvable).");
  }
  if (detail.includes("@google-cloud/storage") || detail.includes("cannot find package")) {
    return new UploadError(500, "Configuration stockage manquante (client cloud indisponible).");
  }
  if (detail.includes("multipart")) {
    return new UploadError(400, "Requête upload invalide (multipart/form-data).");
  }

  return new UploadError(500, "Erreur serveur lors de l'upload.");
}

async function readRequestBuffer(req: Request): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let total = 0;

  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    total += buffer.length;
    if (total > MAX_REQUEST_SIZE) {
      throw new UploadError(413, "La taille totale des fichiers dépasse la limite autorisée.");
    }
    chunks.push(buffer);
  }

  return Buffer.concat(chunks);
}

function parseBoundary(contentType: string | undefined): string {
  const match = contentType?.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  const boundary = match?.[1] ?? match?.[2];
  if (!boundary) {
    throw new UploadError(400, "Requête multipart invalide.");
  }
  return boundary;
}

function parseMultipartFiles(body: Buffer, boundary: string): MultipartFile[] {
  const files: MultipartFile[] = [];
  const boundaryBuffer = Buffer.from(`--${boundary}`);
  const headerSeparator = Buffer.from("\r\n\r\n");
  let position = body.indexOf(boundaryBuffer);

  while (position !== -1) {
    let partStart = position + boundaryBuffer.length;
    if (body[partStart] === 45 && body[partStart + 1] === 45) break;
    if (body[partStart] === 13 && body[partStart + 1] === 10) partStart += 2;

    const nextBoundary = body.indexOf(boundaryBuffer, partStart);
    if (nextBoundary === -1) break;

    let partEnd = nextBoundary;
    if (body[partEnd - 2] === 13 && body[partEnd - 1] === 10) partEnd -= 2;

    const part = body.subarray(partStart, partEnd);
    const headerEnd = part.indexOf(headerSeparator);
    if (headerEnd !== -1) {
      const rawHeaders = part.subarray(0, headerEnd).toString("utf8");
      const content = part.subarray(headerEnd + headerSeparator.length);
      const disposition = rawHeaders.match(/^content-disposition:\s*form-data;(.+)$/im)?.[1] ?? "";
      const fieldName = disposition.match(/name="([^"]+)"/i)?.[1] ?? "";
      const filename = disposition.match(/filename="([^"]*)"/i)?.[1] ?? "";
      const mimeType = rawHeaders.match(/^content-type:\s*([^\r\n]+)/im)?.[1]?.trim().toLowerCase() ?? "";

      if (filename) {
        files.push({ fieldName, filename, mimeType, content });
      }
    }
    position = nextBoundary;
  }

  return files;
}

function validateFiles(files: MultipartFile[], kind: "image" | "video" | "document"): void {
  if (!files.length) {
    throw new UploadError(400, "Aucun fichier reçu.");
  }

  for (const file of files) {
    if (!file.content.length) {
      throw new UploadError(400, "Le fichier sélectionné est vide.");
    }
    if (kind === "image") {
      if (!imageTypes.has(file.mimeType)) {
        throw new UploadError(415, "Formats images acceptés : JPG, PNG, WEBP.");
      }
      if (file.content.length > maxImageSize) {
        throw new UploadError(413, `Chaque image doit faire moins de ${Math.round(maxImageSize / (1024 * 1024))} Mo.`);
      }
    } else if (kind === "video") {
      if (!videoTypes.has(file.mimeType)) {
        throw new UploadError(415, "Formats vidéo acceptés : MP4, WEBM.");
      }
      if (file.content.length > maxVideoSize) {
        throw new UploadError(413, `Chaque vidéo doit faire moins de ${Math.round(maxVideoSize / (1024 * 1024))} Mo.`);
      }
    } else {
      if (!documentTypes.has(file.mimeType)) {
        throw new UploadError(415, "Formats CV acceptés : PDF, DOC, DOCX.");
      }
      if (file.content.length > maxDocumentSize) {
        throw new UploadError(413, `Chaque document doit faire moins de ${Math.round(maxDocumentSize / (1024 * 1024))} Mo.`);
      }
    }
  }
}

async function handleUpload(
  req: Request,
  kind: "image" | "video" | "document",
  folder: "projects" | "videos" | "documents",
) {
  const boundary = parseBoundary(req.headers["content-type"]);
  const body = await readRequestBuffer(req);
  const files = parseMultipartFiles(body, boundary);
  validateFiles(files, kind);

  return Promise.all(
    files.map(async (file) => {
      const saved = await saveUploadedAsset({
        folder,
        originalName: file.filename,
        mimeType: file.mimeType,
        buffer: file.content,
      });
      return {
        fieldName: file.fieldName,
        originalName: file.filename,
        mimeType: file.mimeType,
        size: file.content.length,
        url: saved.publicUrl,
        storagePath: saved.storagePath,
      };
    }),
  );
}

router.post("/uploads/images", async (req, res): Promise<void> => {
  try {
    req.log.info(
      { contentType: req.headers["content-type"], contentLength: req.headers["content-length"] },
      "Image upload started",
    );
    const uploaded = await handleUpload(req, "image", "projects");
    req.log.info({ count: uploaded.length, firstUrl: uploaded[0]?.url }, "Image upload success");
    res.status(201).json({ files: uploaded });
  } catch (error: any) {
    if (error instanceof UploadError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    const mapped = mapUnknownUploadError(error);
    req.log.error({ err: error, mappedError: mapped.message }, "Image upload failed");
    res.status(mapped.statusCode).json({ error: mapped.message, detail: toErrorDetail(error) });
  }
});

router.post("/uploads/videos", async (req, res): Promise<void> => {
  try {
    req.log.info(
      { contentType: req.headers["content-type"], contentLength: req.headers["content-length"] },
      "Video upload started",
    );
    const uploaded = await handleUpload(req, "video", "videos");
    req.log.info({ count: uploaded.length, firstUrl: uploaded[0]?.url }, "Video upload success");
    res.status(201).json({ files: uploaded });
  } catch (error: any) {
    if (error instanceof UploadError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    const mapped = mapUnknownUploadError(error);
    req.log.error({ err: error, mappedError: mapped.message }, "Video upload failed");
    res.status(mapped.statusCode).json({ error: mapped.message, detail: toErrorDetail(error) });
  }
});

router.post("/uploads/documents", async (req, res): Promise<void> => {
  try {
    req.log.info(
      { contentType: req.headers["content-type"], contentLength: req.headers["content-length"] },
      "Document upload started",
    );
    const uploaded = await handleUpload(req, "document", "documents");
    req.log.info({ count: uploaded.length, firstUrl: uploaded[0]?.url }, "Document upload success");
    res.status(201).json({ files: uploaded });
  } catch (error: any) {
    if (error instanceof UploadError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    const mapped = mapUnknownUploadError(error);
    req.log.error({ err: error, mappedError: mapped.message }, "Document upload failed");
    res.status(mapped.statusCode).json({ error: mapped.message, detail: toErrorDetail(error) });
  }
});

router.post("/uploads", async (req, res): Promise<void> => {
  try {
    req.log.info(
      { contentType: req.headers["content-type"], contentLength: req.headers["content-length"] },
      "Legacy upload started",
    );
    const boundary = parseBoundary(req.headers["content-type"]);
    const body = await readRequestBuffer(req);
    const files = parseMultipartFiles(body, boundary);
    if (!files.length) {
      res.status(400).json({ error: "Aucun fichier reçu." });
      return;
    }
    const first = files[0];
    const kind = first.mimeType.startsWith("video/") ? "video" : "image";
    validateFiles([first], kind);
    const saved = await saveUploadedAsset({
      folder: kind === "video" ? "videos" : "projects",
      originalName: first.filename,
      mimeType: first.mimeType,
      buffer: first.content,
    });
    req.log.info({ url: saved.publicUrl, mimeType: first.mimeType }, "Legacy upload success");
    res.status(201).json({ url: saved.publicUrl, storagePath: saved.storagePath });
  } catch (error: any) {
    if (error instanceof UploadError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    const mapped = mapUnknownUploadError(error);
    req.log.error({ err: error, mappedError: mapped.message }, "Legacy upload failed");
    res.status(mapped.statusCode).json({ error: mapped.message, detail: toErrorDetail(error) });
  }
});

export default router;
