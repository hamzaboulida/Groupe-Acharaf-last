import path from "node:path";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { Storage } from "@google-cloud/storage";

export const uploadUrlPath = process.env["UPLOAD_URL_PATH"] ?? "/uploads";
const explicitUploadDir = process.env["UPLOAD_DIR"]?.trim() ?? "";
export const uploadDir = process.env["UPLOAD_DIR"]
  ? path.resolve(process.env["UPLOAD_DIR"])
  : path.resolve(process.cwd(), "uploads");
export const gcsBucketName = process.env["GROUPE_ACHARAF_UPLOADS_BUCKET"]?.trim() ?? "";
export const isGcsEnabled = gcsBucketName.length > 0;

export function publicUploadUrl(relativePath: string): string {
  const normalizedPath = relativePath.split(path.sep).join("/");
  const publicBase = process.env["PUBLIC_UPLOAD_BASE_URL"]?.replace(/\/+$/, "");

  if (publicBase) {
    return `${publicBase}/${normalizedPath}`;
  }

  return `${uploadUrlPath.replace(/\/+$/, "")}/${normalizedPath}`;
}

export type UploadedAsset = {
  storagePath: string;
  publicUrl: string;
  mimeType: string;
  size: number;
};

type SaveUploadParams = {
  folder: "projects" | "videos" | "hero";
  originalName: string;
  mimeType: string;
  buffer: Buffer;
};

function safeBaseName(filename: string): string {
  return filename
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120) || "upload";
}

export async function saveUploadedAsset({
  folder,
  originalName,
  mimeType,
  buffer,
}: SaveUploadParams): Promise<UploadedAsset> {
  const extension = path.extname(originalName).toLowerCase();
  const base = safeBaseName(path.basename(originalName, extension));
  const objectName = `${folder}/${Date.now()}-${randomUUID()}-${base}${extension}`;

  if (isGcsEnabled) {
    const storage = new Storage();
    const bucket = storage.bucket(gcsBucketName);
    const file = bucket.file(objectName);
    await file.save(buffer, {
      resumable: false,
      contentType: mimeType,
      metadata: {
        cacheControl: "public, max-age=31536000, immutable",
      },
    });
    return {
      storagePath: objectName,
      publicUrl: publicUploadUrl(objectName),
      mimeType,
      size: buffer.length,
    };
  }

  if (process.env.NODE_ENV === "production" && !explicitUploadDir) {
    throw new Error(
      "Configuration stockage manquante: définissez GROUPE_ACHARAF_UPLOADS_BUCKET ou UPLOAD_DIR persistant en production.",
    );
  }

  const absoluteTarget = path.join(uploadDir, objectName);
  await mkdir(path.dirname(absoluteTarget), { recursive: true });
  await writeFile(absoluteTarget, buffer);
  return {
    storagePath: objectName,
    publicUrl: publicUploadUrl(objectName),
    mimeType,
    size: buffer.length,
  };
}

export async function readGcsObjectStream(
  objectPath: string,
  range?: { start: number; end: number },
) {
  if (!isGcsEnabled) return null;
  const storage = new Storage();
  const bucket = storage.bucket(gcsBucketName);
  const file = bucket.file(objectPath);
  const [exists] = await file.exists();
  if (!exists) return null;
  const [metadata] = await file.getMetadata();
  const streamOptions = range ? { start: range.start, end: range.end } : {};
  return {
    metadata,
    stream: file.createReadStream(streamOptions),
  };
}
