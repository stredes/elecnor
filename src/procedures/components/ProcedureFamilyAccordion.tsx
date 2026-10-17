import Link from "next/link";
import { useState } from "react";
import type { ProcedureFamilyAccordionProps } from "../contracts/procedure-family-accordion-contract";

export function ProcedureFamilyAccordion({ families }: ProcedureFamilyAccordionProps) {
  const [open, setOpen] = useState<string | null>(null);
  if (!families.length) return <p>No hay procedimientos para mostrar.</p>;
  return <section aria-label="Familias de procedimientos"><h2>Procedimientos por tipo de trabajo</h2><ul>{families.map((family) => {
    const key = `${family.code}|${family.title}`;
    const expanded = key === open;
    return <li key={key}><button type="button" aria-expanded={expanded} onClick={() => setOpen(expanded ? null : key)}>{family.title}<span> {family.total === 1 ? "1 variante" : `${family.total} variantes`}</span><span> {family.conVideo ? `${family.conVideo} de ${family.total} con video` : "sin video"}</span></button>
      {expanded && <div role="region" aria-label={family.title}><ul>{family.procedures.map((procedure) => <li key={procedure.id}><span>{procedure.area ?? "Sin área"}</span>{procedure.description && <p>{procedure.description}</p>}<Link href={`/procedimientos/${encodeURIComponent(procedure.id)}`}>Ver ficha →</Link></li>)}</ul></div>}
    </li>;
  })}</ul></section>;
}
