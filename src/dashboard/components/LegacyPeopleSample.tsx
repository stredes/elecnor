import type { PeopleSample, PeopleSampleBand } from "@/backend/domain/reporting/calculate-people-sample";

export function LegacyPeopleSample({ sample }: { readonly sample: PeopleSample }) {
  return <section className="legacy-people-sample" aria-labelledby="people-sample-title">
    <header className="legacy-people-sample-heading"><div><span>Métrica de la muestra</span><h3 id="people-sample-title">Resultado promedio por persona</h3></div><b>{sample.total.toLocaleString("es-CL")} personas</b></header>
    <p className="legacy-people-sample-intro">Cada nombre de la comparativa Elecnor cuenta una sola vez. La clasificación se realiza sobre el promedio de sus inspecciones con puntaje válido.</p>
    {sample.total ? <ul aria-label="Personas por nivel de cumplimiento">{sample.bands.map((band) => <PeopleSampleBandRow band={band} key={band.level} />)}</ul> : <p className="legacy-people-sample-empty">No hay personas con resultados válidos para clasificar.</p>}
    <span className="legacy-people-sample-total">Base: {sample.total.toLocaleString("es-CL")} nombres únicos de la comparativa Elecnor con al menos un resultado válido</span>
  </section>;
}

function PeopleSampleBandRow({ band }: { readonly band: PeopleSampleBand }) {
  const label = band.label.split("·").pop()?.trim() ?? band.label;
  return <li className={`legacy-people-sample-row is-level-${band.level}`}><div className="legacy-people-sample-label"><i aria-hidden="true" /><span><strong>{label}</strong><small>{band.people.toLocaleString("es-CL")} {band.people === 1 ? "persona" : "personas"}</small></span></div><b>{band.percentage.toFixed(1)}%</b><i className="legacy-people-sample-meter" aria-hidden="true"><em style={{ width: `${Math.max(0, Math.min(100, band.percentage))}%` }} /></i></li>;
}
