import path from "node:path";

export const uploadUrlPath = process.env["UPLOAD_URL_PATH"] ?? "/uploads";
export const uploadDir = process.env["UPLOAD_DIR"]
  ? path.resolve(process.env["UPLOAD_DIR"])
  : path.resolve(process.cwd(), "uploads");

export function publicUploadUrl(relativePath: string): string {
  const normalizedPath = relativePath.split(path.sep).join("/");
  const publicBase = process.env["PUBLIC_UPLOAD_BASE_URL"]?.replace(/\/+$/, "");

  if (publicBase) {
    return `${publicBase}/${normalizedPath}`;
  }

  return `${uploadUrlPath.replace(/\/+$/, "")}/${normalizedPath}`;
}
