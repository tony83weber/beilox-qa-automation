# Beilox — Challenge QA Automation

Framework de pruebas automatizadas con **Playwright + TypeScript** (strict), cubriendo:

- **UI Web** sobre [centraldepasajes.com.ar](https://www.centraldepasajes.com.ar/) (sitio de referencia productiva)
- **API** sobre [swapi.tech](https://www.swapi.tech/api) (`/people`, `/planets`, `/films`) con validación **AJV**
- **CI** con GitHub Actions (lunes 15:00 ART)
- Documentación de uso de asistente de IA + MCP y respuestas teóricas

> Objetivo del challenge: demostrar arquitectura escalable, buenas prácticas (POM, fixtures, esperas correctas) y criterio — no una suite “perfecta” contra un sitio ajeno.

---

## Requisitos

- Node.js **≥ 20** y npm 10+
- Java **JRE 8+** (solo para generar/abrir Allure)
- En Windows: se recomienda correr todo desde **WSL (Ubuntu)**

---

## Instalación completa (WSL / Linux)

```bash
# 1) Clonar el repo
git clone https://github.com/tony83weber/beilox-qa-automation.git
cd beilox-qa-automation

# 2) Dependencias Node
npm ci

# 3) Browsers de Playwright (Chromium, Firefox, WebKit; mobile usa Chromium)
npx playwright install --with-deps chromium firefox webkit

# 4) Variables de entorno locales
cp -n .env.example .env

# 5) Java para Allure (si no lo tenés)
sudo apt update
sudo apt install -y default-jre
```

Actualizar código cuando haya cambios:

```bash
git pull
npm ci
```

---

## Cómo ejecutar

| Comando | Qué corre |
|---------|-----------|
| `npm run test:smoke` | Solo tests con tag `@smoke` (rápido / PR) |
| `npm run test:regression` | Tests con tag `@regression` |
| `npm run test:smoke:api` | Smoke API |
| `npm run test:smoke:ui` | Smoke UI (Chromium) |
| `npm run test:config` | Valida resolución de ambientes (`TEST_ENV`) |
| `npm run test:config:all-envs` | Corre config contra prod + qa + dev |
| `npm run test:api` | Solo API (project `api`) |
| `npm run test:ui:chromium` | UI en Chromium |
| `npm run test:ui:firefox` | UI en Firefox |
| `npm run test:ui:webkit` | UI en WebKit |
| `npm run test:ui:mobile` | UI emulando **Pixel 5** |
| `npm run test:ui` | UI en los 4 projects |
| `npm test` | Toda la suite (UI×4 + API) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run report` | HTML Playwright (respaldo técnico) |
| `npm run report:allure:generate` | Genera Allure estático en `allure-report/` |
| `npm run report:allure` | Genera Allure e intenta abrirlo |
| `npm run report:allure:serve` | Sirve `allure-results` con Allure |

### Reporte Allure (UI) — pensado para negocio

El reporte UI muestra **pasos en lenguaje de negocio** (ej. “Busca viaje Retiro → Mar del Plata…”), no detalle técnico de Playwright (`Navigate`, `Wait for selector`, before hooks).

En cada verificación importante adjunta **screenshot OK o FAIL**.

```bash
# Correr UI (escribe allure-results/)
rm -rf allure-results
npm run test:ui:chromium

# Generar reporte
npm run report:allure:generate

# Servirlo (útil en WSL: el auto-open del browser suele fallar)
npx --yes serve allure-report -l tcp://0.0.0.0:9324
```

En el **browser de Windows** abrí: `http://localhost:9324`  
Si da connection refused, en WSL corré `hostname -I` y usá `http://<esa-ip>:9324`.

### Evidencia y aserciones API

Además del schema AJV y el status/tiempo, las APIs validan **datos de negocio**:

- entidad esperada en el listado (Luke / Tatooine / A New Hope)
- `uid` únicos en la página
- paginación people/planets: página 1 y 2 **sin ids repetidos**
- detalle `people/1` = Luke Skywalker

Evidencia por corrida (gitignore): `api-evidence/{resource}-{scenario}.json` con:

```json
{ "meta": { "endpoint", "status", "elapsedMs", "environment", "scenario" }, "body": "…enmascarado…" }
```

Esa misma evidencia se **adjunta al test en Allure** (`Evidencia API — people / happy-path-list`), así se abre el body desde el reporte sin ir a la carpeta.

Happy path del challenge (commiteable, fechas enmascaradas):

- `api-responses/people-happy-path.json`
- `api-responses/planets-happy-path.json`
- `api-responses/films-happy-path.json`

Campos volátiles (`timestamp`, `created`, `edited`) se reemplazan por `"<volatile>"` al guardar.

### Multi-ambiente (`dev` / `qa` / `prod`)

Selección por variable (sin tocar tests):

```bash
TEST_ENV=prod npm run test:ui:chromium   # default; único live hoy
TEST_ENV=qa   npm run test:config        # prueba que el parámetro QA resuelve bien
TEST_ENV=dev  npm run test:config
npm run test:config:all-envs
```

| Ambiente | ¿Live hoy? | Comportamiento |
|----------|------------|----------------|
| `prod` | Sí | UI = Central de Pasajes, API = SWAPI |
| `qa` | No (placeholder) | Config ok; UI/API se **skippean** hasta definir secrets |
| `dev` | No (placeholder) | Igual que qa |

Overrides (local o CI secrets) — si están presentes, el ambiente pasa a `isLive=true`:

- Por ambiente: `QA_UI_BASE_URL`, `QA_API_BASE_URL`, `DEV_*`, `PROD_*`
- Genéricos de la corrida: `UI_BASE_URL`, `API_BASE_URL`
- Legacy solo en prod: `BASE_URL`, `SWAPI_BASE_URL` (no afectan qa/dev)
- `API_MAX_RESPONSE_MS`

Catálogo tipado: [`src/config/environments.ts`](src/config/environments.ts)  
Resolver: [`src/config/resolve-environment.ts`](src/config/resolve-environment.ts)

**CI/CD:** el workflow del lunes corre E2E en `prod`. `workflow_dispatch` permite elegir `prod|qa|dev`. El job `config` valida los 3 ambientes en matrix. Secrets vacíos no pisan el catálogo.

---

## Arquitectura

```
src/
  config/         # catálogo + resolve TEST_ENV (dev/qa/prod)
  pages/          # POM: selectores + acciones
  assertions/     # aserciones de dominio (separadas del POM)
  helpers/        # evidencia UI (screenshots Allure)
  fixtures/       # test.extend → environment, page objects, api client
  api/            # client SWAPI + helper AJV
  schemas/        # schemas AJV
  data/           # datos tipados de búsqueda
  types/
tests/
  config/environment.spec.ts
  ui/search.spec.ts
  api/{people,planets,films}.spec.ts
api-responses/    # bodies happy path
docs/             # teóricas, locators, bug report, evidencia MCP, flujo git
.github/workflows/monday-tests.yml
```

### Decisiones técnicas

1. **Un solo repo Playwright** con projects: `ui-chromium`, `ui-firefox`, `ui-webkit`, `ui-mobile-chromium` (Pixel 5), `api`.
2. **POM estricto:** si cambia el botón Buscar, se toca **un archivo** (`src/pages/home.page.ts`).
3. **Fixtures** (`test.extend`): los specs no instancian page objects a mano.
4. **Esperas solo con aserciones auto-esperantes** (`expect(...).toBeVisible()`, `toHaveURL`, `not.toHaveValue('')`). Sin `waitForTimeout`, sin `waitFor({ state })`, sin `waitForFunction`. Todo el código es TypeScript (no hay `.js`/`.mjs`).
5. **Credenciales / config** vía `.env` (nunca committeado). El challenge usa URLs públicas; `.env.example` documenta el contrato.
6. **Tipado estricto** (`strict`, `noImplicitAny`); TypeScript 5.8.
7. **Allure UI legible:** `allure-playwright` con `detail: false` para ocultar steps técnicos; solo `test.step` de negocio + screenshots en aserciones.
8. **Multi-ambiente:** `TEST_ENV=dev|qa|prod` + overrides por secrets; E2E solo si `isLive`.

### UI — escenarios

| Escenario | Criterio |
|-----------|----------|
| Búsqueda válida | Retiro (BA) → Mar del Plata, fecha futura → lista `#servicios` y textos coherentes |
| Sin resultados | Ushuaia → La Quiaca → mensaje “No encontramos opciones…” |
| Datos inválidos | Submit vacío → permanece en home + mensajes “Completá el Origen / Destino / la fecha” |
| Volver atrás | Resultados → `goBack` → buscador usable |

**Locators:** relevados con Playwright MCP. Rol + nombre donde el sitio los expone (`getByRole('button', { name: 'Buscar' })`, `textbox "Ida"`, opciones `treeitem`); `aria-labelledby` en los combobox Select2 porque su nombre accesible es el valor elegido. El submit usa `click({ noWaitAfter: true })` porque Firefox puede colgarse esperando navigations programadas del sitio. Detalle: [`docs/locators.md`](docs/locators.md).

---

## Decisiones y trade-offs

### Qué prioricé

- Arquitectura mantenible (POM + fixtures + projects + tipado estricto).
- Reporte **entendible por negocio** (Allure con steps claros; evidencia API adjunta).
- Multi-ambiente listo para CI (`dev`/`qa`/`prod`) aunque hoy solo `prod` sea live.
- Honestidad de contrato: no inventar HTTP 400 en SWAPI; documentar paginación que requiere `limit`.

### Qué dejé afuera (a propósito)

| Ítem | Por qué |
|------|---------|
| Appium / Detox / Maestro | Pedido en el rol, **no** en este challenge. |
| Sharding real en CI | Se documenta el criterio; con la suite actual el matrix por browser alcanza. |
| Ambiente QA/DEV reales | No hay staging Beilox expuesto; hay placeholders + skip hasta secrets. |
| Más E2E del mismo buscador | No suma cobertura de riesgo; suma mantenimiento. |
| Snapshot estricto del JSON API | Las fechas volátiles lo rompen; usamos schema + aserciones de negocio + mask. |

### Riesgo flaky (sitio ajeno)

Central de Pasajes es **prod público**: ads, promos, Select2, datepicker. Mitigaciones:

- Locators encapsulados en el POM; solo aserciones auto-esperantes.
- Select2: se valida el valor del input oculto en vez de esperar que el dropdown se cierre (a veces conserva `--open`).
- Retries solo en CI; evidencia Allure (screenshot UI / JSON API).
- Smoke vs regresión (tags) para no pagar multi-browser en cada feedback corto.

### Si la suite creciera a ~500 tests

1. Capas: `@smoke` (PR) / `@regression` (nightly-lunes) / API contrato separado.
2. Projects ya usados (browsers + api + config); sumar tags por dominio.
3. CI: smoke en cada push; lunes full + matrix; sharding cuando el wall-clock duela.
4. Datos tipados y fixtures; evitar POM dios.
5. Multi-browser solo en smoke crítico + nightly, no en todo el set.

### API — escenarios (por endpoint)

Para `/people`, `/planets`, `/films`:

1. Happy path (lista) → 200 + schema AJV + tiempo &lt; `API_MAX_RESPONSE_MS` + persistencia JSON
2. 404 id inexistente
3. Segundo error: id malformado → **404 real** (SWAPI **no expone 400 estable**; no lo inventamos)

Nota: el listado de `films` usa `result[]`, mientras `people`/`planets` usan `results[]`. Los schemas reflejan esa diferencia.

---

## CI/CD (GitHub Actions)

Archivo: [`.github/workflows/monday-tests.yml`](.github/workflows/monday-tests.yml)

- **Cron:** `0 18 * * 1` → lunes **15:00 ART** (GMT-3), suite **full**
- **Pull request a `main`:** suite **smoke** como gate del PR (se cancela la corrida anterior si se pushea de nuevo)
- También `workflow_dispatch` con inputs `test_env` (`prod`/`qa`/`dev`) y `suite` (`smoke`/`full`)
- **smoke:** API + UI Chromium con `--grep @smoke` (Firefox/WebKit/mobile se skipean)
- **full:** API completa + matrix de 4 projects UI
- Job **api:** instala deps, corre suite según tag, sube `api-responses/` + `api-evidence/` + report
- Job **ui** con **matrix** de 4 projects (chromium / firefox / webkit / mobile-chromium), browsers en paralelo, `fail-fast: false`
- **Cache** (implementada): `npm` vía `actions/setup-node` y browsers en `~/.cache/ms-playwright` vía `actions/cache`, con key por versión de Playwright + browser. En cache hit solo se instalan las dependencias del sistema (`playwright install-deps`).

### Cómo escalaría el workflow si la suite crece (propuesta, no implementado)

- **Sharding:** `npx playwright test --project=ui-chromium --shard=1/4` … `4/4` y merge de blob reports.
- **Matrix por capa:** no repetir API en cada celda UI (como ya está separado).
- **Tags:** `@smoke` en PR, full + multi-browser en nightly/lunes.
- **Secrets / Environments:** `UI_BASE_URL`, `API_BASE_URL` por environment de GitHub (`qa`, `dev`, `prod`); nunca hardcodear en el YAML.
- Retries acotados + alerta al equipo solo tras reintento fallido (ver preguntas teóricas).

---

## Uso del asistente de IA + MCP Servers

Trabajé el challenge con **Cursor** (agente). Criterio: la IA acelera scaffolding, exploración y redacción; qué se automatiza, qué riesgo se cubre y qué se entrega lo decido yo.

### MCP servers usados

Evidencia completa (llamadas, respuestas, snapshots y screenshots): [`docs/mcp-evidence/`](docs/mcp-evidence/README.md).

1. **Playwright MCP** (`@playwright/mcp`) — exploración del buscador antes de tocar el POM.  
   `browser_navigate` → `browser_snapshot` → `browser_click` (Buscar vacío / combobox Origen) → `browser_type` → `browser_take_screenshot`. Qué cambió por eso:
   - locators por rol: `getByRole('button', { name: 'Buscar' })`, `textbox "Ida"`, opciones como `treeitem`;
   - el escenario “datos inválidos” asserta los mensajes reales (“Completá el Origen de tu viaje”…) en vez de `:invalid`;
   - un bug de accesibilidad de producto: [`docs/bug-report-a11y-controles-sin-nombre.md`](docs/bug-report-a11y-controles-sin-nombre.md).

2. **Git MCP** (`mcp-server-git`) — revisión del refactor de esperas.  
   `git_status` + `git_diff_unstaged` para revisar hunk por hunk que no quedara ningún `waitFor({ state })` / `waitForFunction` en el POM y que la cache del workflow estuviera en los dos jobs; `git_log` antes de armar los commits.

### Caso donde decidí NO usar el asistente

**Qué automatizar y qué dejar afuera.** El alcance (4 escenarios UI, no sumar más E2E del mismo buscador, multi-browser solo en el cron) y el orden del backlog por ROI los definí yo. La IA puede escribir más tests, pero no sabe qué riesgo importa para el negocio ni cuánto mantenimiento estamos dispuestos a pagar por un sitio ajeno.

**La revisión antes de entregar.** Revisé yo cada test y cada respuesta, no el asistente: un test que pasa no garantiza que valide lo correcto.

### MCP propuesto (no usado aquí) — útil en el día a día

**Atlassian MCP (Jira)**: cargar el bug directamente desde la sesión de exploración. Con Playwright MCP ya tengo pasos, snapshot y screenshots; con Jira MCP el asistente crea el issue con esa evidencia adjunta y lo linkea a la historia, sin copiar y pegar. Acá no lo usé porque no hay un Jira de Beilox: el bug quedó documentado en [`docs/bug-report-a11y-controles-sin-nombre.md`](docs/bug-report-a11y-controles-sin-nombre.md) con el formato listo para cargar.

### Qué aportó la IA vs. criterio humano (resumen)

| Área | IA / agente | Criterio humano |
|------|-------------|-----------------|
| Scaffold, POM, CI YAML | Implementación rápida | Arquitectura (separación pages/assertions/fixtures) |
| Locators | Exploración con Playwright MCP | Elegir rol vs. `aria-labelledby` según estabilidad |
| Locators / flaky Firefox | Propuesta `noWaitAfter` tras evidencia | Aceptar trade-off sitio externo |
| Schemas AJV | Borrador | Validar shape real (`result` vs `results`, typo `messsage`) |
| Preguntas teóricas | Ayuda de redacción | Contenido y criterio revisados y ajustados por mí |
| Alcance y backlog | — | Decisión propia |

---

## Preguntas teóricas

Ver [`docs/theoretical-questions.md`](docs/theoretical-questions.md).

---

## Trabajo en equipo

Cómo trabajaría este repo con otros QA (rama por historia, PR, control cruzado, merge a la rama de integración): [`docs/git-workflow.md`](docs/git-workflow.md).

---

## Limitaciones conscientes

- No hay ambiente staging de Beilox: usamos un sitio público → riesgo de cambio de DOM/promos.
- Mobile = emulación **Pixel 5** (no Appium/Detox/Maestro; fuera del alcance del challenge).
- SWAPI no ofrece 400 predecible; testamos 404 reales.
- Sharding avanzado documentado, no implementado (se evalúa criterio).

---

## Licencia / uso

Entrega de challenge técnico. Central de Pasajes y SWAPI son sistemas de terceros; las pruebas son de solo lectura / consulta.

