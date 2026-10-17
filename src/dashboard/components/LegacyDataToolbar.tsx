import { useState } from "react";

export function LegacyDataToolbar() {
  const [open, setOpen] = useState(false);
  return <div className="legacy-data-toolbar"><span>Herramientas</span><div className="legacy-toolbar-mobile"><button type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)}>Herramientas⌄</button>{open && <div className="legacy-toolbar-menu" role="menu"><button type="button" role="menuitem" disabled>Importar PDF</button><button type="button" role="menuitem" disabled>Exportar Excel</button></div>}</div><div className="legacy-toolbar-actions"><button type="button" disabled>Importar PDF</button><i aria-hidden="true" /><button type="button" disabled>Exportar Excel</button><small>Arrastra PDFs a la página para importar</small></div></div>;
}
