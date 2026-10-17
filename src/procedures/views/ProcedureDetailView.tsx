import Link from "next/link";
import { ReportLayout } from "@/dashboard/components/ReportLayout";
import type { ProcedureDetailViewProps } from "../contracts/procedure-detail-view-contract";

export function ProcedureDetailView({ detail }: ProcedureDetailViewProps) {
  const { procedure } = detail;
  return <ReportLayout activeRoute="procedures" homeHref="/"><nav className="legacy-breadcrumb" aria-label="Breadcrumb"><Link href="/">Inicio</Link><span>/</span><Link href="/procedimientos">Procedimientos</Link><span>/</span><span aria-current="page">{procedure.title}</span></nav><header className="legacy-route-header legacy-procedure-detail-header"><div><span>{procedure.code ?? "Sin código"}</span><span>{procedure.area ?? "Sin área"}</span></div><h1>{procedure.title}</h1><p>Registrado el {procedure.createdAt.slice(0, 10)}</p></header>{procedure.description && <section className="legacy-content-card" aria-label="Información"><h2>Información</h2><p>{procedure.description}</p></section>}<section className="legacy-content-card" aria-label="PDF del procedimiento"><div className="legacy-content-card-heading"><h2>PDF del procedimiento</h2><a href={detail.pdfUrl}>Abrir PDF sintético</a></div><object data={detail.pdfUrl} type="application/pdf" aria-label={`PDF de ${procedure.title}`}><p>El visor sintético no está disponible. <a href={detail.pdfUrl}>Descargar PDF sintético</a></p></object></section><section className="legacy-content-card" aria-label="Video del procedimiento"><h2>Video del procedimiento</h2><p>{detail.video?.status === "pending-policy" ? "Video pendiente de D-10." : "Video no disponible."}</p></section>
    </ReportLayout>;
}
