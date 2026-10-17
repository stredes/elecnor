import { LegacyReadingGuide } from "./LegacyReadingGuide";
import { LegacyReportShell } from "./LegacyReportShell";

const terms = [
  ["Aplicables", "Cantidad de inspecciones donde ese ítem realmente podía evaluarse.", "Da peso estadístico a la lectura del indicador."],
  ["Conformes", "Casos en que el estándar se cumplió.", "Es la parte del numerador del cumplimiento."],
  ["No conformes", "Casos en que el estándar no se cumplió.", "Mide la brecha real y su frecuencia."],
  ["N/A", "Casos no aplicables o no comparables.", "Se excluyen del cálculo del porcentaje."],
  ["Cumplimiento", "Conformes / (Conformes + No conformes).", "Permite comparar estabilidad o fragilidad entre prácticas."],
  ["Sección", "Bloque temático que agrupa varias métricas relacionadas.", "Muestra en qué fase del proceso aparece la brecha."],
] as const;

export function LegacyGlossarySection() {
  return <LegacyReportShell index="1" title="Qué estamos analizando" lead="Cada PDF corresponde a una inspección. Al consolidarlos pasamos de la observación individual a una mirada de comportamiento del sistema. Eso permite distinguir hallazgos aislados de patrones estructurales."><div className="legacy-table-wrap"><table className="legacy-table"><caption className="visually-hidden">Glosario de términos del informe</caption><thead><tr><th>Término</th><th>Qué significa</th><th>Por qué importa</th></tr></thead><tbody>{terms.map(([term, meaning, why]) => <tr key={term}><th>{term}</th><td>{meaning}</td><td>{why}</td></tr>)}</tbody></table></div><div className="legacy-mobile-cards">{terms.map(([term, meaning, why]) => <article key={term}><b>{term}</b><dl><dt>Qué significa</dt><dd>{meaning}</dd><dt>Por qué importa</dt><dd>{why}</dd></dl></article>)}</div><LegacyReadingGuide title="Cómo interpretar la importancia de un hallazgo" how="La pregunta central no es solo si una métrica está alta o baja, sino si es relevante por frecuencia." reveals="Una brecha pequeña observada cientos de veces tiene mucho más valor analítico que una brecha extrema observada solo una vez." /></LegacyReportShell>;
}
