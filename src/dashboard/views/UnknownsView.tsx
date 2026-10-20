import Link from "next/link";
import { ReportLayout } from "../components/ReportLayout";
import type { UnknownsViewProps } from "../contracts/support-view-contract";

export function UnknownsView({ result, error }: UnknownsViewProps) {
  return <ReportLayout activeRoute="unknowns" homeHref="/"><Header /><aside className="legacy-content-card"><strong>Revisión necesaria</strong><p>El texto original se conserva para asegurar la trazabilidad antes de clasificarlo.</p></aside><p className="legacy-results-count">{result.count} pendiente{result.count === 1 ? "" : "s"}</p>{error && <p role="alert">{error}</p>}<section className="legacy-route-table" aria-label="Métricas pendientes"><table><thead><tr><th>ID</th><th>Inspección</th><th>Métrica original</th><th>Normalizada</th><th>Archivo</th><th>Estado</th></tr></thead><tbody>{result.data.map((row) => <tr key={row.id}><td>{row.id}</td><td><Link href={`/inspecciones/${encodeURIComponent(row.inspectionId)}`}>{row.inspectionId}</Link></td><td>{row.metric}</td><td>{row.normalized}</td><td>{row.filename}</td><td>{row.status.replaceAll("_", " ")}</td></tr>)}</tbody></table>{!result.data.length && <p className="legacy-empty">Catálogo al día.</p>}</section></ReportLayout>;
}

function Header() { return <header className="legacy-route-header"><div><i aria-hidden="true" /><h1>Métricas sin clasificar</h1></div><p>Elementos conservados desde el documento original que requieren revisión del catálogo.</p></header>; }
