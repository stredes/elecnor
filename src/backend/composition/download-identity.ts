import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import type { NextApiRequest } from "next";
import { SESSION_COOKIE_NAME } from "@/auth/auth-config";

type SessionClaims = { readonly sub: string; readonly exp: number };

export class DownloadIdentityError extends Error {
  public constructor(
    public readonly status: 401 | 503,
    public readonly code: "DOWNLOAD_AUTH_REQUIRED" | "DOWNLOAD_IDENTITY_UNAVAILABLE",
    message: string,
  ) {
    super(message);
    this.name = "DownloadIdentityError";
  }
}

export async function createDownloadAssertion(request: NextApiRequest): Promise<string> {
  const sessionToken = request.cookies[SESSION_COOKIE_NAME];
  const session = verifySession(sessionToken, process.env.AUTH_SESSION_SECRET);
  if (!session) throw new DownloadIdentityError(401, "DOWNLOAD_AUTH_REQUIRED", "Autenticación requerida para descargar.");
  const assertionSecret = process.env.INSPECTIONS_ASSERTION_SECRET?.trim();
  if (!assertionSecret) throw new DownloadIdentityError(503, "DOWNLOAD_IDENTITY_UNAVAILABLE", "La identidad de descargas no está configurada.");
  const now = Math.floor(Date.now() / 1000);
  const claims = {
    v: 1, sub: session.sub, sid: createHash("sha256").update(sessionToken ?? "").digest("hex").slice(0, 64),
    iat: now, exp: Math.min(Math.floor(session.exp / 1000), now + 300),
    ip: firstHeader(request, "x-forwarded-for") ?? request.socket.remoteAddress ?? "",
    ua: firstHeader(request, "user-agent") ?? "", browser: firstHeader(request, "sec-ch-ua") ?? "",
    platform: firstHeader(request, "sec-ch-ua-platform") ?? "", interaction: request.cookies.elecnor_human_signal ?? "",
    fetch_mode: firstHeader(request, "sec-fetch-mode") ?? "", fetch_user: firstHeader(request, "sec-fetch-user") ?? "",
    referer: firstHeader(request, "referer") ?? "",
  };
  const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");
  const signature = createHmac("sha256", assertionSecret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function verifySession(token: string | undefined, secret: string | undefined): SessionClaims | null {
  if (!token || !secret) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  try {
    const expected = Buffer.from(createHmac("sha256", secret).update(payload).digest("base64url"));
    const received = Buffer.from(signature);
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Partial<SessionClaims>;
    return typeof claims.sub === "string" && claims.sub && typeof claims.exp === "number" && claims.exp > Date.now() ? { sub: claims.sub, exp: claims.exp } : null;
  } catch { return null; }
}

function firstHeader(request: NextApiRequest, name: string): string | undefined {
  const value = request.headers[name];
  if (Array.isArray(value)) return value[0]?.slice(0, 512);
  return value?.slice(0, 512);
}
