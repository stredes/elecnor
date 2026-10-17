import { ReportLayout } from "@/dashboard/components/ReportLayout";
import type { ProceduresViewProps } from "../contracts/procedure-catalog-contract";
import { ProcedureFamilyAccordion } from "../components/ProcedureFamilyAccordion";
import { ProcedureForm } from "../components/ProcedureForm";

export function ProceduresView({ families, total, filters }: ProceduresViewProps) {
  return <ReportLayout activeRoute="procedures"><header className="dashboard-header"><div><p className="eyebrow">ELECNOR · PROCEDIMIENTOS</p><h1>Procedimientos</h1><p>Documentos sintéticos de procedimientos de trabajo.</p></div></header>
    <form method="get" action="/procedimientos" role="search"><label>Buscar<input name="q" type="search" defaultValue={filters.q} /></label><label>Área<input name="area" defaultValue={filters.area} /></label><button type="submit">Buscar</button></form>
    <p>{total} procedimientos{filters.q || filters.area ? " con el filtro aplicado" : ""}</p><ProcedureFamilyAccordion families={families} /><ProcedureForm /></ReportLayout>;
}
