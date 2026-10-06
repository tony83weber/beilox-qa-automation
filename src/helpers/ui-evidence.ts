import { test, type Page } from '@playwright/test';

/**
 * Evidencia visual para Allure / attachments de Playwright.
 * Se usa alrededor de aserciones UI que pasan; en el fallo, la captura la adjunta Playwright
 * (`screenshot: 'only-on-failure'`), así que acá no hace falta capturar errores.
 */
export async function attachUiScreenshot(page: Page, label: string): Promise<void> {
  // Viewport y no fullPage: con listas largas de resultados WebKit supera el máximo de 32767 px.
  const body = await page.screenshot({ type: 'png' });
  await test.info().attach(label, {
    body,
    contentType: 'image/png',
  });
}

/** Ejecuta una aserción UI como step legible en Allure y adjunta screenshot si pasa. */
export async function uiAssertStep(
  page: Page,
  stepName: string,
  assertion: () => Promise<void>,
): Promise<void> {
  await test.step(stepName, async () => {
    await assertion();
    await attachUiScreenshot(page, 'Captura de pantalla');
  });
}
