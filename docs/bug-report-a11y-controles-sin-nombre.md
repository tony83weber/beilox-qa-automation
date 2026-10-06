# Bug — Controles del buscador sin nombre accesible (o con un nombre que no describe la acción)

| Campo | Valor |
|-------|-------|
| **Sistema** | centraldepasajes.com.ar — home, buscador de pasajes |
| **Ambiente** | Producción |
| **Navegadores** | Chromium, Firefox, WebKit (es markup, no depende del browser) |
| **Tipo** | Bug de producto — accesibilidad |
| **Norma** | WCAG 2.1: 4.1.2 *Name, Role, Value* · 1.3.1 *Info and Relationships* · 2.4.6 *Headings and Labels* |
| **Severidad** | Media |
| **Prioridad sugerida** | Media — no bloquea la compra con mouse, pero un usuario de lector de pantalla no puede saber qué hacen estos controles |
| **Detectado con** | Playwright MCP (`browser_snapshot`), confirmado inspeccionando el DOM — ver [`docs/mcp-evidence/`](mcp-evidence/README.md) |

---

## Resumen

Cuatro controles interactivos del home no tienen un nombre accesible útil. Un lector de pantalla los anuncia como “botón”, “cuadro combinado” o “botón Flecha”, sin decir qué hacen.

## Pasos para reproducir

1. Abrir `https://www.centraldepasajes.com.ar/`.
2. Inspeccionar el árbol de accesibilidad: Playwright MCP `browser_snapshot`, o DevTools → pestaña *Accessibility*.
3. Revisar el bloque “Buscá tu pasaje en micro”, el carrusel de promos y el menú en mobile.

## Resultado actual

| # | Control | Nombre accesible | Markup real |
|---|---------|------------------|-------------|
| 1 | Invertir origen ↔ destino | **“Flecha”**: describe la imagen, no la acción | `<button id="btnChangePads"><img alt="Flecha" …></button>` |
| 2 | Cantidad de pasajeros | **ninguno**: el texto “Pasajeros” no está asociado al select | `<select id="pasajeros">` sin `<label for>` ni `aria-label` |
| 3 | Bullets del carrusel de promos (×5) | **ninguno** | `<button role="button" class="owl-dot"><span></span></button>` |
| 4 | Menú hamburguesa (mobile) | **ninguno** | `<button class="navbar-toggle collapsed" …>` sin texto ni `aria-label` |

Extracto del snapshot de Playwright MCP:

```yaml
- combobox "Ingresá desde dónde viajás" [ref=e39]
- button [ref=e42]:            # 1. invertir origen/destino
    - img "Flecha" [ref=e43]
- combobox "Ingresá hacia dónde viajás" [ref=e49]
- generic [ref=e69]: Pasajeros
- combobox [ref=e70]:          # 2. pasajeros sin nombre
    - option "1" [selected]
- button [ref=e115]            # 3. bullets del carrusel
- button [ref=e117]
```

Verificación en el DOM (Playwright):

```ts
await page.getByRole('button', { name: 'Flecha' }).count();          // 1 → el nombre es "Flecha"
await page.getByRole('combobox', { name: /pasajeros/i }).count();    // 0 → pasajeros no tiene nombre
```

## Resultado esperado

| # | Corrección sugerida |
|---|---------------------|
| 1 | `<button id="btnChangePads" aria-label="Invertir origen y destino">` y la imagen con `alt=""` (decorativa) |
| 2 | `<label for="pasajeros">Pasajeros</label>` |
| 3 | `aria-label="Ir a la promoción 1"` … `5` en cada bullet |
| 4 | `aria-label="Abrir menú"` |

## Impacto

- **Usuarios:** quien navega con lector de pantalla no sabe que puede invertir el tramo ni qué está eligiendo en el select de pasajeros.
- **Automatización:** sin nombres accesibles hay que usar ids (`#pasajeros`) en lugar de `getByRole(…, { name })`. Si el sitio lo corrige, el cambio se hace en un solo archivo: `src/pages/home.page.ts`.

## Evidencia

- Snapshot completo del home: [`mcp-evidence/home-snapshot.yml`](mcp-evidence/home-snapshot.yml)
- Captura del buscador: [`mcp-evidence/01-submit-vacio.png`](mcp-evidence/01-submit-vacio.png)

## Nota (no forma parte del bug)

El nombre accesible de los combobox de Select2 es el **valor elegido**: vacío dice “Ingresá desde dónde viajás” y, después de elegir, “(BUE) Buenos Aires. Terminal Retiro…”. Es el comportamiento estándar de Select2, pero hace que `getByRole('combobox', { name })` no sea estable: lo detectó el test de “volver atrás”, donde el navegador restaura la selección. Por eso esos dos controles se anclan a `aria-labelledby`.
