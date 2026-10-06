# Backlog de mejoras — Beilox challenge

Notas del candidato (2026-10-06). Revisar mañana; no implementar todavía.

## 1. Multi-ambiente (aunque hoy solo usemos prod)

- Soportar ambientes: `qa`, `stg`, `prod` (o `production`).
- Config por env (URLs UI + API, timeouts) vía `.env` / archivos de config tipados.
- Hoy solo apuntamos a **producción** (CDP + swapi.tech), pero la estructura debe permitir cambiar con una variable tipo `ENV=qa|stg|prod` sin tocar tests.

## 2. Reporte más usable (Allure u otro)

- Reemplazar o complementar el HTML default de Playwright.
- Candidato fuerte: **Allure Report**.
- Adjuntar evidencia:
  - imagen / screenshot si **falla**
  - imagen / screenshot si **pasa** (o al menos en happy path UI)
- Objetivo: que el informe se entienda en una mirada (no solo el HTML stock de Playwright).

## 3. API / backend — guardar más evidencia por test

- Persistir por llamada (además del happy-path JSON actual):
  - **status code**
  - **body / salida**
  - (deseable) tiempo de respuesta, endpoint, método
- Carpeta o naming claro para revisar qué se guardó en cada corrida.

## 4. Locators UI — revisión de calidad

- Revisar si los selectores actuales (Select2, `#btnCons`, etc.) son las mejores opciones.
- Preferir roles/labels estables cuando el DOM lo permita; documentar trade-offs del sitio productivo.
- Validar en Chromium / Firefox / WebKit / Pixel 5 tras cambios.

## Orden sugerido (mañana)

1. Multi-ambiente (estructura, sin inventar URLs falsas de qa/stg).
2. Evidencia API (status + body).
3. Allure + screenshots pass/fail.
4. Pasada de locators con criterio.

## Estado actual (baseline)

- API: 10 passed (local candidato).
- UI × 4 browsers: 16 passed (local candidato).
- Reporte actual: Playwright HTML (no convence; a mejorar).
