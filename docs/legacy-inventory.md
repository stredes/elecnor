# Inventario inicial: legacy → Elecnor

Este mapa describe fuentes observadas del workspace. No convierte legacy en una
dependencia ni autoriza migrar datos o comportamiento no especificado.

| Fuente legacy | Parte identificada | Proyección en Elecnor |
| --- | --- | --- |
| `modulo-data-excel/web` | Dashboard Next y páginas históricas | `pages/` + `src/dashboard/` |
| `modulo-data-excel/web/src/app/api` | API/BFF del baseline | `pages/api/` + mappers |
| `modulo-data-excel/app` | Flask, servicios y acceso a datos | `src/backend/` + puerto explícito |
| `Fasapi/src/app` | FastAPI, rutas y adaptadores de backend | Adaptador outbound, no import directo |
| `np0028-web/web` | Slice NP-0028 y contratos Brain | Evidencia y contratos, no copia automática |
| `np0028-fasapi` | Worktree FastAPI de NP-0028 | Fuente de contratos aprobados únicamente |
| `np0028-fasapi/src/app/api/routes/pdf.py` | Upload, extracción por ID y `extract-and-send` | `src/backend/adapters/outbound/http-c-extract-reader.ts`; sin activar sender |
| `np0028-fasapi/src/app/services/{extraction_service,pdf_validator,pdf_extractor}.py` | Composición concreta, límites y recursos PyMuPDF | `src/backend/application/extract-document.ts` + puerto C-EXTRACT; parser Python permanece legacy |
| `np0028-fasapi/src/app/domain/evaluacion.py` | Preguntas, secciones y resumen de hechos | C-EXTRACT candidato; orden y campos ampliados requieren D-05 |

## Regla por NP

La historia de cada NP debe añadir aquí el alcance concreto: archivos legacy
afectados, rutas, contratos, riesgos, tests y decisiones. La implementación se
proyecta después en la capa destino, con tests de caracterización antes del
refactor y sin transportar deuda estructural por conveniencia.

## Estado inicial

Elecnor contiene únicamente un dashboard sintético, un BFF sintético y un
adaptador de backend opcional. No se ha migrado ninguna tabla, PDF, SQLite,
credencial ni fórmula productiva.
