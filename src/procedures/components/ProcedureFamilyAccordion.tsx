import Link from "next/link";
import { useState } from "react";
import type { ProcedureFamilyAccordionProps } from "../contracts/procedure-family-accordion-contract";

export function ProcedureFamilyAccordion({ families }: ProcedureFamilyAccordionProps) {
  const [open, setOpen] = useState<string | null>(null);
  if (!families.length) return <p className="legacy-empty-card">No hay procedimientos para mostrar.</p>;
  return <section className="legacy-procedure-families" aria-label="Familias de procedimientos"><header className="legacy-procedure-section-heading"><div><span>Catálogo por familia</span><h2>Procedimientos por tipo de trabajo</h2></div><strong>{families.length} familias</strong></header><ul className="legacy-family-list">{families.map((family) => {
     const key = `${family.code}|${family.title}`;
    const panelId = `family-${key.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
    const expanded = key === open;
      return <li className={`legacy-family-item${expanded ? " is-open" : ""}`} key={key}><button className="legacy-family-toggle" type="button" aria-expanded={expanded} aria-controls={panelId} onClick={() => setOpen(expanded ? null : key)}><span className="legacy-family-main"><b>{family.code}</b><strong>{family.title}</strong></span><span className="legacy-family-summary"><strong>{family.total === 1 ? "1 variante" : `${family.total} variantes`}</strong><small>{family.conVideo ? `${family.conVideo} de ${family.total} con video` : "sin video"}</small></span><span className="legacy-family-chevron" aria-hidden="true">{expanded ? "−" : "+"}</span></button>
         {expanded && <div id={panelId} className="legacy-family-detail" role="region" aria-label={`Variantes de ${family.title}`}><p className="legacy-family-detail-lead">Selecciona una variante para revisar el documento y sus recursos.</p><ul>{family.procedures.map((procedure) => <li className="legacy-procedure-card" key={procedure.id}><div className="legacy-procedure-card-meta"><span>{procedure.area ?? "Sin área"}</span><small>{procedure.youtubeVideoId ? "Video disponible" : "PDF disponible"}</small></div><h3>{procedure.title}</h3><p>{procedure.description ?? "Consulta la ficha para ver el detalle del procedimiento."}</p><Link href={`/procedimientos/${encodeURIComponent(procedure.id)}`}>Abrir ficha <span aria-hidden="true">→</span></Link></li>)}</ul></div>}
     </li>;
  })}</ul></section>;
}
