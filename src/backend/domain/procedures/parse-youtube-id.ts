const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const HOSTS = new Set(["youtube.com", "m.youtube.com", "music.youtube.com", "youtu.be", "youtube-nocookie.com"]);
const PREFIXES = ["/embed/", "/shorts/", "/live/", "/v/"];

export function parseYoutubeId(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const candidate = raw.trim();
  if (YOUTUBE_ID.test(candidate)) return candidate;
  let url: URL;
  try { url = new URL(candidate); } catch { return null; }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  if (!HOSTS.has(host)) return null;
  const found = videoId(url, host);
  return found && YOUTUBE_ID.test(found) ? found : null;
}

function videoId(url: URL, host: string): string | null {
  if (host === "youtu.be") return url.pathname.split("/").filter(Boolean)[0] ?? null;
  const prefix = PREFIXES.find((item) => url.pathname.startsWith(item));
  if (prefix) return url.pathname.slice(prefix.length).split("/")[0] ?? null;
  return url.pathname.replace(/\/$/, "") === "/watch" ? url.searchParams.get("v") : null;
}
