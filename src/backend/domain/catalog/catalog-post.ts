import type { MetricDefinition } from "./catalog-contract";

export const postCatalog: readonly MetricDefinition[] = [
  { code: "POST_APOYOS", name: "3 puntos de apoyo en ascenso y descenso", section: "ascenso y descenso al trabajar en postacion", keywords: ["mantiene 3 puntos de apoyo"] },
  { code: "POST_TENSION", name: "Verifica ausencia de tensión", section: "ascenso y descenso al trabajar en postacion", keywords: ["verifica ausencia de tension"] },
  { code: "POST_DISTANCIA", name: "Distancia de seguridad a redes eléctricas", section: "ascenso y descenso al trabajar en postacion", keywords: ["mantiene distancia de seguridad"] },
  { code: "POST_ANCLAJES", name: "Anclajes y cinturón de posicionamiento", section: "ascenso y descenso al trabajar en postacion", keywords: ["instala correctamente anclajes"] },
  { code: "POST_HERRAMIENTAS", name: "Herramientas dieléctricas aseguradas", section: "ascenso y descenso al trabajar en postacion", keywords: ["herramientas dielectricas aseguradas"] },
  { code: "POST_DETECCION", name: "Sistema de detección de caída", section: "ascenso y descenso al trabajar en postacion", keywords: ["sistema de desteccion de caida", "sistema de deteccion de caida"] },
  { code: "SEG_CONOS", name: "Conos y señalética de seguridad", section: "segregacion del area de trabajo", keywords: ["instala conos"] },
  { code: "SEG_ACCESO", name: "Control de acceso a terceros", section: "segregacion del area de trabajo", keywords: ["controla acceso a terceros"] },
  { code: "SEG_LIMPIEZA", name: "Área limpia y ordenada", section: "segregacion del area de trabajo", keywords: ["mantiene area de trabajo limpia"] },
];
