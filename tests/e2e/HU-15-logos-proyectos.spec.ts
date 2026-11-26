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

  test('CA5 el icono está a la izquierda del nombre y no hay franja de color arriba', async ({ page }) => {
    await page.goto('/proyectos/');
    for (const id of [...conLogo, ...sinLogo]) {
      const card = page.locator(`article#${id}`);
      const icono = card.locator('[data-logo], [data-thumb]');
      const titulo = card.getByRole('heading', { level: 3 });
      const [i, t, c] = await Promise.all([icono.boundingBox(), titulo.boundingBox(), card.boundingBox()]);
      expect(i!.x + i!.width).toBeLessThanOrEqual(t!.x);
      // El título empieza a la altura del icono (misma fila).
      expect(t!.y).toBeGreaterThanOrEqual(i!.y - 2);
      expect(t!.y).toBeLessThan(i!.y + i!.height);
      // El icono está arriba de la tarjeta, sin franja de color encima.
      expect(i!.y - c!.y).toBeLessThan(30);
      expect(i!.height).toBeLessThanOrEqual(64);
    }
  });

  test('CA6 las etiquetas van en el cuerpo y no tapan el icono', async ({ page }) => {
    await page.goto('/proyectos/');
    for (const [id, etiqueta] of [
      ['superpay23', 'App interna'],
      ['studio-shaddai', 'En desarrollo'],
      ['sca', 'Full-stack'],
    ] as const) {
      const card = page.locator(`article#${id}`);
      const [e, i] = await Promise.all([
        card.getByText(etiqueta, { exact: true }).boundingBox(),
        card.locator('[data-logo], [data-thumb]').boundingBox(),
      ]);
      const solapa = e!.x < i!.x + i!.width && e!.x + e!.width > i!.x && e!.y < i!.y + i!.height && e!.y + e!.height > i!.y;
      expect(solapa, `${etiqueta} tapa el icono de ${id}`).toBe(false);
    }
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
