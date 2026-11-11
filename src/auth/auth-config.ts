export const SESSION_COOKIE_NAME = "elecnor_session";
export const SESSION_TTL_SECONDS = 8 * 60 * 60;

export function isAuthenticationEnabled(): boolean {
  return process.env.NODE_ENV === "production" ? process.env.AUTH_ENABLED !== "false" : process.env.AUTH_ENABLED === "true";
}
