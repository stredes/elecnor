import Image from "next/image";

export function LegacyDashboardHeader() {
  return (
    <header className="legacy-dashboard-header">
      <div className="legacy-dashboard-title-row">
        <Image src="/elecnor-logo-white.png" alt="Elecnor" width={170} height={88} priority />
        <h1>Métricas de Inspección Proyecto Elecnor</h1>
      </div>
      <p>Informe visual consolidado a partir de los PDFs importados. Te acompañamos a leer cada gráfica.</p>
    </header>
  );
}
