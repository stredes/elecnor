import type { NextApiRequest, NextApiResponse } from "next";
import { SESSION_COOKIE_NAME } from "@/auth/auth-config";

export default function logout(request: NextApiRequest, response: NextApiResponse<{ readonly data: { readonly loggedOut: boolean } }>) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ data: { loggedOut: false } });
  }
  response.setHeader("Set-Cookie", `${SESSION_COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`);
  return response.status(200).json({ data: { loggedOut: true } });
}
