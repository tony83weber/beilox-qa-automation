# Preguntas teóricas — criterio propio

Respuestas cortas para el challenge Beilox (QA Automation Senior). No son citas de documentación: son el criterio con el que operaría en el equipo.

## 1. Escalabilidad (suite ~500 tests)

Separaría por **capa y dominio** (UI smoke / UI regresión / API contrato / API negativos), no solo por carpeta. En Playwright usaría **projects** (como ya hacemos con browsers + api), **tags** (`@smoke`, `@nightly`) y en CI **sharding** + matrix por project. Fixtures compartidas y datos tipados en `src/data`; evitaría un “god POM”. Lo caro (multi-browser E2E) quedaría en nightly; el PR corre smoke + API.

## 2. Flakiness

Antes de un `test.skip`: mirar **trace/video/screenshot**, confirmar si falla el **locator**, un **timing** o el **ambiente**. Reproducir en local con retries=0 y headed. Opciones: aserción auto-waiting más precisa, estado de red (evitar depender de ads), aislamiento de datos, subir timeout solo donde hay evidencia, quarantine con issue vinculado — no skip silencioso.

## 3. POM — cambio del botón “Buscar”

**Un archivo:** `src/pages/home.page.ts` (selector `#btnCons` / acción `submitSearch`). Los specs y las assertions no conocen el selector. Esa es la razón de separar selectores/acciones de aserciones.

## 4. AI assistant — uso responsable

Si un test generado “pasa al primer intento”, chequeo: ¿aserta el **comportamiento de negocio** o solo que “algo es visible”? ¿Hay waits fijos? ¿Selectores frágiles? ¿Aísla datos? ¿Es mantenible en POM?

**Caso de no uso:** las **respuestas teóricas** y la decisión de **no forzar un 400** en SWAPI cuando la API no lo expone — eso es criterio de rol, no autocompletado.

## 5. Criterio del rol (no delegable a IA)

Definir **qué vale la pena automatizar**, el **riesgo residual**, y **firmar** que un verde significa calidad aceptable. Ejemplos: priorizar regresiones de checkout vs. copy cosmético; decidir si un flake es bug de producto o de test; comunicar impacto al equipo. La IA escribe código; el senior responde por el riesgo.

## 6. CI/CD — fallo transitorio de red los lunes 15:00

No descartaría la corrida sin evidencia. Haría: **retries acotados** en el job (ya hay retries de Playwright en CI), clasificar error de red vs. aserción, **re-run workflow** automático una vez si el falló es infra, y **alertar** (Slack/email) solo si el reintento también falla o si el patrón se repite N semanas. Artifact del report siempre, para no debatir a ciegas.
