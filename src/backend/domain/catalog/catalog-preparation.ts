import type { MetricDefinition } from "./catalog-contract";

export const preparationCatalog: readonly MetricDefinition[] = [
  { code: "PREP_AST", name: "AST previo al trabajo", section: "preparacion de la jornada", keywords: ["ast antes de iniciar labores"] },
  { code: "PREP_EPP_CHECK", name: "Check list EPP", section: "preparacion de la jornada", keywords: ["check list epp", "checklist epp"] },
  { code: "PREP_ESCALA_CHECK", name: "Check list escala", section: "preparacion de la jornada", keywords: ["check list escala", "checklist escala"] },
  { code: "PREP_EQUIPOS_CHECK", name: "Check list de equipos y herramientas", section: "preparacion de la jornada", keywords: ["check list de equipos y herramientas", "checklist de equipos y herramientas"] },
  { code: "PREP_VEHICULO_CHECK", name: "Check list del vehículo", section: "preparacion de la jornada", keywords: ["check list del vehiculo", "checklist del vehiculo"] },
  { code: "PREP_SOLAR", name: "Check list protector solar", section: "preparacion de la jornada", keywords: ["check list uso de protector solar", "checklist de protector solar"] },
  { code: "PREP_AGUA", name: "Agua potable 3L (10 a 16 grados)", section: "preparacion de la jornada", keywords: ["cuenta con agua potable"] },
  { code: "PREP_BOTIQUIN", name: "Botiquín operativo y accesible", section: "preparacion de la jornada", keywords: ["dispone de botiquin"] },
  { code: "PREP_CONDICIONES", name: "Condiciones físicas aptas para la tarea", section: "preparacion de la jornada", keywords: ["mantiene condiciones fisicas aptas"] },
];
