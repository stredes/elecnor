import Link from "next/link";
import { ReportLayout } from "@/dashboard/components/ReportLayout";
import type { ProcedureDetailViewProps } from "../contracts/procedure-detail-view-contract";
import { ProcedureVideo } from "../components/ProcedureVideo";

export function ProcedureDetailView({ detail, downloadHref, error }: ProcedureDetailViewProps) {
  if (!detail) return <ReportLayout activeRoute="procedures" homeHref="/"><p role="alert">{error ?? "El procedimiento no está disponible."}</p></ReportLayout>;
  const { procedure } = detail;
  const pdfHref = downloadHref ?? null;
  return <ReportLayout activeRoute="procedures" homeHref="/"><nav className="legacy-breadcrumb" aria-label="Breadcrumb"><Link href="/">Inicio</Link><span>/</span><Link href="/procedimientos">Procedimientos</Link><span>/</span><span aria-current="page">{procedure.title}</span></nav><header className="legacy-route-header legacy-procedure-detail-header"><div><span>{procedure.code ?? "Sin código"}</span><span>{procedure.area ?? "Sin área"}</span></div><h1>{procedure.title}</h1><p>Registrado el {procedure.createdAt.slice(0, 10)}</p></header>{procedure.description && <section className="legacy-content-card" aria-label="Información"><h2>Información</h2><p>{procedure.description}</p></section>}<section className="legacy-content-card" aria-label="PDF del procedimiento"><div className="legacy-content-card-heading"><h2>Documento del procedimiento</h2>{pdfHref && <a href={pdfHref} target="_blank" rel="noreferrer">Abrir PDF</a>}</div>{pdfHref ? <iframe src={pdfHref} title={`Documento PDF de ${procedure.title}`} loading="lazy" /> : <p>PDF no disponible en este entorno sintético.</p>}</section><section className="legacy-content-card" aria-label="Video del procedimiento"><h2>Video del procedimiento</h2><ProcedureVideo videoId={procedure.youtubeVideoId} title={procedure.title} /></section>
    </ReportLayout>;
}
