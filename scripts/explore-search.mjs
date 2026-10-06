import { chromium } from '@playwright/test';

function futureDate(daysAhead) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

async function pickByContainerId(page, containerId, query, preferredIncludes) {
  const rendered = page.locator(`#${containerId}`);
  await rendered.click({ force: true });
  await page.waitForTimeout(500);
  const open = page.locator('.select2-container--open');
  console.log(
    'open after click',
    containerId,
    await open.count(),
    'expanded',
    await page
      .locator(`#${containerId}`)
      .locator('xpath=ancestor::span[contains(@class,"select2-selection")]')
      .getAttribute('aria-expanded')
      .catch(() => null),
  );

  // Sometimes need double approach: click parent selection
  if ((await open.count()) === 0) {
    await page
      .locator(`span[aria-labelledby="${containerId}"]`)
      .click({ force: true });
    await page.waitForTimeout(500);
  }

  const searchField = page.locator('.select2-search__field:visible');
  await searchField.waitFor({ state: 'visible', timeout: 10_000 });
  await searchField.fill(query);
  await page.waitForTimeout(1500);
  const options = page.locator(
    '.select2-results__option:visible, .select2-container--open .select2-results__option',
  );
  await options.first().waitFor({ state: 'visible', timeout: 10_000 });
  const texts = await options.allTextContents();
  console.log(containerId, texts.slice(0, 6));
  let target = options.first();
  if (preferredIncludes) {
    const matched = options.filter({ hasText: preferredIncludes });
    if (await matched.count()) target = matched.first();
  }
  await target.click();
  await page.waitForTimeout(600);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto('https://www.centraldepasajes.com.ar/', {
  waitUntil: 'domcontentloaded',
  timeout: 90_000,
});
await page.waitForTimeout(3000);

console.log(
  'comboboxes',
  await page.getByRole('combobox').count(),
  await page.locator('[role="combobox"]').evaluateAll((els) =>
    els.map((e) => ({
      labelledby: e.getAttribute('aria-labelledby'),
      expanded: e.getAttribute('aria-expanded'),
      text: e.textContent?.trim().slice(0, 60),
    })),
  ),
);

await pickByContainerId(
  page,
  'select2-PadOrigen-container',
  'Buenos Aires',
  'Terminal Retiro',
);
console.log('origen', await page.locator('#PadOrigen').inputValue());

await pickByContainerId(
  page,
  'select2-PadDestino-container',
  'Mar del Plata',
  'Mar del Plata Terminal',
);
console.log('destino', await page.locator('#PadDestino').inputValue());

const date = futureDate(21);
await page.evaluate((d) => {
  const el = document.getElementById('fechaPartida');
  window.jQuery(el).val(d).trigger('change');
}, date);
console.log('fecha', await page.locator('#fechaPartida').inputValue());

await Promise.all([
  page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 60_000 }).catch(() => null),
  page.locator('#btnCons').click(),
]);
await page.waitForTimeout(8000);
console.log('URL', page.url());
console.log('TITLE', await page.title());
console.log(
  'BODY',
  (await page.locator('body').innerText()).slice(0, 2500).replace(/\s+/g, ' '),
);
await page.screenshot({ path: '/tmp/cdp-results.png', fullPage: false });

// dump main content ids
console.log(
  'IDS',
  await page.evaluate(() =>
    [...document.querySelectorAll('[id]')].map((e) => e.id).filter(Boolean).slice(0, 80),
  ),
);

await browser.close();
