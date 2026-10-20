import Link from "next/link";
import { ReportLayout } from "../components/ReportLayout";
import type { LogsViewProps } from "../contracts/support-view-contract";

export function LogsView({ result, error }: LogsViewProps) {
  return <ReportLayout activeRoute="logs" homeHref="/"><Header /><p className="legacy-results-count">{result.count} evento{result.count === 1 ? "" : "s"}</p>{error && <p role="alert">{error}</p>}<section className="legacy-route-table" aria-label="Registro de importación"><table><thead><tr><th>Fecha y hora</th><th>Tipo</th><th>Archivo</th><th>Inspección</th><th>Resultado</th><th>Mensaje</th><th>Duración</th></tr></thead><tbody>{result.data.map((row) => <tr key={row.id}><td>{row.datetime}</td><td>{row.type}</td><td>{row.file ?? "—"}</td><td>{row.inspectionId ? <Link href={`/inspecciones/${encodeURIComponent(row.inspectionId)}`}>{row.inspectionId}</Link> : "—"}</td><td>{row.result}</td><td>{row.message}</td><td>{row.duration} ms</td></tr>)}</tbody></table>{!result.data.length && <p className="legacy-empty">Sin actividad registrada.</p>}</section></ReportLayout>;
}

function Header() { return <header className="legacy-route-header"><div><i aria-hidden="true" /><h1>Registro de importación</h1></div><p>Consulta resultados, advertencias y tiempos de procesamiento por documento.</p></header>; }
