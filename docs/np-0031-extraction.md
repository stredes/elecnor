# NP-0031 — Frontera de extracción documental

## Estado

La rama `NP-0031` nace de `NP-0030`. Este incremento prepara la frontera
reversible en `elecnor-next`; no modifica `Fasapi`, no levanta FastAPI y no
activa extracción, persistencia ni forwarding productivo.

## Inventario legacy revisado

Se revisaron `np0028-fasapi/src/app/api/routes/pdf.py`,
`services/extraction_service.py`, `services/pdf_validator.py`,
`services/pdf_extractor.py`, `domain/evaluacion.py`, `core/config.py`,
`main.py`, los tests de extractor/API y la auditoría NP-0026.

Hallazgos relevantes:

- `pdf.py` recibe upload, limita bytes y expone extracción por ID; `extract-and-send`
  tiene una política distinta y no define el estado de importación web.
- `PdfValidator` y `PdfExtractor` cierran documentos PyMuPDF, pero el límite debe
  llegar por `Settings` inyectado y no por defaults ocultos.
- `ExtractionService` compone concretos; la nueva frontera depende de un puerto.
- `Seccion.orden` existe en dominio, pero el JSON legacy no lo exporta.
- No se copian rutas, PDFs, SQLite, secretos ni lógica de métricas.

## Proyección implementada

- `CExtractReader` es el puerto de salida del caso de extracción.
- `ExtractDocument` valida nombre, vacío y límite antes de delegar; el límite es
  inyectado y el caso no guarda el archivo.
- `HttpCExtractReader` envía un multipart transitorio a `/api/v1/pdf/extract`,
  valida C-EXTRACT v1.0.0 y transforma fallos a errores seguros sin leer cuerpos
  de error.
- `MemoryCExtractReader` permite fixtures sintéticas; `DisabledCExtractReader`
  es el comportamiento por defecto cuando falta `FASTAPI_API_URL`.
- Dominio, aplicación y puerto no importan Next, React, HTTP, SQL ni adaptadores.

## Evidencia ejecutada

Los ciclos `NP-0031/TEST-01`, `TEST-02` y `TEST-03` tienen RED/GREEN/REFACTOR
registrado en `.hc/evidence/NP-0031.json`. Las pruebas usan únicamente el fixture
`validCExtractDocument`; no se declara una prueba contra FastAPI real.

Regresión observada en `NP-0031`: unitarias 50/50, integración 45/45, E2E
existente 4/4, quality/lint/typecheck/build y `hc gates` PASS; audit sin
vulnerabilidades altas. `hc verify` permanece bloqueado por la attestation humana
de `REVIEW-01` y por la ausencia deliberada de E2E/recursos reales de esta HU.

Commits del incremento: `f6f00dd` manifiesto, `7e3d720` frontera HTTP, `3f54817`
límites, `a95e2c4` composición, `1968b2a` corrección de contratos y `8a7bd52`
rebaseline/evidencia.

## Deuda y límites formales

- D-05 sigue siendo contrato candidato; falta aprobación de Arquitectura y del
  responsable documental.
- D-11 sigue pendiente de autorización para PDFs anonimizados, fuentes y baseline.
- `REVIEW-01` permanece como deuda de revisión autorizada por CTO, no como
  attestation humana fabricada.
- La validación real PyMuPDF, los límites del servicio Python y la paridad con
  documentos autorizados quedan pendientes para el repositorio/entorno FastAPI.
