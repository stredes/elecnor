import Link from "next/link";
import { ReportLayout } from "@/dashboard/components/ReportLayout";
import type { ProcedureDetailViewProps } from "../contracts/procedure-detail-view-contract";

export function ProcedureDetailView({ detail }: ProcedureDetailViewProps) {
  const { procedure } = detail;
  return <ReportLayout activeRoute="procedures"><header className="dashboard-header"><div><p className="eyebrow">ELECNOR · PROCEDIMIENTO</p><h1>{procedure.title}</h1><p>{procedure.code ?? "Sin código"} · {procedure.area ?? "Sin área"}</p></div><Link href="/procedimientos">Volver al catálogo</Link></header>
    {procedure.description && <section aria-label="Información"><h2>Información</h2><p>{procedure.description}</p></section>}
    <section aria-label="PDF del procedimiento"><h2>PDF del procedimiento</h2><a href={detail.pdfUrl}>Abrir PDF sintético</a><div id="pdf-synthetic">Vista previa PDF sintética no activada.</div></section>
    <section aria-label="Video del procedimiento"><h2>Video del procedimiento</h2><p>{procedure.youtubeVideoId ? "Video pendiente de D-10." : "Video no disponible."}</p></section>
  </ReportLayout>;
}
