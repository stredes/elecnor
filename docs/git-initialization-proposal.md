# Propuesta de inicialización Git

Estado: baseline local autorizado. No se configurará remoto ni se hará push.

## Topología propuesta

```text
main          baseline estable
└── Development   integración autorizada
    ├── NP-XXXX   una rama por historia
    └── NP-YYYY   otra historia independiente
```

## Secuencia bajo autorización explícita

1. Inicializar el repositorio con `main` como rama principal.
2. Registrar el baseline inicial como `UNMANAGED_INITIAL` y crear `Development`.
3. Crear cada rama `NP-XXXX` desde `Development`, nunca desde un legacy sucio.
4. Integrar únicamente después de RED/GREEN/REFACTOR, revisión y gates.
5. Configurar remoto y protección de ramas solo con autorización del CTIO.

`.gitignore` excluye dependencias, secretos, bases locales, builds, cobertura,
reportes Playwright y artefactos generados. Esta ejecución solo crea el
repositorio local, el commit inicial y `Development`, sin remoto ni push.
