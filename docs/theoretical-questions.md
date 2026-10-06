# Preguntas teóricas — criterio propio

Respuestas cortas para el challenge Beilox. No son citas de documentación: son el criterio con el que operaría en el equipo.

## 1. Escalabilidad (suite ~500 tests)

Separaría por **capa y dominio** (UI smoke / UI regresión / API contrato / API negativos), no solo por carpeta. En Playwright usaría **projects** (como ya hacemos con browsers + api), **tags** (`@smoke`, `@regression`) y en CI **sharding** + matrix por project. Mantendría `fullyParallel` y **workers diferenciados** (más agresivo en local, acotado en CI) — como ya está en `playwright.config.ts`. Fixtures compartidas y datos tipados en `src/data`; evitaría un “god POM”. Lo caro (multi-browser E2E) quedaría en el cron de los lunes; el PR corre smoke + API.

## 2. Flakiness

Antes de un `test.skip`: mirar **trace/video/screenshot**, confirmar si falla el **locator**, un **timing** o el **ambiente**. Reproducir en local con retries=0 y headed. Opciones: aserción auto-waiting más precisa, no depender de ads/promos, aislamiento de datos, subir timeout solo con evidencia. Si sigue intermitente: **quarantine** con tag `@quarantined` + link al issue — no `skip` silencioso.

## 3. POM — cambio del botón “Buscar”

**Un archivo:** `src/pages/home.page.ts` (locator `searchButton` = `getByRole('button', { name: 'Buscar' })`, usado por la acción `submitSearch`). Los specs y las assertions no conocen el selector. Esa es la razón de separar selectores/acciones de aserciones. Y como el locator es por rol + nombre visible, un cambio de id o de clase ni siquiera obliga a tocar ese archivo.

## 4. AI assistant — uso responsable

Si un test generado “pasa al primer intento”, chequeo: ¿aserta el **comportamiento de negocio** o solo que “algo es visible”? ¿Hay waits fijos? ¿Selectores frágiles? ¿Aísla datos? ¿Encaja en el POM?

**Caso de no uso:** decidir **qué automatizar**. El alcance (4 escenarios UI, no sumar más E2E del mismo buscador, multi-browser solo en el cron) y la prioridad del backlog por ROI los definí yo: la IA puede generar tests, pero no sabe qué riesgo importa ni cuánto mantenimiento conviene pagar sobre un sitio ajeno. Tampoco delegué la revisión final: cada test lo revisé yo.

Estas respuestas las redacté con ayuda del asistente; el contenido y el criterio los revisé y ajusté punto por punto.

## 5. Criterio del rol (no delegable a IA)

Definir **qué vale la pena automatizar**, el **riesgo residual**, y **firmar** que un verde significa calidad aceptable. Ejemplos: priorizar regresiones de búsqueda/checkout vs. copy cosmético; decidir si un flake es bug de producto o de test; comunicar impacto al equipo. La IA escribe código; quien ocupa el rol responde por el riesgo.

## 6. CI/CD — fallo transitorio de red los lunes 15:00

No descartaría la corrida sin evidencia. Haría: **retries acotados** en Playwright (ya en CI), clasificar error de red vs. aserción, **re-run** del workflow una vez si el fallo es infra, y **alertar** (Slack/email) solo si el reintento también falla o el patrón se repite N semanas. Artifact del report siempre, para no debatir a ciegas.
