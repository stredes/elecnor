import { youtubeEmbedUrl } from "@/backend/domain/procedures/procedure-media";
import type { ProcedureVideoProps } from "../contracts/procedure-video-contract";

export function ProcedureVideo({ videoId, title }: ProcedureVideoProps) {
  const src = youtubeEmbedUrl(videoId);
  if (!src) return <p>Video no disponible.</p>;
  return <div className="legacy-procedure-video"><iframe src={src} title={title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen loading="lazy" referrerPolicy="strict-origin-when-cross-origin" /></div>;
}
