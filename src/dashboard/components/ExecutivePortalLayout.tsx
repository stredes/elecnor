import type { ExecutivePortalLayoutProps } from "../contracts/executive-dashboard-contract";
import { Bell, ChevronDown, CircleHelp, UserCircle } from "lucide-react";
import { PortalSidebar } from "./PortalSidebar";

export function ExecutivePortalLayout({ children }: ExecutivePortalLayoutProps) {
  return <div className="executive-portal-shell">
    <PortalSidebar homeHref="/" activeRoute="dashboard" />
    <div className="executive-portal-workspace">
      <header className="executive-portal-topbar"><strong>Portal de Auditorías de Prevención</strong><div><button type="button" aria-label="Notificaciones"><Bell size={17} strokeWidth={2} /></button><button type="button" aria-label="Ayuda"><CircleHelp size={17} strokeWidth={2} /></button><span className="executive-user-avatar" aria-hidden="true"><UserCircle size={20} strokeWidth={2} /></span><span>Prevención Elecnor</span><ChevronDown aria-hidden="true" size={16} strokeWidth={2} /></div></header>
      <main id="contenido" className="executive-portal-main">{children}</main>
    </div>
  </div>;
}
