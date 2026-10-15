# NP-0029 — Gates de calidad verificables

## Comandos fijados

- `npm run quality:lines`: recorre `pages`, `src`, `tests`, `scripts` y los
  archivos de configuración manuales; cuenta LF, CRLF, CR aislado y la última
  línea no terminada.
- `npm run quality:boundaries`: revisa imports de Pages/backend, rutas App
  Router residuales y ciclos resolubles de TypeScript.
- `npm run quality:contracts`: exige tipos públicos en módulos `domain`,
  `ports` o `contracts`, nunca aliases propios en implementaciones.
- `npm run quality:check`: ejecuta los tres scanners sin modificar el árbol.

## Exclusiones explícitas

`docs/` es documentación revisada por humanos; `package-lock.json` es lockfile
de npm; `.next/` y `coverage/` son salidas generadas. Ninguna exclusión aplica a
`pages`, `src`, `tests`, `scripts` ni a los archivos de configuración manuales.

## Alcance de archivos modificados

El contador acepta `--changed --files <lista separada por comas>` para repetir
la misma política sobre el diff de una historia. Un archivo manual sobre 99
líneas falla aunque pertenezca a deuda heredada; una exclusión devuelve su razón
en JSON y no oculta archivos de código.

## Decisiones de mantenimiento

Se conserva el `format:check` ESLint existente y se encadena `quality:check` sin
añadir una dependencia de formatter. Esta historia no compacta código, cambia
contratos de negocio, toca legacy ni activa despliegues.
