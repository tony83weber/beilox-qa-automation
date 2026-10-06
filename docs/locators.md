# Criterio de locators UI (Central de Pasajes)

Documento corto para el challenge: por qué quedaron estos selectores y qué se preferiría en un producto propio.

## Locators actuales

| Elemento | Locator | Por qué |
|----------|---------|---------|
| Origen / Destino | Select2 vía `aria-labelledby` + `#PadOrigen` / `#PadDestino` | El input nativo está `select2-hidden-accessible`; hay que hablar con el widget. |
| Fecha | `#fechaPartida` | Campo estable; se setea vía jQuery/change (datepicker). |
| Buscar | `#btnCons` | ID estable del CTA; un solo lugar en el POM. |
| Resultados | `#servicios` + items `ServiciosListView` / `#divData` | Contenedor real de la lista productiva. |
| Vacío | texto “No encontramos opciones…” | Mensaje de negocio visible al usuario. |

## Qué preferiríamos (producto Beilox interno)

1. `getByRole('combobox', { name: 'Origen' })` / `getByLabel`.
2. Botón `getByRole('button', { name: 'Buscar' })`.
3. Resultados con `data-testid="search-result-item"`.
4. Estado vacío con `data-testid="search-empty"`.

En un sitio **ajeno/productivo** no controlamos el markup: forzar roles inexistentes genera flaky. Por eso el POM encapsula Select2/IDs y el resto del suite no los conoce.

## Regla

Si cambia el botón Buscar → se toca **solo** [`src/pages/home.page.ts`](../src/pages/home.page.ts).
