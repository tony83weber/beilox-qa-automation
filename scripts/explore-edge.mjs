import { chromium } from '@playwright/test';

async function pick(page, containerId, query, preferredIncludes) {
  await page.locator(`#${containerId}`).click({ force: true });
  await page.waitForTimeout(400);
  if ((await page.locator('.select2-container--open').count()) === 0) {
    await page.locator(`span[aria-labelledby="${containerId}"]`).click({ force: true });
    await page.waitForTimeout(400);
  }
  const searchField = page.locator('.select2-search__field:visible');
  await searchField.fill(query);
  await page.waitForTimeout(1200);
  const options = page.locator('.select2-results__option');
  let target = options.first();
  if (preferredIncludes) {
    const m = options.filter({ hasText: preferredIncludes });
    if (await m.count()) target = m.first();
  }
  await target.click();
  await page.waitForTimeout(500);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

// --- Invalid: submit empty ---
await page.goto('https://www.centraldepasajes.com.ar/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2500);
await page.locator('#btnCons').click();
await page.waitForTimeout(2000);
console.log('EMPTY URL', page.url());
console.log(
  'EMPTY ALERTS',
  await page.locator('.alert, .modal, #DivAlerta, #ContAlerta, .swal2-popup, .toast').allTextContents(),
);
console.log(
  'EMPTY ERR HIDDEN',
  await page.evaluate(() => ({
    title: document.getElementById('errortitle')?.value,
    msg: document.getElementById('errormsj')?.value,
  })),
);
const validationMsg = await page.evaluate(() => {
  const invalid = [...document.querySelectorAll(':invalid')].map((e) => e.id || e.name);
  return invalid;
});
console.log('INVALID CONTROLS', validationMsg);
await page.screenshot({ path: '/tmp/cdp-empty.png' });

// --- Same origin/destination ---
await page.goto('https://www.centraldepasajes.com.ar/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2500);
await pick(page, 'select2-PadOrigen-container', 'Buenos Aires', 'Terminal Retiro');
await pick(page, 'select2-PadDestino-container', 'Buenos Aires', 'Terminal Retiro');
await page.evaluate(() => {
  window.jQuery('#fechaPartida').val('27-10-2026').trigger('change');
});
await page.locator('#btnCons').click();
await page.waitForTimeout(4000);
console.log('SAME OD URL', page.url());
console.log(
  'SAME OD BODY',
  (await page.locator('body').innerText()).slice(0, 1200).replace(/\s+/g, ' '),
);
console.log(
  'SAME OD ALERTS',
  await page.locator('.alert, .modal, #DivAlerta, #ContAlerta, .swal2-popup').allTextContents(),
);
await page.screenshot({ path: '/tmp/cdp-same.png' });

// --- No results: remote unlikely route ---
await page.goto('https://www.centraldepasajes.com.ar/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2500);
await pick(page, 'select2-PadOrigen-container', 'Ushuaia', 'Ushuaia');
await pick(page, 'select2-PadDestino-container', 'La Quiaca', 'Quiaca');
await page.evaluate(() => {
  window.jQuery('#fechaPartida').val('15-01-2027').trigger('change');
});
await Promise.all([
  page.waitForNavigation({ timeout: 60_000 }).catch(() => null),
  page.locator('#btnCons').click(),
]);
await page.waitForTimeout(8000);
console.log('NORES URL', page.url());
console.log(
  'NORES BODY',
  (await page.locator('body').innerText()).slice(0, 1800).replace(/\s+/g, ' '),
);
console.log(
  'servicios count',
  await page.locator('#servicios [id*="ServiciosListView"], #servicios .divData').count(),
);
await page.screenshot({ path: '/tmp/cdp-nores.png' });

// Modificar / back from happy path
await page.goto('https://www.centraldepasajes.com.ar/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2500);
await pick(page, 'select2-PadOrigen-container', 'Buenos Aires', 'Terminal Retiro');
await pick(page, 'select2-PadDestino-container', 'Mar del Plata', 'Mar del Plata Terminal');
await page.evaluate(() => {
  window.jQuery('#fechaPartida').val('27-10-2026').trigger('change');
});
await Promise.all([
  page.waitForNavigation({ timeout: 60_000 }).catch(() => null),
  page.locator('#btnCons').click(),
]);
await page.waitForTimeout(5000);
const modificar = page.getByText('Modificar', { exact: false });
console.log('Modificar count', await modificar.count());
if (await modificar.count()) {
  await modificar.first().click();
  await page.waitForTimeout(3000);
  console.log('AFTER MOD URL', page.url());
  console.log('PadOrigen visible?', await page.locator('#PadOrigen').count());
  console.log('btnCons?', await page.locator('#btnCons').count());
}

await browser.close();
