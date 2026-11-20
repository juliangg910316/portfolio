import { expect, test } from '@playwright/test';
import { expectNoA11yViolations } from './a11y';

// Tests de la base del proyecto (no pertenecen a ninguna historia).
const rutas = [
  { path: '/', lang: 'es' },
  { path: '/pt/', lang: 'pt' },
  { path: '/en/', lang: 'en' },
];

for (const { path, lang } of rutas) {
  test(`${path} responde y declara lang="${lang}"`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', lang);
  });
}

test('el inicio no tiene errores de accesibilidad', async ({ page }) => {
  await page.goto('/');
  await expectNoA11yViolations(page);
});
