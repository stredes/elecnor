import type { MetricDefinition } from "./catalog-contract";

export const closingCatalog: readonly MetricDefinition[] = [
  { code: "EJEC_SEGURIDAD_TERCEROS", name: "No genera condiciones inseguras para terceros", section: "ejecucion del trabajo tecnico", keywords: ["no genera condiciones inseguras para terceros"] },
  { code: "EJEC_COAXIAL", name: "Manipula cable coaxial y conectores con seguridad", section: "ejecucion del trabajo tecnico", keywords: ["manipula cable coaxial"] },
  { code: "EJEC_HERRAMIENTAS", name: "Uso de equipos y herramientas adecuadas", section: "ejecucion del trabajo tecnico", keywords: ["utiliza equipos y herramientas adecuadas"] },
  { code: "EJEC_PTS", name: "Ejecuta instalación según PTS", section: "ejecucion del trabajo tecnico", keywords: ["ejecuta instalacion segun pts"] },
  { code: "CIERRE_COMUNICA", name: "Comunica cierre de trabajo", section: "cierre de trabajo", keywords: ["comunica cierre de trabajo"] },
  { code: "CIERRE_RETIRO", name: "Retira equipos, herramientas y materiales", section: "cierre de trabajo", keywords: ["retira equipos herramientas y materiales"] },
  { code: "CIERRE_SENALIZACION", name: "Retira señalización y área segregada", section: "cierre de trabajo", keywords: ["retira senal", "retira señal"] },
  { code: "CIERRE_LIMPIEZA", name: "Área limpia y libre de residuos", section: "cierre de trabajo", keywords: ["deja area limpia"] },
  { code: "CIERRE_MATERIALES", name: "Retira materiales sobrantes", section: "cierre de trabajo", keywords: ["retira materiales sobrantes"] },
];
