import Link from "next/link";
import Image from "next/image";

const links = [
  ["Home", "/"],
  ["Ver inspecciones", "/inspecciones"],
  ["Ver procedimiento", "/procedimientos"],
  ["Ver métricas", "/metricas"],
] as const;

export function LegacySiteHeader({ homeHref = "/", activeRoute }: { readonly homeHref?: string; readonly activeRoute?: "dashboard" | "metrics" | "inspections" | "procedures" }) {
  return (
    <>
      <div className="legacy-brand-stripe" aria-hidden="true"><span /><span /></div>
      <header className="legacy-site-header">
        <div className="legacy-site-header-inner">
          <Link href={homeHref} aria-label="Elecnor · Inicio" className="legacy-logo-link">
            <Image src="/elecnor-logo.png" alt="Elecnor" width={120} height={62} priority />
          </Link>
          <nav aria-label="Navegación principal" className="legacy-site-nav">
            {links.map(([label, href]) => <Link key={href} href={href} aria-current={isActive(href, activeRoute) ? "page" : undefined} aria-label={href === "/metricas" ? "Métricas" : undefined} className="legacy-nav-link">{label}</Link>)}
          </nav>
        </div>
      </header>
    </>
  );
}

function isActive(href: string, activeRoute?: "dashboard" | "metrics" | "inspections" | "procedures"): boolean {
  return activeRoute === "metrics" && href === "/metricas" || activeRoute === "inspections" && href === "/inspecciones" || activeRoute === "procedures" && href === "/procedimientos" || activeRoute === "dashboard" && href === "/";
}
