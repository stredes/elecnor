const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/u;

export function youtubeEmbedUrl(videoId: string | null): string | null {
  if (!videoId || !YOUTUBE_ID.test(videoId)) return null;
  return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`;
}
