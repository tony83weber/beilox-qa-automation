# Backlog de mejoras — Beilox challenge

Notas del candidato (2026-10-06). Revisar mañana; no implementar todavía.

## 1. Multi-ambiente — HECHO (`dev` / `qa` / `prod`)

- Catálogo tipado + `TEST_ENV` / overrides `UI_BASE_URL` / `API_BASE_URL`.
- Tests `tests/config/environment.spec.ts` + CI matrix config + `workflow_dispatch` input.
- E2E UI/API se skippean si el ambiente no está `isLive` (qa/dev placeholders).

## 2. Reporte más usable (Allure u otro) — HECHO (UI)

- Allure via `allure-playwright` + steps legibles (`test.step` / `uiAssertStep`).
- Screenshot en aserción **OK** y **FAIL** (UI).
- API: evidencia sigue en `api-responses/` (JSON); no se fuerza screenshot ahí.
- Ver README: `npm run report:allure` / `report:allure:serve` (requiere Java).

## 3. API / backend — guardar más evidencia por test

- Persistir por llamada (además del happy-path JSON actual):
  - **status code**
  - **body / salida**
  - (deseable) tiempo de respuesta, endpoint, método
- Carpeta o naming claro para revisar qué se guardó en cada corrida.

### 3.b Fechas dinámicas en `api-responses/` (riesgo señalado por el candidato)

- Bodies de SWAPI traen campos que **cambian** (`created`, `edited`, `timestamp`, etc.), sobre todo en `films` / detalles.
- Hoy los tests **no fallan mañana** solo por eso: validamos con **AJV (schema/estructura)** y **reescribimos** el JSON en cada happy path; no hacemos snapshot estricto campo-a-campo contra el archivo viejo.
- Igual hay que mejorar para que “corra siempre”:
  - no commitear snapshots frágiles con fechas, o
  - al comparar, **ignorar / enmascarar** campos volátiles (`timestamp`, `created`, `edited`), o
  - tratar `api-responses/` como **artifact de corrida** (CI) y no como golden fijo, o
  - golden estable solo con campos invariantes (`uid`, `name`, `title`, etc.).

## 4. Locators UI — revisión de calidad

- Revisar si los selectores actuales (Select2, `#btnCons`, etc.) son las mejores opciones.
- Preferir roles/labels estables cuando el DOM lo permita; documentar trade-offs del sitio productivo.
- Validar en Chromium / Firefox / WebKit / Pixel 5 tras cambios.
- **Parcial:** se corrigieron waits Select2 / `Promise.race` que dejaban steps rojos en Allure con test passed.

## Orden sugerido (siguiente)

1. Evidencia API (status + body) + fechas volátiles.
2. Pasada de locators con criterio (revisión fina).

## Estado actual (baseline)

- API: 10 passed (local candidato).
- UI × 4 browsers: 16 passed (local candidato).
- Reporte UI: **Allure** (steps + screenshots OK/FAIL). HTML Playwright queda de respaldo.
