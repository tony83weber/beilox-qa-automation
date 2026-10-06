# Bug report simulado — Select2 deja el dropdown “open” y ensucia el reporte

**Proyecto:** Beilox QA Automation Challenge  
**Ambiente:** prod (centraldepasajes.com.ar)  
**Severidad:** Media (calidad de señal en reporte / riesgo de flaky percibido)  
**Tipo:** Defecto de automatización + comportamiento frágil del widget de terceros  
**Estado:** Mitigado en el framework  

---

## Resumen

Al elegir origen/destino en el buscador (Select2), el DOM a veces **conserva** la clase `select2-container--open` aunque la opción ya quedó seleccionada.  
Si el test espera `hidden` sobre ese contenedor, el wait **timeouta**, el test puede seguir (si se tragaba el error) pero **Allure muestra steps en rojo** con suite en verde. Eso confunde a negocio/tech leads.

## Pasos para reproducir (antes del fix)

1. Abrir home de Central de Pasajes.
2. Abrir Select2 de origen, buscar “Buenos Aires”, elegir Terminal Retiro.
3. Observar en DOM: el span Select2 puede seguir con `--open`.
4. Automatización: `await locator('.select2-container--open').waitFor({ state: 'hidden', timeout: 5000 })`.
5. Resultado: `TimeoutError` en el step; Allure marca el wait en rojo.

## Evidencia observada

- Call log típico: *waiting for `.select2-container--open` to be hidden* (múltiples resoluciones a `visible`).
- En paralelo, otro patrón dañino: `Promise.race` entre “hay resultados” y “sin resultados” dejaba el wait perdedor como step fallido en Allure aunque el test pasara.
- Impacto: reporte poco confiable (“hay cruces rojas pero está passed”).

## Análisis

| Hipótesis | Conclusión |
|-----------|------------|
| Bug funcional del sitio (no se puede buscar) | No: la búsqueda completa y navega a resultados. |
| Selector incorrecto del botón Buscar | No: el fallo era el cierre visual del dropdown. |
| Expectativa frágil del test | Sí: acoplarse al estado CSS `--open` de un widget jQuery/Select2. |
| Ruido de reportería | Sí: waits fallidos con `.catch` o races siguen apareciendo en Allure. |

## Mitigación aplicada (automation)

1. **No** esperar `hidden` del contenedor Select2.
2. Validar que el **value** del input oculto (`#PadOrigen` / `#PadDestino`) quedó seteado.
3. Cerrar con API Select2 (`select2('close')`) cuando existe jQuery.
4. Reemplazar `Promise.race` de resultados por un único `waitForFunction` (servicios **o** mensaje vacío).
5. Allure UI con `detail: false` + steps de negocio.

Referencia: [`src/pages/home.page.ts`](../src/pages/home.page.ts), [`src/pages/search-results.page.ts`](../src/pages/search-results.page.ts).

## Propuesta al equipo de producto (si fuera Beilox interno)

- Exponer `aria-expanded` / roles consistentes en el combobox.
- Evitar dejar `--open` tras selección (accesibilidad + testability).
- Ambiente staging estable (sin ads/promos de prod) para bajar ruido E2E.

## Criterio QA Senior

Un **passed** con steps rojos no es señal usable. O se arregla el wait, o se documenta el bug del widget; no se esconde con `catch` silencioso.
