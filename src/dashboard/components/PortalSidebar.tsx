import Image from "next/image";
import Link from "next/link";
import { BarChart3, ClipboardCheck, FileText, GitCompareArrows, Home, ListChecks } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PortalSidebarProps } from "../contracts/portal-layout-contract";

const navigation: readonly { readonly icon: LucideIcon; readonly label: string; readonly href: string }[] = [
  { icon: Home, label: "Inicio", href: "/" },
  { icon: FileText, label: "Conclusión proyecto", href: "/informe" },
  { icon: ClipboardCheck, label: "Ver inspecciones", href: "/inspecciones" },
  { icon: ListChecks, label: "Ver procedimientos", href: "/procedimientos" },
  { icon: BarChart3, label: "Ver métricas", href: "/metricas" },
  { icon: GitCompareArrows, label: "Comparativa Elecnor", href: "/comparativa-elecnor" },
];

export function PortalSidebar({ homeHref = "/", activeRoute, mode = "executive" }: PortalSidebarProps) {
  return <aside className={`executive-sidebar${mode === "legacy" ? " is-legacy" : ""}`}>
    <Link className="executive-sidebar-brand" href={homeHref} aria-label="Elecnor · Inicio"><Image src="/elecnor-logo-white.png" alt="Elecnor" width={150} height={78} priority /></Link>
    <nav aria-label="Navegación principal" className="executive-sidebar-nav">{navigation.map(({ icon: Icon, label, href }, index) => <Link key={href} href={href === "/" ? homeHref : href} className={isActive(href, activeRoute) || (!activeRoute && index === 0) ? "is-active" : undefined} aria-current={isActive(href, activeRoute) ? "page" : undefined} aria-label={href === "/metricas" ? "Métricas" : undefined}><span className="executive-sidebar-icon" aria-hidden="true"><Icon size={18} strokeWidth={2} /></span>{label}</Link>)}</nav>
    <p className="executive-sidebar-version">Portal de Prevención<br /><strong>v1.0</strong></p>
  </aside>;
}

function isActive(href: string, activeRoute?: PortalSidebarProps["activeRoute"]): boolean {
  const active: Record<NonNullable<PortalSidebarProps["activeRoute"]>, string> = { dashboard: "/", metrics: "/metricas", inspections: "/inspecciones", procedures: "/procedimientos", import: "/importar", findings: "/hallazgos", unknowns: "/metricas-sin-clasificar", logs: "/logs", elecnor: "/comparativa-elecnor", report: "/informe" };
  return activeRoute ? active[activeRoute] === href : false;
}
