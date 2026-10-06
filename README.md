# Beilox — Challenge QA Automation Senior

Framework de pruebas automatizadas con **Playwright + TypeScript** (strict), cubriendo:

- **UI Web** sobre [centraldepasajes.com.ar](https://www.centraldepasajes.com.ar/) (sitio de referencia productiva)
- **API** sobre [swapi.tech](https://www.swapi.tech/api) (`/people`, `/planets`, `/films`) con validación **AJV**
- **CI** con GitHub Actions (lunes 15:00 ART)
- Documentación de uso de asistente de IA + MCP y respuestas teóricas

> Objetivo del challenge: demostrar arquitectura escalable, buenas prácticas (POM, fixtures, esperas correctas) y criterio — no una suite “perfecta” contra un sitio ajeno.

---

## Requisitos

- Node.js **≥ 20**
- npm 10+

```bash
npm ci
npx playwright install --with-deps chromium firefox webkit
cp .env.example .env
```

---

## Cómo ejecutar

| Comando | Qué corre |
|---------|-----------|
| `npm run test:api` | Solo API (project `api`) |
| `npm run test:ui:chromium` | UI en Chromium |
| `npm run test:ui:firefox` | UI en Firefox |
| `npm run test:ui:webkit` | UI en WebKit |
| `npm run test:ui:mobile` | UI emulando **Pixel 5** |
| `npm run test:ui` | UI en los 4 projects |
| `npm test` | Toda la suite (UI×4 + API) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run report` | Abre el HTML report |

Los happy path de API escriben/actualizan:

- `api-responses/people-happy-path.json`
- `api-responses/planets-happy-path.json`
- `api-responses/films-happy-path.json`

---

## Arquitectura

```
src/
  pages/          # POM: selectores + acciones
  assertions/     # aserciones de dominio (separadas del POM)
  fixtures/       # test.extend → homePage, resultsPage, swapiClient
  api/            # client SWAPI + helper AJV
  schemas/        # schemas AJV
  data/           # datos tipados de búsqueda
  types/
tests/
  ui/search.spec.ts
  api/{people,planets,films}.spec.ts
api-responses/    # bodies happy path
.github/workflows/monday-tests.yml
```

### Decisiones técnicas

1. **Un solo repo Playwright** con projects: `ui-chromium`, `ui-firefox`, `ui-webkit`, `ui-mobile-chromium` (Pixel 5), `api`.
2. **POM estricto:** si cambia el botón Buscar, se toca **un archivo** (`src/pages/home.page.ts`).
3. **Fixtures** (`test.extend`): los specs no instancian page objects a mano.
4. **Sin `waitForTimeout` fijos** en tests/POM de producción; esperas vía auto-waiting / `toBeVisible` / `waitForURL` implícito en assertions.
5. **Credenciales / config** vía `.env` (nunca committeado). El challenge usa URLs públicas; `.env.example` documenta el contrato.
6. **Tipado estricto** (`strict`, `noImplicitAny`); TypeScript 5.8.

### UI — escenarios

| Escenario | Criterio |
|-----------|----------|
| Búsqueda válida | Retiro (BA) → Mar del Plata, fecha futura → lista `#servicios` y textos coherentes |
| Sin resultados | Ushuaia → La Quiaca → mensaje “No encontramos opciones…” |
| Datos inválidos | Submit vacío → permanece en home + campos `:invalid` |
| Volver atrás | Resultados → `goBack` → buscador usable |

**Trade-off:** el sitio es productivo y externo (Select2, datepicker jQuery, ads). Priorizamos locators estables (`#btnCons`, containers Select2) y `click({ noWaitAfter: true })` en el submit porque Firefox puede colgarse esperando navigations programadas del sitio.

### API — escenarios (por endpoint)

Para `/people`, `/planets`, `/films`:

1. Happy path (lista) → 200 + schema AJV + tiempo &lt; `API_MAX_RESPONSE_MS` + persistencia JSON
2. 404 id inexistente
3. Segundo error: id malformado → **404 real** (SWAPI **no expone 400 estable**; no lo inventamos)

Nota: el listado de `films` usa `result[]`, mientras `people`/`planets` usan `results[]`. Los schemas reflejan esa diferencia.

---

## CI/CD (GitHub Actions)

Archivo: [`.github/workflows/monday-tests.yml`](.github/workflows/monday-tests.yml)

- **Cron:** `0 18 * * 1` → lunes **15:00 ART** (GMT-3)
- También `workflow_dispatch` para corridas manuales
- Job **api:** instala deps, corre `--project=api`, sube `api-responses/` + report
- Job **ui** con **matrix** de 4 projects (chromium / firefox / webkit / mobile-chromium), browsers en paralelo, `fail-fast: false`

### Cómo escalaría el workflow si la suite crece

- **Sharding:** `npx playwright test --project=ui-chromium --shard=1/4` … `4/4` y merge de blob reports.
- **Matrix por capa:** no repetir API en cada celda UI (como ya está separado).
- **Tags:** `@smoke` en PR, full + multi-browser en nightly/lunes.
- **Secrets:** `BASE_URL`, tokens, etc. solo por GitHub Secrets / Environments; nunca en el YAML.
- **Cache** de `~/.cache/ms-playwright` y `npm`.
- Retries acotados + alerta al equipo solo tras reintento fallido (ver preguntas teóricas).

---

## Uso del asistente de IA + MCP Servers

Trabajé el challenge con **Cursor** (agente + herramientas MCP/nativas). Criterio: la IA acelera scaffolding y exploración; las decisiones de riesgo y honestidad del contrato las firmé yo.

### MCP / tooling usado (al menos 2)

1. **Filesystem / herramientas de archivos del agente (Cursor)**  
   Scaffold del repo, POM, schemas AJV, workflow YAML, commits. Equivalente práctico a un Filesystem/Git MCP: lectura/escritura estructurada del proyecto y refactors.

2. **Exploración UI vía Playwright (scripts de descubrimiento + corridas headed/headless)**  
   Antes de escribir el spec final, exploré locators reales del buscador (Select2 `#PadOrigen` / `#PadDestino`, `#fechaPartida`, `#btnCons`, estados `#servicios` / “No encontramos opciones”). Mismo caso de uso que un **Playwright MCP**: descubrir la UI antes de solidificar el POM.

### Caso donde decidí NO usar el asistente

No delegué a la IA la decisión de **inventar un HTTP 400** en SWAPI. Probé requests inválidos; la API responde **404** (o 200 con params “raros”). El test documenta el comportamiento real. Forzar un 400 “porque el challenge lo menciona” sería deshonesto.

Tampoco dejé que la IA “rellene sola” las respuestas teóricas: las escribí con criterio de rol en [`docs/theoretical-questions.md`](docs/theoretical-questions.md).

### MCP propuesto (no usado aquí) — útil en el día a día

**Slack MCP** (o notificación equivalente): cuando el cron del lunes falla, publicar en un canal `#qa-ci` el link del run, el project que falló y el artifact del report. Cierra el loop CI → humano sin mirar Actions a mano. En un equipo Beilox real, eso reduce MTTR más que sumar otro browser al matrix.

### Qué aportó la IA vs. criterio humano (resumen)

| Área | IA / agente | Criterio humano |
|------|-------------|-----------------|
| Scaffold, POM, CI YAML | Implementación rápida | Arquitectura (separación pages/assertions/fixtures) |
| Locators / flaky Firefox | Propuesta `noWaitAfter` tras evidencia | Aceptar trade-off sitio externo |
| Schemas AJV | Borrador | Validar shape real (`result` vs `results`, typo `messsage`) |
| Teoría / 400 vs 404 | — | Firma del candidato |

---

## Preguntas teóricas

Ver [`docs/theoretical-questions.md`](docs/theoretical-questions.md).

---

## Limitaciones conscientes

- No hay ambiente staging de Beilox: usamos un sitio público → riesgo de cambio de DOM/promos.
- Mobile = emulación **Pixel 5** (no Appium/Detox/Maestro; fuera del alcance del challenge).
- SWAPI no ofrece 400 predecible; testamos 404 reales.
- Sharding avanzado documentado, no implementado (se evalúa criterio).

---

## Licencia / uso

Entrega de challenge técnico. Central de Pasajes y SWAPI son sistemas de terceros; las pruebas son de solo lectura / consulta.
