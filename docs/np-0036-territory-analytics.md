# NP-0036: territorio, perfiles y series

## Caracterización legacy

- `app/domain/geography.py` extrae ciudades con aliases, evita coordenadas y
  resuelve regiones por ciudad, texto y, como último recurso, filename.
- `app/api.py` expone `/analytics/evolucion` y `/analytics/ranking`; el
  dashboard agrega geolocalización y trazabilidad desde los hechos de inspección.
- `web/src/app/tecnicos/[nombre]/page.tsx` filtra por técnico y solicita hasta
  500 filas; `domain/analytics.ts` completa semanas ISO y calcula media móvil4.
- El frontend legacy y sus mappers son evidencia, no destino de cambios en esta HU.

## Contratos y reglas preservadas

- Región ausente permanece `null`; clasificación de dirección no es GPS.
- La serie semanal usa lunes ISO, conserva semanas vacías entre extremos y no
  inventa año para fechas parciales.
- Ranking conserva mínimo, límite, orden por volumen/promedio y score nulo.
- Perfil conserva universo máximo 500; acciones sólo son un contador de hechos,
  no cierre de acciones.
- La media móvil no se implementa como métrica nueva si no existe consumidor
  autorizado; D-04 queda pendiente.

## Dependencias, riesgos y pruebas

- Depende de NP-0034/NP-0035 y de sus hechos sintéticos; D-06 bloquea cambios
  semánticos y `REVIEW-01` sigue siendo revisión humana.
- Riesgos: Unicode/aliases ambiguos, semanas entre años, zona horaria,
  identificadores de técnico y fuga de datos personales en contratos.
- Tests previstos: resolución territorial y fechas, límites 500/501, series,
  perfil, contratos públicos y ausencia de reglas en SSR/cliente.

No se activan persistencia, endpoints, geocodificación, backfill ni datos reales.
Rollback: retirar la composición y conservar la lectura legacy sin mutar históricos.
