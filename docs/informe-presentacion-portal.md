# Informe de presentación del portal Elecnor Next

**Versión del portal:** producción, commit `0629121`  
**Fecha de preparación:** 11 de noviembre de 2026  
**URL:** <https://elecnor-next.vercel.app>  
**Propósito:** entregar un guion claro para presentar el portal, interpretar cada pantalla y explicar sus métricas sin mezclar unidades de análisis.

## 1. Mensaje ejecutivo para abrir la presentación

Elecnor Next consolida las inspecciones preventivas provenientes de documentos importados y las transforma en cuatro niveles de lectura:

1. **Lectura ejecutiva:** estado global, brechas principales, regiones y contextos de trabajo.
2. **Lectura operativa:** listado filtrable de inspecciones y detalle de cada auditoría.
3. **Lectura analítica:** métricas, cumplimiento por sección, distribución de puntajes y prioridades.
4. **Lectura de trazabilidad y gestión:** documentos fuente, hallazgos, acciones, procedimientos, cobertura de trabajadores e historial de importación.

La frase recomendada es:

> “El portal no sólo muestra un porcentaje final: permite pasar desde el resultado consolidado hasta el registro, el documento y el control específico que explican ese resultado.”

## 2. Regla fundamental de interpretación

Antes de presentar cifras, hay que indicar la unidad de cada una:

| Término | Qué cuenta | Uso correcto |
|---|---|---|
| **PDF recibidos/importados** | Registros de importación documental, incluyendo reimportaciones o duplicados que luego pueden consolidarse. | Medir volumen de entrada documental; no equivale a inspecciones únicas. |
| **Inspecciones únicas** | Auditorías consolidadas que forman la base oficial del reporting. | Denominador principal del análisis de auditorías. El corte visible informado es **939**. |
| **Registros de contexto** | Inspecciones clasificadas como `ALTURA` o `PISO`. Cada inspección cuenta una vez. | La tarjeta actual dice “Registros en trabajo en altura/piso”. **925** significa 925 registros ALTURA, no 925 personas. |
| **Personas evaluadas** | Técnicos únicos normalizados por nombre, dentro de inspecciones con puntaje válido. | Medir personas, no registros. El valor histórico visible para ALTURA era 313. |
| **Puntajes válidos** | Inspecciones cuyo porcentaje no es nulo. | Base de promedios, distribución y percentiles. |
| **Métrica aplicable** | Ocurrencia en que un control podía ser evaluado. | Denominador de cumplimiento de un control. |
| **Hallazgo/no conforme** | Resultado de control marcado como `NO_CONFORME`. | Medir incumplimientos registrados, no necesariamente personas distintas. |

### Diferencia que debe explicarse si aparece en una reunión

No se deben comparar directamente “925 registros ALTURA” con “313 personas ALTURA”. El primero cuenta inspecciones; el segundo deduplica técnicos. Un mismo técnico puede tener muchas inspecciones y, por tanto, contribuir con varios registros pero con una sola persona.

La tarjeta corregida muestra:

- **Registros en trabajo en altura:** 925 según el corte comunicado.
- **Registros en trabajo en piso:** 13 según el corte comunicado.
- El enlace de cada tarjeta abre `/inspecciones?work_context=ALTURA` o `/inspecciones?work_context=PISO`.
- El filtro de contexto se aplica incluso si el servicio upstream no lo filtra, y considera todas las páginas disponibles.
- Si existe clasificación visual, ésta tiene prioridad sobre la clasificación textual.

## 3. Navegación principal

La barra lateral presenta estas entradas:

- **Inicio:** dashboard ejecutivo.
- **Conclusión proyecto:** informe cualitativo y plan de gestión.
- **Ver inspecciones:** base operativa de auditorías.
- **Ver procedimientos:** catálogo preventivo.
- **Ver métricas:** análisis cuantitativo.
- **Comparativa Elecnor:** cruce de nómina contra inspecciones.

Las rutas de soporte (`/hallazgos`, `/metricas-sin-clasificar`, `/logs` e `/importar`) son accesibles por URL y forman parte de la operación, aunque no todas estén en la navegación principal.

## 4. Página Inicio — `/` — Dashboard Ejecutivo

### 4.1 Cabecera

La cabecera identifica “ELECNOR / PREVENCIÓN DE RIESGOS”, muestra el título **Dashboard Ejecutivo**, la fecha de actualización y el resultado consolidado de auditorías analizadas.

El número grande de la cabecera es **Inspecciones únicas**; no es cantidad de PDFs ni cantidad de personas.

### 4.2 Foco de análisis y filtros

Los filtros son locales y permiten mantener el contexto global mientras se examina:

- **Región:** todas o una región específica.
- **Desempeño:** todos los resultados, bajo el umbral vigente, o en/sobre el umbral.
- **Restablecer:** elimina el foco aplicado.

Al elegir una región aparece una banda con auditorías e incumplimientos registrados y un enlace para abrir las inspecciones de esa región.

### 4.3 Tarjetas ejecutivas

1. **Inspecciones únicas** — base consolidada de auditorías.
2. **Cumplimiento global** — promedio de porcentajes válidos. En el corte presentado: **77,56%**, clasificado como **Nivel 2 · Deficiente**.
3. **Registros en trabajo en altura** — conteo de inspecciones clasificadas `ALTURA`; en el corte presentado: **925**.
4. **Registros en trabajo en piso** — conteo de inspecciones clasificadas `PISO`; en el corte presentado: **13**.
5. **Mayor brecha** — sección o dimensión con menor cumplimiento comparable. En el corte presentado: **37,7%**, asociada a **Preparación de la Jornada**, Nivel 2 · Deficiente.
6. **Regiones** — cantidad de regiones derivadas del reporting. En el corte presentado: **10**.

Cada tarjeta enlaza al origen o a la vista que permite comprobarla.

### 4.4 Dimensiones y secciones preventivas

Muestra una barra por sección, su cumplimiento, cantidad de aplicables e incumplimientos y el nivel de exigencia. Se debe leer como un ranking de dónde revisar primero, no como un promedio simple de tarjetas.

La clasificación visual usada por el portal es:

- **Nivel 5 · Buen estado:** superior a 95%.
- **Nivel 4 · Aceptable:** 90% a 95% inclusive.
- **Nivel 3 · Mejorable:** 80% a menos de 90%.
- **Nivel 2 · Deficiente:** menor de 80%.
- Sin puntaje: no hay base válida.

### 4.5 Distribución de puntajes

Incluye una dona y una curva de distribución. Las bandas son `0–49`, `50–59`, `60–69`, `70–79`, `80–89`, `90–99` y `100`. Sólo se incluyen inspecciones con puntaje válido.

La lectura correcta es: “¿Cómo se reparte la base válida?”, no “¿qué porcentaje de personas está en cada banda?”.

### 4.6 Regiones que requieren atención

Cada región muestra auditorías, incumplimientos registrados, cumplimiento y nivel. La lista prioriza primero regiones con más no conformidades, luego más auditorías y finalmente orden alfabético.

La región se resuelve usando región declarada y, cuando falta, ciudad, dirección o nombre de archivo. Los datos no localizables quedan como región desconocida/no clasificada.

### 4.7 Prioridades que requieren intervención

Presenta las métricas de menor cumplimiento, con sección, incumplimientos, registros aplicables y enlace al detalle. Sirve para pasar de “hay una brecha” a “este control concreto explica la brecha”.

### 4.8 Base evaluada y colorimetría

Esta zona separa:

- puntajes válidos;
- personas únicas con al menos un resultado bajo 90%;
- distribución de la base por bandas de cumplimiento.

La tarjeta de personas sí deduplica técnicos. Por eso no debe confundirse con las tarjetas nuevas de registros ALTURA/PISO.

### 4.9 Tres pilares preventivos

Es una lectura cualitativa y no una métrica estadística adicional:

1. Conocimiento técnico insuficiente.
2. Cultura preventiva débil.
3. Producción por encima de la seguridad.

Estos pilares orientan la conversación gerencial y se desarrollan en `/informe`. No deben presentarse como porcentajes ni como atribución individual sin evidencia específica.

## 5. Página `/dashboard` — vista detallada/compatible

Esta ruta conserva la vista detallada anterior del portal y es útil cuando la audiencia necesita recorrer el informe completo.

### Secciones de la vista

1. **Cabecera “Métricas de Inspección Proyecto Elecnor”:** explica que el informe visual se construye a partir de PDFs importados.
2. **Indicadores principales:** promedio global, casos bajo 70% e inspecciones realizadas.
3. **Qué estamos analizando:** glosario de inspección, cumplimiento, no conformes y sección.
4. **Dónde revisar el cumplimiento:** acordeón de secciones ordenadas por menor cumplimiento; cada sección se abre para mostrar subconjuntos, aplicables y detalle.
5. **Métricas más débiles:** controles ordenados por menor cumplimiento, con conformes/aplicables y nivel.
6. **Inspecciones aprobadas por sección:** aprobación por checklist; una inspección cuenta una vez por sección.
7. **Contraste dentro del bloque EPP:** compara uso directo del EPP con el checklist de control.
8. **Métricas más fuertes:** resultados altos que conviene sostener.
9. **Qué nos muestran los datos:** sección más débil, métrica más débil y resultado que puede sostenerse.

Esta pantalla es especialmente adecuada para una presentación técnica porque permite abrir cada sección y llegar al detalle sin abandonar el informe.

## 6. Página `/inspecciones` — listado operativo

### Resumen superior

- **Registros encontrados:** total que coincide con la consulta actual.
- **En esta página:** filas visibles, máximo 25 por página.
- **Cumplimiento medio:** promedio de los registros visibles con puntaje.
- **Requieren atención:** registros parciales o con puntaje menor a 70%, sobre el total de la consulta.

### Filtros

Permite buscar por técnico, auditor o documento; fecha exacta; rango desde/hasta; auditor; región; estado completa/parcial; contexto (`PISO`, `ALTURA`, `PREPARACION`, `SIN_CLASIFICAR`); puntaje y orden.

Los filtros de puntaje incluyen bandas, `below70`, `70to89`, perfecto y sin puntaje. Las columnas ordenables son técnico, fecha, auditor, contexto, puntaje y estado.

### Tabla

Cada fila muestra técnico y ubicación, fecha/hora, auditor, contexto, puntaje, estado y acción. El puntaje incluye barra, nivel y puntos cuando existe la escala original. El estado distingue registro completo, parcial, sin puntaje y revisión por bajo cumplimiento.

Cuando se filtra `PISO`, la pantalla muestra la observación preventiva de que el trabajador fue localizado finalizando su labor y que la evaluación se concentró en nivel de piso y EPP. Esto es contexto interpretativo, no un nuevo cálculo.

### Cómo presentar el número 925

Seleccionar **Contexto → Trabajo en altura** y leer “Registros encontrados”. Ese total representa inspecciones indexadas para la consulta, no trabajadores únicos. Si se presenta una cifra general de 939, debe decirse “inspecciones únicas consolidadas”.

## 7. Página `/inspecciones/[id]` — detalle de una inspección

Es la pantalla de verificación de evidencia. Incluye:

- técnico, fecha, hora e identificador;
- botón de edición, descarga del PDF y retorno al listado;
- cumplimiento, contexto y fuente de clasificación;
- auditor, estado y acciones registradas;
- observación general de terreno;
- evidencia visual: página, imagen, confianza y justificación;
- tabla de métricas agrupadas por sección, con conformes, no conformes y observaciones;
- origen documental: archivo, SHA-256, origen, fecha/hora y recepción.

Al presentar una brecha, ésta es la pantalla que permite demostrar de dónde sale: inspección, control, observación y documento fuente.

## 8. Página `/tecnicos/[nombre]` — perfil de técnico

Se abre desde el nombre de un técnico en el listado o desde un detalle de métrica. Muestra:

- promedio de sus inspecciones con puntaje;
- cantidad de inspecciones bajo 70% sobre las inspecciones con puntaje;
- número de auditores;
- número de fechas;
- tabla de fecha, auditor, puntaje, acciones y enlace al detalle.

La frase “Bajo 70%” aquí es por inspecciones de ese técnico, no por personas y no por métricas aplicables.

## 9. Página `/metricas` — análisis cuantitativo

### Indicadores clave

- Inspecciones analizadas.
- Cumplimiento global.
- Personas bajo 90% — técnicos únicos con algún resultado bajo 90%.
- Acciones — suma de acciones registradas.

### Narrativa preventiva

Explica la ruta “Detectamos, Evaluamos, Actuamos, Medimos y Mejoramos”. Es una guía de gestión; las cifras insertadas en ella se extraen del reporting.

### Visualizaciones

- **Cumplimiento global:** dona de cumplimiento contra brecha (`100 - cumplimiento`).
- **Inspecciones deficientes:** inspecciones bajo 80% contra las de 80% o más, siempre sobre puntajes válidos.
- **Cumplimiento por sección:** barras enlazadas al primer detalle de métrica de cada sección.
- **Métricas que requieren acción:** hasta seis controles con menor cumplimiento.
- **Localización/repetición:** advierte cuando un técnico tiene varias inspecciones el mismo día a horas distintas; cada registro queda enlazado.

No se debe interpretar la dona como una proporción de trabajadores. Es una proporción de puntajes/inspecciones válidas.

## 10. Página `/metricas/[slug]` — detalle de una métrica

Muestra el código y sección del control, observaciones, técnicos con datos y registros con observación. Sus tarjetas son:

- **Aplicables:** denominador del control.
- **Conformes:** respuestas conformes.
- **No conformes:** respuestas no conformes registradas.
- **Cumplimiento:** `conformes / aplicables × 100`.
- **Incumplimiento:** normalmente `100 - cumplimiento`.

Luego presenta el desglose por técnico, con vistas/aplicables, conformes, no conformes, nivel y enlace a las inspecciones. Finalmente lista registros con observación.

### Caso especial `/metricas/epp-observado`

Agrupa las métricas observadas en terreno sobre casco, calzado, guantes, vestuario y lentes. Permite abrir el desglose de cada control y sirve para comparar uso directo del EPP con el checklist `PREP_EPP_CHECK`.

## 11. Página `/hallazgos`

Es la bandeja de no conformidades y su trazabilidad. La tabla incluye inspección de origen, fecha, sección, métrica, observación y estado de acción. Cada inspección es navegable.

Debe usarse para responder: “¿Qué hallazgo concreto está detrás de la brecha y qué acción tiene asociada?”.

## 12. Página `/metricas-sin-clasificar`

Conserva elementos que no pudieron normalizarse automáticamente. Muestra ID, inspección, nombre original de la métrica, nombre normalizado, archivo y estado.

No es un indicador de desempeño. Es una bandeja de calidad de datos para evitar perder el texto original y permitir que el catálogo se complete con trazabilidad.

## 13. Página `/logs`

Es el registro de importación. Presenta fecha/hora, tipo de evento, archivo, inspección asociada, resultado, mensaje y duración en milisegundos.

Se utiliza para explicar errores, advertencias, tiempos de proceso, reintentos y confirmar si un documento llegó correctamente al read model.

## 14. Página `/importar`

Permite seleccionar o arrastrar PDFs. La operación se envía al BFF y el backend aplica validación, idempotencia y estados parciales. El límite indicado en la interfaz es **20 archivos por operación** y **15 MB por archivo**.

En el entorno sintético el alta puede mostrarse no disponible. En producción se debe explicar que la carga pasa por el backend y no expone credenciales ni acceso directo del navegador a PostgreSQL.

## 15. Página `/procedimientos`

Catálogo preventivo servido por el read model del backend.

- búsqueda por título, código o descripción;
- filtro por área;
- total de procedimientos y familias;
- acordeón por familia de trabajo;
- cantidad de variantes y disponibilidad de video;
- ficha de cada procedimiento;
- formulario de alta con título, código, área, descripción, video de YouTube y nombre de PDF.

Su función es conectar el hallazgo con la referencia operativa que debería orientar la ejecución segura.

### `/procedimientos/[id]`

Es la ficha individual del procedimiento, con descripción, recursos audiovisuales/documentales y acciones para volver al catálogo. Debe usarse después de identificar un control débil para mostrar qué procedimiento corresponde revisar.

## 16. Página `/comparativa-elecnor`

Contrasta la nómina entregada por Elecnor con los nombres identificados en inspecciones.

### KPIs de cobertura

- **Trabajadores:** total de la nómina comparada.
- **Cobertura encontrada:** trabajadores con inspección; porcentaje `con inspección / total nómina × 100`.
- **Pendientes de inspección:** trabajadores sin registro asociado.
- **Revisados:** coincidencias marcadas manualmente; se informa también cuántas quedan pendientes de validar.

### Tabla y estados

Incluye trabajador, RUT, nombre detectado, cantidad de inspecciones, fechas, resultado y control de revisión. Los estados son coincidencia confirmada, revisar variante y pendiente de inspección. Se puede buscar por nombre/RUT, filtrar por estado, ordenar y revisar manualmente una fila.

Esta página mide cobertura nominal; no reemplaza el análisis de cumplimiento preventivo.

## 17. Página `/informe` y alias `/informes` — conclusión del proyecto

Es un informe cualitativo para dirección. Sus secciones son:

1. **Resumen:** lectura ejecutiva de conocimiento técnico, cultura preventiva y presión productiva.
2. **Tres pilares:** hallazgo, riesgo operativo y respuesta de gestión para cada pilar.
3. **Seguimiento:** indicadores recomendados y señales de alerta.
4. **Plan de 90 días:** prioridades y resultados esperados por horizonte.
5. **Conclusión:** relaciona las brechas cuantitativas con la preparación de la jornada, EPP, escaleras, equipos, herramientas, vehículo, protector solar y AST.

La página declara expresamente que las entrevistas y conversaciones aportan diagnóstico cualitativo; no deben convertirse en tasas o porcentajes de trabajadores sin una base codificada y validada.

## 18. Página `/login`

Punto de acceso protegido. Solicita correo y clave, comunica sesión protegida y cierre automático por inactividad. Para una demostración, se debe iniciar sesión antes de mostrar rutas protegidas y no exponer credenciales en capturas o presentaciones.

## 19. Fórmulas y denominadores

### KPIs de reporting

```text
PDF recibidos              = cantidad de registros en importLogs
Inspecciones únicas        = cantidad de facts.inspections
Puntajes válidos           = inspecciones donde percentage != null
Personas evaluadas         = técnicos únicos dentro de puntajes válidos
Personas bajo 90%          = técnicos únicos con percentage < 0,90
Promedio global            = suma(percentage válido) / puntajes válidos × 100
Bajo 70%                   = cantidad de puntajes válidos < 0,70
Puntaje perfecto           = cantidad de puntajes válidos = 1,00
Hallazgos                  = métricas cuyo estado es NO_CONFORME
Acciones                   = suma(actions) de las inspecciones
```

### Métricas y secciones

```text
Cumplimiento de métrica   = conformes / aplicables × 100
Incumplimiento            = 100 - cumplimiento, salvo porcentaje explícito de la fuente
Cumplimiento de sección   = suma(conformes) / suma(aplicables) × 100
```

No se promedian porcentajes de métricas para obtener una sección: se agregan primero conformes y aplicables. Esto evita que un control con pocas observaciones pese igual que otro con muchas.

### Aprobación por sección

Para cada inspección y sección se suman aplicables y conformes. Una inspección aprueba la sección si alcanza al menos **70%**. La aprobación de la sección es:

```text
inspecciones aprobadas / inspecciones evaluadas × 100
```

Las inspecciones que no incluyen esa sección se informan como “sin evaluación” y no entran en el denominador de aprobación.

### Estadística descriptiva

Media, mediana, P25 y P75 se calculan sobre porcentajes válidos. Las bandas de puntaje también excluyen valores nulos. Son estadísticas descriptivas de auditorías, no inferencias sobre toda la población laboral.

## 20. Fuentes de datos y trazabilidad técnica

La interfaz no calcula contra datos inventados en producción. El flujo normal es:

1. El backend expone facts de reporting, detalles, inspecciones, métricas, importaciones y procedimientos.
2. El BFF de Next consulta el backend con el scope configurado.
3. La composición de reporting arma overview, detalles, analytics y resumen ejecutivo.
4. El frontend presenta el modelo y enlaza cada resultado con su origen.

Las fuentes principales son:

- facts de reporting para KPIs y distribución;
- listado indexado de inspecciones para filtros, contextos y paginación;
- métricas de inspección para conformes/no conformes;
- import logs para PDFs, eventos y tiempos;
- documentos/provenance para archivo, SHA-256 y origen;
- catálogo de procedimientos para guías operativas;
- nómina Elecnor e inspecciones para la comparativa.

En los detalles documentales, el SHA-256 y el identificador de documento son los elementos preferentes de trazabilidad.

## 21. Guion recomendado de presentación

### Apertura — 1 minuto

1. Mostrar Inicio.
2. Decir el período/corte y que la base es de 939 inspecciones únicas.
3. Aclarar inmediatamente que 925 ALTURA son registros de inspección y no personas.

### Diagnóstico — 3 minutos

1. Leer cumplimiento global 77,56% y su nivel.
2. Mostrar mayor brecha 37,7% en Preparación de la Jornada.
3. Abrir Dimensiones y ordenar la conversación desde la sección más débil.
4. Mostrar Regiones que requieren atención y seleccionar una región.

### Evidencia — 3 minutos

1. Abrir Prioridades que requieren intervención.
2. Entrar al detalle de la métrica más débil.
3. Mostrar aplicables, conformes, no conformes y técnicos.
4. Abrir una inspección y mostrar observación, contexto, métricas y documento fuente.

### Cobertura operativa — 2 minutos

1. Abrir Inspecciones.
2. Aplicar Contexto → ALTURA y mostrar los registros encontrados.
3. Aplicar estado/puntaje para priorizar revisión.
4. Si corresponde, mostrar Comparativa Elecnor para separar cobertura nominal de cumplimiento.

### Cierre — 2 minutos

1. Mostrar `/metricas` para explicar distribución y acciones.
2. Mostrar `/hallazgos` y `/procedimientos` como ciclo de cierre.
3. Abrir `/informe` y presentar los tres pilares y el plan de 90 días.

## 22. Frases que conviene usar y evitar

| Usar | Evitar |
|---|---|
| “925 registros de inspección clasificados en ALTURA”. | “925 personas en altura”. |
| “939 inspecciones únicas consolidadas”. | “939 PDFs”, salvo que se hable específicamente de importaciones. |
| “77,56% de cumplimiento promedio sobre puntajes válidos”. | “77,56% de los trabajadores cumple”. |
| “37,7% es la sección/dimensión con menor cumplimiento observado”. | “La empresa tiene 37,7% de seguridad”. |
| “Hallazgos registrados en la base auditada”. | “Número de incidentes”, porque el portal no presenta una tasa de incidentes. |
| “Diagnóstico cualitativo que requiere validación por actividad/equipo”. | “Todos los trabajadores presentan esa conducta”. |

## 23. Controles previos a una presentación

- Confirmar sesión y permisos.
- Recargar el navegador para activar el Service Worker `v11`.
- Confirmar que el corte y la fecha de actualización sean los esperados.
- Revisar que no haya filtros activos al leer KPIs globales.
- Verificar que “Registros encontrados” se interprete según la consulta actual.
- No sumar PDFs, inspecciones, registros de contexto y personas como si fueran la misma unidad.
- Ante una brecha, abrir el detalle y comprobar aplicables, conformes, observación y documento.
- Si una cifra no tiene puntaje válido o denominador, presentarla como “sin dato” y no completar manualmente.

## 24. Validación de la versión documentada

La versión que acompaña este informe fue validada en Arch con:

- `npm run typecheck` — aprobado.
- `npm run lint` — aprobado.
- pruebas focalizadas — **15/15**.
- suite E2E completa — **24/24**.
- build de producción Vercel — aprobado.
- producción responde y redirige correctamente a login.
- `https://elecnor-next.vercel.app/sw.js` sirve `elecnor-sections-v11`.
