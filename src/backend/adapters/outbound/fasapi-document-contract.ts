import type { BackendProvenance } from "../../domain/backend-contract";

export type FasapiPersonRecord = { nombre: string | null; cargo: string | null };

export type FasapiScoreRecord = {
  obtenida: number | null;
  maxima: number | null;
  porcentaje: number | null;
};

export type FasapiQuestionRecord = {
  numero: number | null;
  pregunta: string;
  respuesta: string | null;
  observacion: string | null;
  pagina: number;
};

export type FasapiSectionRecord = {
  nombre: string;
  preguntas: readonly FasapiQuestionRecord[];
};

export type FasapiFindingRecord = {
  seccion: string | null;
  pregunta: string;
  respuesta: string | null;
  observacion: string | null;
  pagina: number;
};

export type FasapiDocumentRecord = {
  auditoria: {
    titulo: string | null;
    estado: string | null;
    auditor: FasapiPersonRecord | null;
    tecnico: FasapiPersonRecord | null;
    fecha: string | null;
    fecha_parcial: string | null;
    hora: string | null;
    zona_horaria: string | null;
    direccion_cliente: string | null;
    puntuacion: FasapiScoreRecord | null;
    elementos_senalados: number | null;
    acciones: number | null;
  };
  secciones: readonly FasapiSectionRecord[];
  resumen_elementos_senalados: readonly FasapiFindingRecord[];
  observaciones_generales: readonly string[];
  advertencias: readonly string[];
  legacyId?: string | null;
  sourceSystem?: string | null;
  filename?: string | null;
  sha256?: string | null;
  importedAt?: string | null;
  rubricVersion?: string | null;
  provenance?: BackendProvenance;
};
