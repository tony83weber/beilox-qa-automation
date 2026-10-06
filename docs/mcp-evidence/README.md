# Evidencia de uso de MCP servers

Sesiones reales contra dos MCP servers oficiales, hablando el protocolo MCP (JSON-RPC por stdio: `initialize` → `tools/list` → `tools/call`).

| MCP server | Versión (`serverInfo`) | Para qué |
|------------|------------------------|----------|
| [Playwright MCP](https://github.com/microsoft/playwright-mcp) (`@playwright/mcp`) | `Playwright 1.64.0-alpha` | Explorar el buscador y relevar roles / nombres accesibles antes de tocar el POM |
| [Git MCP](https://github.com/modelcontextprotocol/servers/tree/main/src/git) (`mcp-server-git`) | `mcp-git 1.30.0` | Revisar el diff del refactor de esperas y del POM antes de commitear |

Config para usarlos desde Cursor / Claude Code (`mcp.json`):

```json
{
  "mcpServers": {
    "playwright": { "command": "npx", "args": ["-y", "@playwright/mcp@latest"] },
    "git": { "command": "uvx", "args": ["mcp-server-git", "--repository", "."] }
  }
}
```

---

## 1. Playwright MCP — exploración del buscador

### Llamadas

| # | Tool | Argumentos | Código Playwright que generó el server |
|---|------|------------|----------------------------------------|
| 1 | `browser_navigate` | `url: https://www.centraldepasajes.com.ar/` | `await page.goto('https://www.centraldepasajes.com.ar/');` |
| 2 | `browser_snapshot` | — | árbol de accesibilidad → [`home-snapshot.yml`](home-snapshot.yml) |
| 3 | `browser_click` | `target: e71` (“Buscar”, form vacío) | `await page.getByRole('button', { name: 'Buscar' }).click();` |
| 4 | `browser_snapshot` | — | [`submit-vacio-snapshot.yml`](submit-vacio-snapshot.yml) |
| 5 | `browser_take_screenshot` | — | [`01-submit-vacio.png`](01-submit-vacio.png) |
| 6 | `browser_click` | `target: e39` (combobox Origen) | `await page.getByRole('combobox', { name: 'Ingresá desde dónde viajás' }).click();` |
| 7 | `browser_type` | `.select2-search__field` ← `Buenos Aires` | `await page.locator('.select2-search__field').fill('Buenos Aires');` |
| 8 | `browser_wait_for` | `text: Retiro` | — |
| 9 | `browser_snapshot` | — | [`dropdown-origen-snapshot.yml`](dropdown-origen-snapshot.yml) |
| 10 | `browser_take_screenshot` | — | [`02-dropdown-origen.png`](02-dropdown-origen.png) |

### Qué encontré y qué cambió en el código

**a) El buscador expone roles accesibles.** Extracto de `home-snapshot.yml`:

```yaml
- heading "Buscá tu pasaje en micro" [level=1]
- combobox "Ingresá desde dónde viajás" [ref=e39]
- button [ref=e42]:
    - img "Flecha"
- combobox "Ingresá hacia dónde viajás" [ref=e49]
- textbox "Ida" [ref=e62]
- textbox "Vuelta" [disabled] [ref=e66]
- combobox [ref=e70]:        # pasajeros
- button "Buscar" [ref=e71]
```

→ El POM pasó de `#btnCons` / `#fechaPartida` a `getByRole('button', { name: 'Buscar' })` y `getByRole('textbox', { name: 'Ida' })`.

**b) El submit vacío muestra mensajes de validación visibles.** Extracto de `submit-vacio-snapshot.yml`:

```yaml
- list:
    - listitem: Completá el Origen de tu viaje
- combobox "Ingresá desde dónde viajás" [active]
- list:
    - listitem: Completá el Destino de tu viaje
...
- list:
    - listitem: Completá la fecha
```

→ El escenario “datos inválidos” dejó de chequear `:invalid` con `page.evaluate` (no auto-espera) y ahora asserta esos tres mensajes con `expect(...).toBeVisible()`.

**c) Las opciones del dropdown son `treeitem`.** Extracto de `dropdown-origen-snapshot.yml`:

```yaml
- combobox "Ingresá desde dónde viajás" [expanded]:
    - tree:
        - treeitem "(BUE) Buenos Aires. Terminal Retiro (Capital Federal) (Argentina)"
        - treeitem "(DELE) Buenos Aires. Terminal Dellepiane (Capital Federal) (Argentina)"
```

→ La opción se elige con `getByRole('treeitem').filter({ hasText })`. Se eliminó el fallback que, si no encontraba la opción, clickeaba la primera (podía elegir una terminal equivocada sin fallar).

**d) Controles sin nombre accesible** (botón invertir origen/destino, pasajeros, bullets del carrusel) → bug de producto: [`../bug-report-a11y-controles-sin-nombre.md`](../bug-report-a11y-controles-sin-nombre.md).

**Lo que MCP no mostró y encontró el test:** el nombre accesible de los combobox Select2 es el valor seleccionado. En el escenario “volver atrás” el navegador restaura la selección y el nombre cambia, así que `getByRole('combobox', { name })` no sirve ahí. Origen/Destino quedaron anclados a `aria-labelledby`.

---

## 2. Git MCP — revisión del refactor

| # | Tool | Para qué |
|---|------|----------|
| 1 | `git_status` | Confirmar el alcance: `scripts/*.mjs` eliminados, POM + assertions + workflow modificados, nada fuera de lugar |
| 2 | `git_diff_unstaged` | Revisar hunk por hunk que no quedara ningún `waitFor({ state })` ni `waitForFunction` en el POM y que el workflow tuviera la cache en los dos jobs |
| 3 | `git_log` | Ver la historia reciente antes de armar los commits |

Extracto de la respuesta de `git_status`:

```text
Changes to be committed:
	deleted:    scripts/explore-cdp.mjs
	deleted:    scripts/explore-edge.mjs
	deleted:    scripts/explore-search.mjs
Changes not staged for commit:
	modified:   .github/workflows/monday-tests.yml
	modified:   src/assertions/search.assertions.ts
	modified:   src/pages/home.page.ts
	modified:   src/pages/search-results.page.ts
```

Los `scripts/*.mjs` eran exploración en JavaScript con `waitForTimeout`. Playwright MCP cubre ese mismo uso (descubrir la UI antes de escribir el spec) sin dejar código JS en el repo.
