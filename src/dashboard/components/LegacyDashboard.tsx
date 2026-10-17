import Link from "next/link";
import type { LegacyDashboardModel } from "../contracts/legacy-dashboard-contract";
import { LegacyDataToolbar } from "./LegacyDataToolbar";
import { LegacyDashboardHeader } from "./LegacyDashboardHeader";
import { LegacyDashboardSections } from "./LegacyDashboardSections";
import { LegacyGlossarySection } from "./LegacyGlossarySection";
import { LegacyKpiRow } from "./LegacyKpiRow";

export function LegacyDashboard({ model }: { readonly model: LegacyDashboardModel }) {
  return <><LegacyDataToolbar /><h2 className="visually-hidden">Panel de inspecciones</h2><Link className="visually-hidden" href="/api/health">Comprobar API</Link><LegacyDashboardHeader /><LegacyKpiRow kpis={model.kpis} /><LegacyGlossarySection /><LegacyDashboardSections model={model} /></>;
}
