import Link from "next/link";
import { LegacyDataToolbar } from "../components/LegacyDataToolbar";
import { ReportLayout } from "../components/ReportLayout";

export function ImportView() {
  return <ReportLayout activeRoute="import" homeHref="/"><LegacyDataToolbar /><nav className="legacy-breadcrumb" aria-label="Breadcrumb"><Link href="/">Inicio</Link><span>/</span><span aria-current="page">Importar PDFs</span></nav><header className="legacy-route-header"><div><i aria-hidden="true" /><h1>Importar documentos</h1></div><Link href="/">Volver al dashboard</Link><p>Selecciona o arrastra PDFs para procesarlos mediante el backend y conservar su trazabilidad.</p></header><section className="legacy-content-card"><h2>Importación temporal</h2><p>La selección se envía en memoria al BFF. El backend aplica validación, idempotencia y los estados parciales sin exponer credenciales ni acceder directamente desde el navegador a PostgreSQL.</p><p>Máximo 20 archivos por operación y 15 MB por archivo.</p></section></ReportLayout>;
}
