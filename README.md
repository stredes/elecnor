# Elecnor

Base nueva y aislada para el sistema Elecnor. No reemplaza ni modifica los
repositorios históricos del workspace.

## Estructura

```text
pages/                  Dashboard y Pages Router
pages/api/              BFF y contratos HTTP públicos
src/dashboard/          Componentes y estilos de presentación
src/backend/domain/     Reglas y contratos de negocio puros
src/backend/application Casos de uso
src/backend/ports/      Interfaces de entrada/salida
src/backend/adapters/   Adaptadores HTTP y memoria de test
src/backend/composition Composition root e inyección de dependencias
tests/                  Unitarias, contratos, presentación y E2E
```

## Flujo de dependencias

```text
Browser -> Pages Router/BFF -> FastAPI -> PostgreSQL
                         ^
                    backend ports
```

Las páginas y `pages/api` son la única frontera del navegador. Los adaptadores HTTP
envían `X-Fasapi-Contract-Version`, aplican timeout y validan respuestas. Los
read-models se esperan en FastAPI; si una ruta todavía no existe, Next devuelve un
bloqueo explícito y no usa fixtures como fallback. La memoria sólo se permite en
test/desarrollo explícito y nunca en `NODE_ENV=production`.

## Ejecutar

```bash
npm install
npm run dev
```

Variables principales: `FASTAPI_API_URL` o `BACKEND_API_URL`,
`FASTAPI_INTERNAL_TOKEN`/`BACKEND_INTERNAL_TOKEN`, `BACKEND_TIMEOUT_MS`,
`FASTAPI_CONTRACT_VERSION` y `BACKEND_API_MODE`. El upload
`POST /api/import` reenvía bytes multipart, SHA-256, `legacy_id` y `provenance`;
la respuesta C-IMPORT exige siete contadores.

Para una ejecución local sintética explícita usa
`BACKEND_USE_SYNTHETIC_DATA=true`; nunca se activa automáticamente en producción.

Los listados y KPI HTTP solicitan siempre `scope=official`; candidatos y estados
parciales se mantienen en sus bandejas explícitas. Los PDFs se descargan únicamente mediante los proxies server-side
`/api/inspections/:id/download`, `/api/documents/:id/download` o `/api/procedures/:id/download`. Next no expone
URLs de Drive, no guarda binarios y rechaza redirects. La sincronización Drive,
estado y candidatos de duplicidad están descritos en
`docs/np-drive-proxy-contract.md`; si FastAPI no publica esas rutas, el BFF
devuelve un bloqueo explícito.

## Verificación

```bash
npm run lint
npm run quality:check
npm run typecheck
npm run test:unit
npm run build
```

`quality:check` ejecuta los scanners deterministas de líneas, límites y contratos.
El máximo es 99 líneas físicas; documentación, locks y salidas generadas solo se
excluyen con una razón explícita. `quality:check` también forma parte de
`format:check` y nunca modifica archivos.

El proyecto usa Pages Router deliberadamente. La migración a App Router queda
fuera de este alcance.
