import { expect, test, type Locator } from '@playwright/test';
import { expectNoA11yViolations } from './a11y';

// HU-15 · Logo de cada proyecto en su tarjeta (docs/historias/HU-15-logos-proyectos.md)

const conLogo = ['enzona', 'rueda-viva', 'studio-shaddai', 'superpay23', 'centro-de-distribucion', 'denunciapp'];
const sinLogo = ['sca', 'bowling-app', 'micerveza-desafio', 'meubolso', 'cconet'];

async function expectLogo(card: Locator) {
  const logo = card.locator('[data-logo] img');
  await logo.scrollIntoViewIfNeeded();
  await expect(logo).toBeVisible();
  await expect(logo).toHaveAttribute('alt', '');
  await expect.poll(() => logo.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  await expect(card.locator('[data-thumb]')).toHaveCount(0);
}

test.describe('HU-15 · Logo de cada proyecto en su tarjeta', () => {
  for (const prefijo of ['', '/pt', '/en']) {
    test(`CA1 ${prefijo}/proyectos/: las tarjetas con logo lo muestran`, async ({ page }) => {
      await page.goto(`${prefijo}/proyectos/`);
      for (const id of conLogo) await expectLogo(page.locator(`article#${id}`));
    });
  }

  test('CA1 el carrusel del inicio muestra los logos', async ({ page }) => {
    await page.goto('/');
    await expectLogo(page.locator('article#enzona'));
    await expectLogo(page.locator('article#rueda-viva'));
  });

  test('CA2 las tarjetas sin logo mantienen la miniatura genérica', async ({ page }) => {
    await page.goto('/proyectos/');
    for (const id of sinLogo) {
      const card = page.locator(`article#${id}`);
      await expect(card.locator('[data-thumb]')).toBeAttached();
      await expect(card.locator('img')).toHaveCount(0);
    }
  });

  test('CA3 los logos se sirven optimizados', async ({ page }) => {
    await page.goto('/proyectos/');
    const src = await page.locator('article#centro-de-distribucion [data-logo] img').getAttribute('src');
    expect(src).toMatch(/^\/_astro\/.+\.webp$/);
  });

  for (const prefijo of ['', '/en']) {
    test(`CA4 ${prefijo}/proyectos/ sin errores de accesibilidad ni scroll horizontal a 360 px`, async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 740 });
      await page.goto(`${prefijo}/proyectos/`);
      await expectNoA11yViolations(page);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
    });
  }
});
