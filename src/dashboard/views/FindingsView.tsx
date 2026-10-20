import Link from "next/link";
import { ReportLayout } from "../components/ReportLayout";
import type { FindingsViewProps } from "../contracts/support-view-contract";

export function FindingsView({ result, error }: FindingsViewProps) {
  return <ReportLayout activeRoute="findings" homeHref="/"><Header /><p className="legacy-results-count">{result.count} resultado{result.count === 1 ? "" : "s"}</p>{error && <p role="alert">{error}</p>}<section className="legacy-route-table" aria-label="Hallazgos registrados"><table><thead><tr><th>Inspección</th><th>Fecha</th><th>Sección</th><th>Hallazgo</th><th>Observación</th><th>Acción</th></tr></thead><tbody>{result.data.map((row) => <tr key={row.id}><td><Link href={`/inspecciones/${encodeURIComponent(row.inspectionId)}`}>{row.inspectionId}</Link></td><td>{row.date ?? "—"}</td><td>{row.section ?? "Sin sección"}</td><td>{row.metric}</td><td>{row.observation ?? "Sin observaciones"}</td><td>{row.actionStatus.replaceAll("_", " ")}</td></tr>)}</tbody></table>{!result.data.length && <p className="legacy-empty">Sin hallazgos pendientes.</p>}</section></ReportLayout>;
}

function Header() { return <header className="legacy-route-header"><div><i aria-hidden="true" /><h1>Hallazgos</h1></div><p>Revisa las no conformidades detectadas y mantén su trazabilidad hasta la inspección de origen.</p></header>; }
