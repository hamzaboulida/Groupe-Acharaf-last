import crypto from "crypto";
import type { NextFunction, Request, Response } from "express";

const ADMIN_COOKIE = "ga_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

const ADMIN_USERNAME = process.env["ADMIN_USERNAME"] || "Admin";
const ADMIN_PASSWORD_SALT = process.env["ADMIN_PASSWORD_SALT"] || "groupe-acharaf-admin-v1";
const ADMIN_PASSWORD_HASH =
  process.env["ADMIN_PASSWORD_HASH"] ||
  "619b8448bd0401d7e3eb398f597f9bd782d9e5c97cbd64251eb0cb94ba220342";
const ADMIN_SESSION_SECRET =
  process.env["ADMIN_SESSION_SECRET"] || "groupe-acharaf-session-secret-change-me";
const FALLBACK_ADMIN_USERNAME = "Admin";
const FALLBACK_ADMIN_PASSWORD_SALT = "groupe-acharaf-admin-v1";
const FALLBACK_ADMIN_PASSWORD_HASH = "619b8448bd0401d7e3eb398f597f9bd782d9e5c97cbd64251eb0cb94ba220342";

type SessionPayload = {
  username: string;
  exp: number;
};

function hashPassword(password: string, salt: string): string {
  return crypto
    .pbkdf2Sync(password, salt, 210_000, 32, "sha256")
    .toString("hex");
}

function safeEqualHex(a: string, b: string) {
  const ab = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

function signValue(value: string) {
  return crypto.createHmac("sha256", ADMIN_SESSION_SECRET).update(value).digest("hex");
}

function encodeSession(payload: SessionPayload) {
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = signValue(body);
  return `${body}.${sig}`;
}

function decodeSession(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expectedSig = signValue(body);
  const sigA = Buffer.from(sig, "hex");
  const sigB = Buffer.from(expectedSig, "hex");
  if (sigA.length !== sigB.length || !crypto.timingSafeEqual(sigA, sigB)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
    if (!payload?.username || !payload.exp) return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS * 1000,
  };
}

export function setAdminSessionCookie(res: Response, username: string) {
  const token = encodeSession({
    username,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  });
  res.cookie(ADMIN_COOKIE, token, cookieOptions());
}

export function clearAdminSessionCookie(res: Response) {
  res.clearCookie(ADMIN_COOKIE, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

export function getAdminSession(req: Request): SessionPayload | null {
  const token = req.cookies?.[ADMIN_COOKIE];
  return decodeSession(token);
}

export function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const session = getAdminSession(req);
  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

export function verifyAdminCredentials(username: string, password: string) {
  const normalizedUsername = username.trim().toLowerCase();
  const candidateConfiguredHash = hashPassword(password, ADMIN_PASSWORD_SALT);
  const candidateFallbackHash = hashPassword(password, FALLBACK_ADMIN_PASSWORD_SALT);

  const matchesConfigured =
    normalizedUsername === ADMIN_USERNAME.trim().toLowerCase() &&
    safeEqualHex(candidateConfiguredHash, ADMIN_PASSWORD_HASH);

  const matchesFallback =
    normalizedUsername === FALLBACK_ADMIN_USERNAME.toLowerCase() &&
    safeEqualHex(candidateFallbackHash, FALLBACK_ADMIN_PASSWORD_HASH);

  return matchesConfigured || matchesFallback;
}
