# Bug — Controles del buscador sin nombre accesible

**Sistema:** centraldepasajes.com.ar (home, buscador de pasajes)  
**Ambiente:** producción  
**Severidad:** Media (accesibilidad; bloquea a usuarios de lector de pantalla)  
**Tipo:** Bug de producto — accesibilidad (WCAG 2.1, criterio 4.1.2 *Name, Role, Value*)  
**Detectado con:** Playwright MCP (`browser_snapshot`) — ver [`docs/mcp-evidence/`](mcp-evidence/)

---

## Resumen

En el árbol de accesibilidad del home, varios controles interactivos se exponen como `button` o `combobox` **sin nombre**. Un lector de pantalla los anuncia como “botón” sin decir qué hacen.

## Pasos para reproducir

1. Abrir `https://www.centraldepasajes.com.ar/`.
2. Inspeccionar el árbol de accesibilidad (Playwright MCP `browser_snapshot`, o DevTools → Accessibility).
3. Ubicar el bloque “Buscá tu pasaje en micro”.

## Resultado actual

Extracto del snapshot de Playwright MCP:

```yaml
- combobox "Ingresá desde dónde viajás" [ref=e39]
- button [ref=e42]:            # invertir origen/destino: sin nombre
    - img "Flecha" [ref=e43]
- combobox "Ingresá hacia dónde viajás" [ref=e49]
...
- generic [ref=e69]: Pasajeros
- combobox [ref=e70]:          # select de pasajeros: el label no está asociado
    - option "1" [selected]
...
- button [ref=e115]            # bullets del carrusel de promos: sin nombre (x5)
- button [ref=e117]
```

| Control | Rol expuesto | Nombre accesible |
|---------|--------------|------------------|
| Invertir origen ↔ destino | `button` | ninguno |
| Cantidad de pasajeros | `combobox` | ninguno (el texto “Pasajeros” no está asociado como `<label for>`) |
| Bullets del carrusel (5) | `button` | ninguno |

## Resultado esperado

Cada control interactivo tiene nombre accesible, por ejemplo:

- `<button aria-label="Invertir origen y destino">`
- `<label for="pasajeros">Pasajeros</label>`
- bullets con `aria-label="Ir a la promoción 1"` …

## Evidencia

- Snapshot de accesibilidad y extractos: [`docs/mcp-evidence/README.md`](mcp-evidence/README.md)
- Captura del buscador: [`docs/mcp-evidence/01-submit-vacio.png`](mcp-evidence/01-submit-vacio.png)

## Impacto en la automatización

Sin nombre accesible no se puede usar `getByRole('button', { name: … })` para el botón de invertir ni para pasajeros. El POM usa `#pasajeros` como fallback. Si el sitio corrige el bug, se migra a `getByRole` en un solo archivo (`src/pages/home.page.ts`).

## Observación adicional (no es parte del bug)

El nombre accesible de los combobox de Select2 es **el valor elegido**: vacío muestra “Ingresá desde dónde viajás” y, después de elegir, pasa a “(BUE) Buenos Aires. Terminal Retiro…”. No es un bug (es el comportamiento de Select2), pero hace que `getByRole('combobox', { name })` no sea estable: lo detectó el test de “volver atrás”, donde el navegador restaura la selección. Por eso esos dos controles se anclan a `aria-labelledby`.
