# Backlog de mejoras — Beilox challenge

## Hecho

1. Multi-ambiente `dev` / `qa` / `prod` + CI
2. Allure UI legible (steps negocio + screenshots)
3. Fixes waits Select2 / Promise.race (steps rojos fantasma)

## En curso / siguiente (ROI alto)

### A. Evidencia API robusta — EN CURSO
- Persistir por llamada: status, body, tiempo, endpoint/método
- Enmascarar campos volátiles (`timestamp`, `created`, `edited`)
- Aserciones de body con criterio de negocio (no solo schema):
  - entidad esperada presente (ej. Luke / Tatooine / A New Hope)
  - uids únicos en la página
  - paginación: página 1 y 2 sin solapamiento de ids

### B. Sección “Decisiones y trade-offs” en README
- Qué se dejó afuera y por qué
- Riesgo flaky sitio ajeno
- Cómo escalar a ~500 tests

### C. Bug report simulado (`docs/`)
- Caso Select2 `--open` / ruido en Allure
- Evidencia + impacto + propuesta

### D. Tags `@smoke` / `@regression` + script CI smoke
- Smoke en PR / dispatch; full el lunes

### E. Locators — pasada fina
- Roles/labels donde aporte; documentar por qué Select2/IDs

## Fuera de alcance (no aporta distinción)
- Más E2E del mismo buscador sin valor
- Docker/dashboard over-engineering
- Appium (no pedido en el challenge)
