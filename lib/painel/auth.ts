import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "crypto";
import { cookies } from "next/headers";

export const PAINEL_COOKIE = "jfv_painel_session";
export const PAINEL_SESSION_TTL = 8 * 60 * 60; // 8 horas

function sessionSecret(): string | null {
  const configured = process.env.PAINEL_SESSION_SECRET;
  if (configured) return configured;
  if (process.env.NODE_ENV !== "production") {
    return "dev-painel-session-secret-nao-use-em-producao";
  }
  return null;
}

function passwordHash(): string | null {
  return process.env.PAINEL_ADMIN_PASSWORD_HASH || null;
}

function passwordPlain(): string | null {
  return process.env.PAINEL_ADMIN_PASSWORD || null;
}

export function isPainelConfigured(): boolean {
  return Boolean(sessionSecret() && (passwordHash() || passwordPlain()));
}

export function verifyPainelPassword(password: string): boolean {
  const hash = passwordHash();

  if (hash) {
    const [algorithm, salt, expectedHex] = hash.split("$");
    if (algorithm !== "scrypt" || !salt || !expectedHex) return false;

    try {
      const actual = scryptSync(password, salt, 64);
      const expected = Buffer.from(expectedHex, "hex");
      if (actual.length !== expected.length) return false;
      return timingSafeEqual(actual, expected);
    } catch {
      return false;
    }
  }

  const plain = passwordPlain();
  if (!plain) return false;

  const actual = Buffer.from(password);
  const expected = Buffer.from(plain);
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

export function createPainelSession(): string {
  const secret = sessionSecret();
  if (!secret) {
    throw new Error("PAINEL_SESSION_SECRET não está configurado.");
  }

  const expiresAt = Math.floor(Date.now() / 1000) + PAINEL_SESSION_TTL;
  const nonce = randomBytes(12).toString("hex");
  const payload = `${expiresAt}.${nonce}`;
  const signature = createHmac("sha256", secret).update(payload).digest("hex");

  return `${payload}.${signature}`;
}

export function verifyPainelSession(token: string | undefined | null): boolean {
  if (!token) return false;

  const secret = sessionSecret();
  if (!secret) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [expiresAtRaw, nonce, signature] = parts;
  const expiresAt = Number(expiresAtRaw);

  if (!Number.isFinite(expiresAt)) return false;
  if (expiresAt < Math.floor(Date.now() / 1000)) return false;

  const expected = createHmac("sha256", secret)
    .update(`${expiresAtRaw}.${nonce}`)
    .digest("hex");

  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (actualBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(actualBuffer, expectedBuffer);
}

export function hasPainelSession(): boolean {
  return verifyPainelSession(cookies().get(PAINEL_COOKIE)?.value);
}

export function painelCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: PAINEL_SESSION_TTL,
  };
}
