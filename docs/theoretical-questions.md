# Preguntas teóricas — criterio propio

Respuestas cortas para el challenge Beilox. No son citas de documentación: son el criterio con el que operaría en el equipo.

## 1. Escalabilidad (suite ~500 tests)

Separaría por **capa y dominio** (UI smoke / UI regresión / API contrato / API negativos), no solo por carpeta. En Playwright usaría **projects** (como ya hacemos con browsers + api), **tags** (`@smoke`, `@regression`) y en CI **sharding** + matrix por project. Fixtures compartidas y datos tipados en `src/data`; evitaría un “god POM”. Lo caro (multi-browser E2E) quedaría en el cron de los lunes; el PR corre smoke + API.

## 2. Flakiness

Antes de un `test.skip`: mirar **trace/video/screenshot**, confirmar si falla el **locator**, un **timing** o el **ambiente**. Reproducir en local con retries=0 y headed. Opciones: aserción auto-waiting más precisa, no depender de ads/promos, aislamiento de datos, subir timeout solo con evidencia, quarantine con issue vinculado — nunca skip silencioso.

## 3. POM — cambio del botón “Buscar”

**Un archivo:** `src/pages/home.page.ts` (selector `#btnCons` / acción `submitSearch`). Los specs y las assertions no conocen el selector. Esa es la razón de separar selectores/acciones de aserciones.

## 4. AI assistant — uso responsable

Si un test generado “pasa al primer intento”, chequeo: ¿aserta el **comportamiento de negocio** o solo que “algo es visible”? ¿Hay waits fijos? ¿Selectores frágiles? ¿Aísla datos? ¿Encaja en el POM?

**Caso de no uso:** no forcé un HTTP **400** en SWAPI cuando la API responde **404** a ids inválidos. Inventar el status “porque el enunciado lo menciona” habría sido deshonesto. Las respuestas teóricas también las firmé yo: son criterio de rol, no autocompletado.

## 5. Criterio del rol (no delegable a IA)

Definir **qué vale la pena automatizar**, el **riesgo residual**, y **firmar** que un verde significa calidad aceptable. Ejemplos: priorizar regresiones de búsqueda/checkout vs. copy cosmético; decidir si un flake es bug de producto o de test; comunicar impacto al equipo. La IA escribe código; quien ocupa el rol responde por el riesgo.

## 6. CI/CD — fallo transitorio de red los lunes 15:00

No descartaría la corrida sin evidencia. Haría: **retries acotados** en Playwright (ya en CI), clasificar error de red vs. aserción, **re-run** del workflow una vez si el fallo es infra, y **alertar** (Slack/email) solo si el reintento también falla o el patrón se repite N semanas. Artifact del report siempre, para no debatir a ciegas.
