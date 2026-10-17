import Link from "next/link";
import Image from "next/image";

const services = [["Capacitaciones", "/procedimientos"], ["Asesoría preventiva", "/metricas"], ["Inspección y seguimiento", "/inspecciones"], ["Procedimientos de trabajo seguro", "/procedimientos"]] as const;
const navigation = [["Inicio", "/"], ["Inspecciones", "/inspecciones"], ["Procedimientos", "/procedimientos"], ["Métricas", "/metricas"]] as const;
const channels = [["Sitio web", "https://hc-soluciones.cl"], ["Aula virtual", "https://hc-aulavirtual.cl"], ["Instagram", "https://www.instagram.com/hcsolucioneschile/"], ["Facebook", "https://www.facebook.com/hcsolucioneschile"]] as const;

export function LegacySiteFooter() {
  return <footer className="legacy-site-footer"><div className="legacy-footer-stripe" aria-hidden="true" /><div className="legacy-footer-inner"><div className="legacy-footer-grid">
    <section aria-labelledby="footer-company-title"><Image src="/hc-logo-dark.png" alt="HC Soluciones" width={150} height={150} className="legacy-hc-logo" /><h2 id="footer-company-title">Prevención de riesgos y capacitaciones</h2><p>Empresa líder en prevención de riesgos y capacitaciones a la medida. OTEC certificada con código SENCE, orientada a fortalecer la seguridad y salud en el trabajo.</p></section>
    <FooterLinks title="Servicios" links={services} />
    <FooterLinks title="Navegación" links={navigation} />
    <section aria-labelledby="footer-contact-title"><h2 id="footer-contact-title">Contacto</h2><address><p>Av. Maipú 068, Maipú<br />Región Metropolitana, Chile</p><p><a href="mailto:contacto@hc-soluciones.cl">contacto@hc-soluciones.cl</a></p><p><a href="tel:+56965503495">+56 9 6550 3495</a></p><p><a href="tel:+56933557353">Aula virtual: +56 9 3355 7353</a></p></address><ul>{channels.map(([label, href]) => <li key={label}><a href={href} target="_blank" rel="noreferrer">{label}</a></li>)}</ul></section>
  </div><div className="legacy-footer-meta"><span>© 2026 HC Soluciones</span><span>Prevención de riesgos · Seguridad y salud en el trabajo</span></div></div></footer>;
}

function FooterLinks({ title, links }: { readonly title: string; readonly links: readonly (readonly [string, string])[] }) {
  return <section aria-labelledby={`footer-${title.toLowerCase()}-title`}><h2 id={`footer-${title.toLowerCase()}-title`}>{title}</h2><ul>{links.map(([label, href]) => <li key={label}><Link href={href} aria-label={label === "Métricas" ? "Indicadores en el pie de página" : undefined}>{label}</Link></li>)}</ul></section>;
}
