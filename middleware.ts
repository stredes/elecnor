import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, isAuthenticationEnabled } from "@/auth/auth-config";

const PUBLIC_PATHS = new Set(["/login", "/api/auth/login", "/api/auth/logout", "/api/health"]);

export async function middleware(request: NextRequest) {
  if (!isAuthenticationEnabled() || PUBLIC_PATHS.has(request.nextUrl.pathname)) return NextResponse.next();
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (token && await validSession(token, process.env.AUTH_SESSION_SECRET)) return NextResponse.next();
  if (request.nextUrl.pathname.startsWith("/api/")) return NextResponse.json({ error: "Autenticación requerida." }, { status: 401 });
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

async function validSession(token: string, secret: string | undefined): Promise<boolean> {
  if (!secret) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  try {
    const decoded = JSON.parse(new TextDecoder().decode(decodeBase64Url(payload))) as { exp?: number };
    if (!decoded.exp || decoded.exp <= Date.now()) return false;
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
    return crypto.subtle.verify("HMAC", key, decodeBase64Url(signature), new TextEncoder().encode(payload));
  } catch { return false; }
}

function decodeBase64Url(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(normalized);
  return Uint8Array.from(binary, character => character.charCodeAt(0));
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|favicon.svg|sw.js).*)"] };
