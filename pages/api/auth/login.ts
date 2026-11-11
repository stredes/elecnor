import type { NextApiRequest, NextApiResponse } from "next";
import { createHmac } from "node:crypto";
import { SESSION_COOKIE_NAME, SESSION_TTL_SECONDS } from "@/auth/auth-config";
import { verifyPassword } from "@/auth/password";

type LoginResponse = { readonly data?: { readonly email: string }; readonly error?: string };
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

export default function login(request: NextApiRequest, response: NextApiResponse<LoginResponse>) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Método no permitido." });
  }
  const clientKey = request.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() || request.socket.remoteAddress || "unknown";
  if (!allowedAttempt(clientKey)) return response.status(429).json({ error: "Demasiados intentos. Espera unos minutos." });
  const email = typeof request.body?.email === "string" ? request.body.email.trim().toLowerCase() : "";
  const password = typeof request.body?.password === "string" ? request.body.password : "";
  const expectedEmail = process.env.AUTH_TEST_EMAIL?.trim().toLowerCase();
  const passwordHash = process.env.AUTH_TEST_PASSWORD_HASH?.trim();
  const secret = process.env.AUTH_SESSION_SECRET?.trim();
  if (!expectedEmail || !passwordHash || !secret) return response.status(503).json({ error: "La autenticación no está configurada." });
  if (email !== expectedEmail || !verifyPassword(password, passwordHash)) return response.status(401).json({ error: "Correo o clave incorrectos." });
  attempts.delete(clientKey);
  const token = createSessionToken(email, secret);
  response.setHeader("Set-Cookie", `${SESSION_COOKIE_NAME}=${token}; Path=/; Max-Age=${SESSION_TTL_SECONDS}; HttpOnly; Secure; SameSite=Lax`);
  return response.status(200).json({ data: { email } });
}

function allowedAttempt(key: string): boolean {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) { attempts.set(key, { count: 1, resetAt: now + WINDOW_MS }); return true; }
  if (current.count >= MAX_ATTEMPTS) return false;
  current.count += 1;
  return true;
}

function createSessionToken(email: string, secret: string): string {
  const payload = Buffer.from(JSON.stringify({ sub: email, exp: Date.now() + SESSION_TTL_SECONDS * 1000 })).toString("base64url");
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}
