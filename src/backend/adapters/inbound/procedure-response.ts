import type { Procedure, ProcedureList } from "../../domain/procedures/procedure-contract";
import type { PublicProcedure, PublicProcedureList } from "./procedure-response-contract";

export type { PublicProcedure, PublicProcedureList } from "./procedure-response-contract";

export function toPublicProcedure(procedure: Procedure): PublicProcedure {
  return {
    id: procedure.id, title: procedure.title, code: procedure.code, area: procedure.area,
    description: procedure.description, youtube_video_id: procedure.youtubeVideoId,
    pdf_url: procedure.pdfUrl, filename: procedure.filename,
    created_at: procedure.createdAt, updated_at: procedure.updatedAt,
  };
}

export function toPublicProcedureList(list: ProcedureList): PublicProcedureList {
  return { total: list.total, data: list.data.map(toPublicProcedure) };
}
