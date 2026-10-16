import type { MetricDefinition } from "./catalog-contract";

export const fallsCatalog: readonly MetricDefinition[] = [
  { code: "CAIDAS_ARNES", name: "Arnés dieléctrico certificado sin daño", section: "inspeccion de equipos y sistemas de caidas", keywords: ["arne dielectrico certificado"] },
  { code: "CAIDAS_CINTURON", name: "Cinturón de posicionamiento dieléctrico", section: "inspeccion de equipos y sistemas de caidas", keywords: ["cinturon de posicionamiento dielectrico"] },
  { code: "CAIDAS_ARNES_AJUSTE", name: "Arnés correctamente ajustado", section: "inspeccion de equipos y sistemas de caidas", keywords: ["arne correctamente ajustado"] },
  { code: "CAIDAS_ABSORBEDOR", name: "Absorbedor de impacto dieléctrico", section: "inspeccion de equipos y sistemas de caidas", keywords: ["absorbedor de impacto dielectrico"] },
  { code: "CAIDAS_ESTROBO", name: "Estrobo, carro y mosquetón sin daño", section: "inspeccion de equipos y sistemas de caidas", keywords: ["estrobo carro"] },
  { code: "LUGAR_ESTRUCTURA", name: "Estado estructural de la postación", section: "evaluacion del lugar de trabajo", keywords: ["estado estructural de la postacion"] },
  { code: "LUGAR_TERRENO", name: "Estabilidad y condiciones del terreno", section: "evaluacion del lugar de trabajo", keywords: ["estabilidad y condiciones del terreno"] },
  { code: "LUGAR_REDES", name: "Proximidad de redes eléctricas energizadas", section: "evaluacion del lugar de trabajo", keywords: ["proximidad de redes electricas"] },
  { code: "LUGAR_CLIMA", name: "Condiciones climáticas seguras", section: "evaluacion del lugar de trabajo", keywords: ["evalua condiciones climaticas"] },
];
