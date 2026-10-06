# Criterio de locators UI (Central de Pasajes)

Los roles y nombres accesibles se relevaron con Playwright MCP antes de escribir el POM ([`mcp-evidence/`](mcp-evidence/README.md)).

## Locators actuales

| Elemento | Locator | Por qué |
|----------|---------|---------|
| Buscar | `getByRole('button', { name: 'Buscar', exact: true })` | Rol + nombre visibles en el snapshot de accesibilidad. |
| Fecha ida | calendario `#cdp-calendar-container` (se abre desde el textbox "Ida") | Se elige el día como una persona: flecha de mes y clic en el día. El textbox queda en `dd-mm-yyyy`. |
| Origen / Destino | `[aria-labelledby="select2-PadOrigen-container"]` / `…PadDestino…` | El nombre accesible del combobox Select2 es el **valor elegido**: cambia al volver atrás. `aria-labelledby` es fijo. |
| Opción del dropdown | `getByRole('treeitem').filter({ hasText })` | Select2 expone las opciones como `treeitem`. |
| Valor elegido | `#PadOrigen` / `#PadDestino` | Input nativo oculto por Select2: única fuente confiable del valor. |
| Pasajeros | `#pasajeros` | El combobox no tiene nombre accesible (ver [bug](bug-report-a11y-controles-sin-nombre.md)). |
| Validación vacía | `getByText('Completá el Origen de tu viaje')` (y destino / fecha) | Mensaje que ve el usuario. |
| Resultados | `#servicios` + items `ServiciosListView` / `#divData` | Contenedor real de la lista; no tiene rol semántico. |
| Sin resultados | texto “No encontramos opciones…” | Mensaje de negocio visible. |

## Esperas

- Solo aserciones auto-esperantes: `expect(locator).toBeVisible()`, `toHaveURL`, `not.toHaveValue('')`.
- Sin `waitForTimeout`, sin `waitFor({ state })`, sin `waitForFunction`.
- “Resultados o vacío” en un único `expect(serviceItems.or(emptyState).first()).toBeVisible()`: evita el `Promise.race`, cuyo wait perdedor quedaba como step rojo en Allure aunque el test pasara.
- Tras elegir una opción de Select2 el dropdown a veces queda abierto. Se cierra con Escape (no con la API de jQuery) y se valida el valor del input oculto.

## Qué preferiríamos en un producto propio

1. `<label for>` en todos los campos → `getByLabel('Origen')`.
2. `data-testid="search-result-item"` / `data-testid="search-empty"` para resultados.
3. Nombres accesibles que describan la acción (hoy invertir origen/destino se llama “Flecha” y los bullets del carrusel no tienen nombre).

## Regla

Si cambia el botón Buscar → se toca **solo** [`src/pages/home.page.ts`](../src/pages/home.page.ts).
