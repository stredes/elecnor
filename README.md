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
src/backend/adapters/   Adaptadores HTTP y memoria
src/backend/composition Composition root e inyección de dependencias
tests/                  Unitarias, contratos, presentación y E2E
```

## Flujo de dependencias

```text
Browser -> pages/dashboard -> application -> port
Browser -> pages/api       -> application -> port
                                      ^
                         memory adapter / backend adapter
```

El adaptador de memoria usa datos sintéticos para desarrollo. El backend real solo
se activa con `BACKEND_API_URL`; no se conectan SQLite ni datos productivos.

## Ejecutar

```bash
npm install
npm run dev
```

Rutas iniciales: `/dashboard`, `/inspecciones`, `/api/health`, `/api/dashboard` y
`/api/inspections`.

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
