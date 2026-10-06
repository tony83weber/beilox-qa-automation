import { test, type Page } from '@playwright/test';

/**
 * Evidencia visual para Allure / attachments de Playwright.
 * Se usa alrededor de aserciones UI: screenshot en OK y en FAIL.
 */
export async function attachUiScreenshot(page: Page, label: string): Promise<void> {
  if (page.isClosed()) {
    return;
  }
  const body = await page.screenshot({ fullPage: true, type: 'png' });
  await test.info().attach(label, {
    body,
    contentType: 'image/png',
  });
}

/**
 * Ejecuta una aserción/paso UI como step legible en Allure
 * y adjunta screenshot al terminar OK o al fallar.
 */
export async function uiAssertStep(
  page: Page,
  stepName: string,
  assertion: () => Promise<void>,
): Promise<void> {
  await test.step(stepName, async () => {
    try {
      await assertion();
      // Nombre corto: en Allure queda como adjunto, no como jerga técnica.
      await attachUiScreenshot(page, 'Captura de pantalla');
    } catch (error) {
      await attachUiScreenshot(page, 'Captura de pantalla (fallo)').catch(() => undefined);
      throw error;
    }
  });
}
