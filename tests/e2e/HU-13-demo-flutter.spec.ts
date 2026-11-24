import { expect, test } from '@playwright/test';
import { expectNoA11yViolations } from './a11y';

// HU-13 · Demo de Flutter Web (docs/historias/HU-13-demo-flutter.md)

const DEMO = '/demos/rueda-viva/';
const idiomas = [
  { prefijo: '', probar: 'Probar demo', titulo: 'Demo de Rueda Viva', completa: 'Abrir la demo a pantalla completa' },
  { prefijo: '/pt', probar: 'Testar demo', titulo: 'Demo do Rueda Viva', completa: 'Abrir a demo em tela cheia' },
  { prefijo: '/en', probar: 'Try the demo', titulo: 'Rueda Viva demo', completa: 'Open the demo full screen' },
] as const;

const esMovil = (name: string) => name === 'movil';

test.describe('HU-13 · Demo de Flutter Web', () => {
  test('CA1 la demo no se carga hasta pulsar «Probar demo»', async ({ page }, info) => {
    test.skip(esMovil(info.project.name), 'En móvil se abre a pantalla completa (CA3)');
    const pedidas: string[] = [];
    page.on('request', (r) => {
      if (new URL(r.url()).pathname.startsWith('/demos/')) pedidas.push(r.url());
    });
    await page.goto('/proyectos/rueda-viva/');
    await page.waitForLoadState('networkidle');
    expect(pedidas).toEqual([]);
    await expect(page.locator('iframe')).toHaveCount(0);

    await page.getByRole('link', { name: 'Probar demo' }).click();
    const iframe = page.locator('iframe');
    await expect(iframe).toHaveAttribute('src', DEMO);
    await expect(page).toHaveURL(/\/proyectos\/rueda-viva\/$/);
    // La app de Flutter arranca dentro del iframe.
    await expect(page.frameLocator('iframe').locator('flutter-view')).toBeAttached({ timeout: 30_000 });
  });

  for (const { prefijo, probar, titulo, completa } of idiomas) {
    test(`CA2 ${prefijo}/proyectos/rueda-viva/: la demo tiene título accesible y enlace a pantalla completa`, async ({
      page,
    }, info) => {
      test.skip(esMovil(info.project.name), 'En móvil no se incrusta');
      await page.goto(`${prefijo}/proyectos/rueda-viva/`);
      await expect(page.getByRole('link', { name: completa })).toHaveAttribute('href', DEMO);
      await page.getByRole('link', { name: probar }).click();
      await expect(page.locator('iframe')).toHaveAttribute('title', titulo);
      await expect(page.getByRole('link', { name: completa })).toBeVisible();
    });
  }

  test('CA3 en el móvil, «Probar demo» abre la demo a pantalla completa', async ({ page }, info) => {
    test.skip(!esMovil(info.project.name), 'Solo en móvil');
    await page.goto('/proyectos/rueda-viva/');
    await page.getByRole('link', { name: 'Probar demo' }).click();
    await expect(page).toHaveURL(new RegExp(`${DEMO}$`));
    await expect(page.locator('flutter-view')).toBeAttached({ timeout: 30_000 });
  });

  test('solo Rueda Viva tiene demo', async ({ page }) => {
    await page.goto('/proyectos/sca/');
    await expect(page.getByRole('link', { name: 'Probar demo' })).toHaveCount(0);
  });

  test('la demo no se indexa y está en español', async ({ request }) => {
    const html = await (await request.get(DEMO)).text();
    expect(html).toContain('<meta name="robots" content="noindex">');
    expect(html).toContain('<html lang="es">');
  });

  for (const path of ['/proyectos/rueda-viva/', '/en/proyectos/rueda-viva/']) {
    test(`DoD ${path} sin errores de accesibilidad ni scroll horizontal a 360 px`, async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 780 });
      await page.goto(path);
      await expectNoA11yViolations(page);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
    });
  }
});
