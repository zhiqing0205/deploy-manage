import crypto from "node:crypto";

export const SESSION_COOKIE_NAME = "deploy_manage_session";
const SESSION_TTL_DAYS = 14;

type SessionPayload = {
  u: string;
  exp: number; // unix ms
};

function base64UrlEncode(input: Buffer | string): string {
  const buf = typeof input === "string" ? Buffer.from(input, "utf8") : input;
  return buf
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function base64UrlDecodeToBuffer(input: string): Buffer {
  const b64 = input.replaceAll("-", "+").replaceAll("_", "/");
  const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
  return Buffer.from(b64 + pad, "base64");
}

function sign(data: string, secret: string): Buffer {
  return crypto.createHmac("sha256", secret).update(data).digest();
}

function safeEqual(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function createSessionToken(params: {
  username: string;
  secret: string;
  now?: number;
}): string {
  const now = params.now ?? Date.now();
  const exp = now + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;
  const payload: SessionPayload = { u: params.username, exp };
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const sig = sign(payloadB64, params.secret);
  const sigB64 = base64UrlEncode(sig);
  return `${payloadB64}.${sigB64}`;
}

export function verifySessionToken(params: {
  token: string;
  secret: string;
  now?: number;
}): SessionPayload | null {
  const now = params.now ?? Date.now();
  const [payloadB64, sigB64] = params.token.split(".");
  if (!payloadB64 || !sigB64) return null;

  let payloadRaw: string;
  try {
    payloadRaw = base64UrlDecodeToBuffer(payloadB64).toString("utf8");
  } catch {
    return null;
  }

  let payload: SessionPayload;
  try {
    payload = JSON.parse(payloadRaw) as SessionPayload;
  } catch {
    return null;
  }

  if (!payload?.u || typeof payload.exp !== "number") return null;
  if (payload.exp <= now) return null;

  const expectedSig = sign(payloadB64, params.secret);
  let sig: Buffer;
  try {
    sig = base64UrlDecodeToBuffer(sigB64);
  } catch {
    return null;
  }

  if (!safeEqual(sig, expectedSig)) return null;
  return payload;
}

