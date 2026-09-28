const { chromium } = require('/home/user/Whaoo-med/node_modules/playwright');
const OUT_DIR = __dirname;
const W = 414, H = 896;
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--disable-background-networking', '--no-first-run', '--disable-sync'] });
  const context = await browser.newContext({ viewport: { width: W, height: H }, recordVideo: { dir: OUT_DIR, size: { width: W, height: H } } });
  const page = await context.newPage();
  const t0 = Date.now(); const top = (m) => console.log(`${((Date.now() - t0) / 1000).toFixed(1)}s ${m}`);

  await page.goto('http://localhost:3100/demo', { waitUntil: 'domcontentloaded' });
  top('page chargée');
  await page.waitForTimeout(3600);

  await page.evaluate(() => document.querySelector('input[name="label"]')?.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(400);
  const labelInput = page.locator('input[name="label"]').first();
  await labelInput.click();
  top('saisie "Lait"');
  await labelInput.type('Lait', { delay: 95 });
  await page.waitForTimeout(480);
  await labelInput.blur();
  await page.waitForTimeout(1450);
  await page.locator('button[type="submit"]:has-text("Ajouter")').first().click();
  top('ajouté');
  await page.waitForTimeout(2100);

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  top('budget et cagnotte');
  await page.waitForTimeout(6450);
  await page.waitForTimeout(4850);

  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent?.includes('Marquer acheté'));
    btn?.scrollIntoView({ block: 'center' });
  });
  await page.waitForTimeout(560);
  const marquerBtn = page.locator('button:has-text("Marquer acheté")').first();
  if (await marquerBtn.count()) { await marquerBtn.click(); top('marqué acheté'); }
  await page.waitForTimeout(3060);

  // "Exporte ta liste ou ta facture" : onglet Acheté et ses facturettes.
  await page.locator('a:has-text("Acheté")').first().click();
  await page.waitForTimeout(700);
  await page.evaluate(() => {
    const titre = Array.from(document.querySelectorAll('p')).find((p) => p.textContent?.includes('🧾'));
    titre?.scrollIntoView({ block: 'start' });
    window.scrollBy(0, -12);
  });
  top('facturettes');
  await page.waitForTimeout(2920);

  await page.evaluate(() => document.querySelector('ul.grid')?.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(2420);

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  top('retour en haut');
  await page.waitForTimeout(7250);
  top('fin');
  await context.close();
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
