import { createHmac } from "node:crypto";
import { describe, expect, it, afterEach } from "vitest";
import { createDownloadAssertion } from "@/backend/composition/download-identity";
import { SESSION_COOKIE_NAME } from "@/auth/auth-config";

describe("download identity assertion", () => {
  const original = { auth: process.env.AUTH_SESSION_SECRET, assertion: process.env.INSPECTIONS_ASSERTION_SECRET };
  afterEach(() => {
    process.env.AUTH_SESSION_SECRET = original.auth;
    process.env.INSPECTIONS_ASSERTION_SECRET = original.assertion;
  });

  it("signs the authenticated user and browser signals for FastAPI", async () => {
    const authSecret = "auth-secret";
    const assertionSecret = "assertion-secret";
    const sessionPayload = Buffer.from(JSON.stringify({ sub: "auditor@example.test", role: "admin", exp: Date.now() + 60_000 })).toString("base64url");
    const session = `${sessionPayload}.${createHmac("sha256", authSecret).update(sessionPayload).digest("base64url")}`;
    process.env.AUTH_SESSION_SECRET = authSecret;
    process.env.INSPECTIONS_ASSERTION_SECRET = assertionSecret;
    const assertion = await createDownloadAssertion({
      cookies: { [SESSION_COOKIE_NAME]: session, elecnor_human_signal: "pointer:8" },
      headers: { "user-agent": "Chromium", "sec-ch-ua": "Chromium", "sec-ch-ua-platform": "Linux", "sec-fetch-mode": "navigate", "sec-fetch-user": "?1" },
      socket: { remoteAddress: "192.0.2.4" },
    } as never);
    const [payload, signature] = assertion.split(".");
    expect(createHmac("sha256", assertionSecret).update(payload).digest("base64url")).toBe(signature);
    expect(JSON.parse(Buffer.from(payload, "base64url").toString())).toMatchObject({ sub: "auditor@example.test", ip: "192.0.2.4", interaction: "pointer:8" });
  });

  it("rejects a request without a valid session", async () => {
    process.env.AUTH_SESSION_SECRET = "auth-secret";
    process.env.INSPECTIONS_ASSERTION_SECRET = "assertion-secret";
    await expect(createDownloadAssertion({ cookies: {}, headers: {}, socket: {} } as never)).rejects.toMatchObject({ status: 401 });
  });
});
