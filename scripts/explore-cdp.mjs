import { chromium } from '@playwright/test';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

await page
  .goto('https://www.centraldepasajes.com.ar/', {
    waitUntil: 'domcontentloaded',
    timeout: 90_000,
  })
  .catch((e) => console.log('goto failed', e.message));

await page.waitForTimeout(5000);

for (const label of [
  'Aceptar',
  'Acepto',
  'Accept',
  'Entendido',
  'OK',
  'Cerrar',
  'Continuar',
]) {
  const b = page.getByRole('button', { name: new RegExp(label, 'i') });
  if (await b.count()) {
    console.log('CLICKING button', label);
    await b.first().click({ timeout: 2000 }).catch(() => {});
  }
}

const buttons = await page.getByRole('button').allTextContents().catch(() => []);
const inputs = await page
  .locator('input, select, textarea')
  .evaluateAll((els) =>
    els.map((e) => ({
      tag: e.tagName,
      type: e.getAttribute('type'),
      name: e.getAttribute('name'),
      id: e.id,
      placeholder: e.getAttribute('placeholder'),
      aria: e.getAttribute('aria-label'),
      class: String(e.className || '').slice(0, 140),
      visible: !!(e.offsetParent || e.getClientRects().length),
    })),
  );

console.log('TITLE', await page.title());
console.log('URL', page.url());
console.log('BUTTONS', JSON.stringify(buttons.slice(0, 50), null, 2));
console.log('INPUTS', JSON.stringify(inputs, null, 2));

const html = await page.content();
for (const kw of ['origen', 'destino', 'buscar', 'fecha', 'pasajero', 'autocomplete']) {
  const idx = html.toLowerCase().indexOf(kw);
  if (idx >= 0) {
    console.log(`\n=== KW ${kw} @ ${idx} ===`);
    console.log(html.slice(Math.max(0, idx - 180), idx + 350).replace(/\s+/g, ' '));
  }
}

await page.screenshot({ path: '/tmp/cdp-home.png', fullPage: false });
console.log('screenshot saved');
await browser.close();
