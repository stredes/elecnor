import type { MetricDefinition } from "./catalog-contract";

export const safetyCatalog: readonly MetricDefinition[] = [
  { code: "ESC_ASCENSO", name: "Ascenso y descenso correcto con 3 puntos de apoyo", section: "instalacion y uso de escala", keywords: ["realiza ascenso y descenso de manera correcta"] },
  { code: "ESC_ESTRUCTURA", name: "Escala en buen estado estructural", section: "instalacion y uso de escala", keywords: ["escala en buen estado estructural"] },
  { code: "ESC_TRASLADO", name: "Traslado de escala correcto", section: "instalacion y uso de escala", keywords: ["traslada escala"] },
  { code: "ESC_ESTABILIZADORES", name: "Estabilizadores en buenas condiciones", section: "instalacion y uso de escala", keywords: ["escala cuenta con estabilizadores"] },
  { code: "ESC_PELDANOS", name: "3 peldaños libres sobre el punto de trabajo", section: "instalacion y uso de escala", keywords: ["mantiene 3 peldanos libres"] },
  { code: "ESC_ESTABILIDAD", name: "Verifica estabilidad antes del ascenso", section: "instalacion y uso de escala", keywords: ["verifica estabilidad"] },
  { code: "ESC_ANGULO", name: "Escala en ángulo correcto y amarres", section: "instalacion y uso de escala", keywords: ["instala escala en angulo"] },
  { code: "EPP_VESTUARIO", name: "Vestuario ignífugo sin deterioro", section: "inspeccion y uso de epp", keywords: ["utiliza vestuario ignifugo"] },
  { code: "EPP_JOYAS", name: "Sin joyas ni elementos conductores", section: "inspeccion y uso de epp", keywords: ["no utiliza joyas"] },
  { code: "EPP_CASCO", name: "Casco HALT con barbiquejo ajustado", section: "inspeccion y uso de epp", keywords: ["casco halt"] },
  { code: "EPP_GUANTES", name: "Guantes dieléctricos en buen estado", section: "inspeccion y uso de epp", keywords: ["utiliza guantes dielectricos"] },
  { code: "EPP_CALZADO", name: "Calzado dieléctrico en buenas condiciones", section: "inspeccion y uso de epp", keywords: ["utiliza calzado de seguridad dielectrico"] },
  { code: "EPP_LENTES", name: "Lentes de seguridad adecuados", section: "inspeccion y uso de epp", keywords: ["utiliza lentes de seguridad"] },
];
