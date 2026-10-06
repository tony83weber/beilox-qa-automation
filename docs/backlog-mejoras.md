# Backlog de mejoras — Beilox challenge

## Hecho

1. Multi-ambiente `dev` / `qa` / `prod` + CI
2. Allure UI legible (steps negocio + screenshots)
3. Fixes waits Select2 / Promise.race (steps rojos fantasma)
4. **A.** Evidencia API robusta (status/body/tiempo, mask fechas, aserciones de negocio, attachment Allure)
5. **B.** Sección “Decisiones y trade-offs” en README
6. **C.** Bug report de producto con evidencia de Playwright MCP — [`bug-report-a11y-controles-sin-nombre.md`](bug-report-a11y-controles-sin-nombre.md)
7. **D.** Tags `@smoke` / `@regression` + npm scripts `test:smoke` / `test:regression` + input `suite` en CI
8. **E.** Locators por rol relevados con Playwright MCP — [`locators.md`](locators.md)
9. Esperas solo con aserciones auto-esperantes; exploración `.mjs` reemplazada por Playwright MCP
10. Cache de npm + browsers en el workflow
11. Flujo de trabajo en equipo — [`git-workflow.md`](git-workflow.md)

## Pendiente

_(vacío — slice del challenge cerrado)_

## Fuera de alcance
- Más E2E del mismo buscador sin valor
- Docker/dashboard over-engineering
- Appium (no pedido en el challenge)
