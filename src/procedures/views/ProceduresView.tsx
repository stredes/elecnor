import Link from "next/link";
import { ReportLayout } from "@/dashboard/components/ReportLayout";
import type { ProceduresViewProps } from "../contracts/procedure-catalog-contract";
import { ProcedureFamilyAccordion } from "../components/ProcedureFamilyAccordion";
import { ProcedureForm } from "../components/ProcedureForm";

export function ProceduresView({ families, total, filters }: ProceduresViewProps) {
  return <ReportLayout activeRoute="procedures" homeHref="/"><nav className="legacy-breadcrumb" aria-label="Breadcrumb"><Link href="/">Inicio</Link><span>/</span><span aria-current="page">Procedimientos</span></nav><header className="legacy-route-header"><h1>Procedimientos</h1><p>Documentos y referencias sintéticas de procedimientos de trabajo. Los medios externos permanecen bloqueados por D-10.</p></header><form className="legacy-search-form" method="get" action="/procedimientos" role="search"><label><span>Buscar</span><input name="q" type="search" defaultValue={filters.q} placeholder="Título, código o descripción…" /></label><label><span>Área</span><input name="area" defaultValue={filters.area} placeholder="Todas" /></label><button type="submit">Buscar</button></form><p className="legacy-results-count">{total} procedimientos{filters.q || filters.area ? " con el filtro aplicado" : ""}</p><ProcedureFamilyAccordion families={families} /><ProcedureForm /></ReportLayout>;
}
