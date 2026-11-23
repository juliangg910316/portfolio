import { expect, test, type Page } from '@playwright/test';
import { expectNoA11yViolations } from './a11y';

// HU-11 · Modo claro y oscuro (docs/historias/HU-11-tema.md)

const FONDO = { oscuro: 'rgb(6, 17, 31)', claro: 'rgb(242, 247, 252)' } as const;
const etiquetas = {
  es: { claro: 'Activar modo claro', oscuro: 'Activar modo oscuro' },
  pt: { claro: 'Ativar modo claro', oscuro: 'Ativar modo escuro' },
  en: { claro: 'Switch to light mode', oscuro: 'Switch to dark mode' },
} as const;

const tema = (page: Page) => page.locator('html').getAttribute('data-theme');
const fondo = (page: Page) => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
const boton = (page: Page) => page.getByRole('banner').getByRole('button', { name: /modo|mode/ });

test.describe('HU-11 · Modo claro y oscuro', () => {
  for (const [sistema, esperado] of [
    ['light', 'claro'],
    ['dark', 'oscuro'],
  ] as const) {
    test(`CA1 en la primera visita, con el sistema en "${sistema}", se usa el tema ${esperado}`, async ({ browser }) => {
      const context = await browser.newContext({ colorScheme: sistema });
      const page = await context.newPage();
      await page.goto('/');
      expect(await tema(page)).toBe(esperado === 'claro' ? 'light' : 'dark');
      expect(await fondo(page)).toBe(FONDO[esperado]);
      await context.close();
    });
  }

  // Los navegadores actuales tratan «sin preferencia» como claro (Chromium emula `no-preference` así):
  // el «si no hay, oscuro» se aplica cuando el navegador no informa de ninguna preferencia.
  test('CA1 si el navegador no informa de la preferencia del sistema, se usa el tema oscuro', async ({ page }) => {
    await page.addInitScript(() => {
      // @ts-expect-error navegador antiguo sin matchMedia
      delete window.matchMedia;
    });
    await page.goto('/');
    expect(await tema(page)).toBe('dark');
    expect(await fondo(page)).toBe(FONDO.oscuro);
    await boton(page).click();
    expect(await tema(page)).toBe('light');
  });

  test('CA1 sin JavaScript también se respeta la preferencia del sistema y no se muestra el botón', async ({
    browser,
  }) => {
    for (const [sistema, esperado] of [
      ['light', 'claro'],
      ['dark', 'oscuro'],
    ] as const) {
      const context = await browser.newContext({ colorScheme: sistema, javaScriptEnabled: false });
      const page = await context.newPage();
      await page.goto('/');
      expect(await fondo(page)).toBe(FONDO[esperado]);
      await expect(page.locator('#tema')).toBeHidden();
      await context.close();
    }
  });

  test('CA2 el botón cambia el tema y su aria-label describe la acción siguiente', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    const btn = boton(page);
    await expect(btn).toHaveAccessibleName(etiquetas.es.claro);
    await btn.click();
    expect(await tema(page)).toBe('light');
    expect(await fondo(page)).toBe(FONDO.claro);
    await expect(btn).toHaveAccessibleName(etiquetas.es.oscuro);
    await btn.click();
    expect(await tema(page)).toBe('dark');
    await expect(btn).toHaveAccessibleName(etiquetas.es.claro);
  });

  for (const lang of ['pt', 'en'] as const) {
    test(`CA2 el aria-label del botón está traducido en ${lang}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'light' });
      await page.goto(`/${lang}/`);
      await expect(boton(page)).toHaveAccessibleName(etiquetas[lang].oscuro);
      await boton(page).click();
      await expect(boton(page)).toHaveAccessibleName(etiquetas[lang].claro);
    });
  }

  test('CA3 el tema elegido se mantiene al recargar y al cambiar de página, aunque el sistema diga otra cosa', async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    await boton(page).click();
    await page.reload();
    expect(await tema(page)).toBe('light');
    await page.getByRole('banner').getByRole('link', { name: 'Proyectos' }).click();
    await expect(page).toHaveURL(/\/proyectos\/$/);
    expect(await tema(page)).toBe('light');
    expect(await fondo(page)).toBe(FONDO.claro);
    // También al cambiar de idioma.
    await page.getByRole('banner').getByRole('link', { name: 'English' }).click();
    expect(await tema(page)).toBe('light');
  });

  test('CA3 sin parpadeo: el tema se aplica antes de pintar la página', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('tema', 'light'));
    await page.emulateMedia({ colorScheme: 'dark' });
    // Se lee el tema en cuanto el <body> existe, antes de cargar CSS externo o scripts de módulo.
    const primerPintado: string[] = [];
    await page.exposeFunction('registrar', (t: string) => primerPintado.push(t));
    await page.addInitScript(() => {
      new MutationObserver((_, obs) => {
        if (document.body) {
          (window as unknown as { registrar: (t: string) => void }).registrar(
            document.documentElement.dataset.theme ?? 'ninguno',
          );
          obs.disconnect();
        }
      }).observe(document, { childList: true, subtree: true });
    });
    await page.goto('/experiencia/');
    await expect.poll(() => primerPintado).toEqual(['light']);
    // El script del tema va en línea, bloqueante, dentro de <head>.
    const script = page.locator('head script[data-tema]');
    await expect(script).toHaveCount(1);
    expect(await script.getAttribute('type')).toBeNull();
    expect(await script.getAttribute('src')).toBeNull();
  });

  test('CA3 si no hay almacenamiento disponible, se usa el sistema y el botón sigue funcionando', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', {
        get() {
          throw new Error('bloqueado');
        },
      });
    });
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    expect(await tema(page)).toBe('light');
    await boton(page).click();
    expect(await tema(page)).toBe('dark');
  });

  test('el tema sigue al sistema si cambia mientras no se ha elegido ninguno', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    await page.emulateMedia({ colorScheme: 'light' });
    await expect.poll(() => tema(page)).toBe('light');
    await expect(boton(page)).toHaveAccessibleName(etiquetas.es.oscuro);
  });

  for (const path of ['/', '/proyectos/', '/proyectos/sca/', '/experiencia/', '/contacto/', '/pt/', '/en/no-existe/']) {
    test(`CA4 ${path} en modo claro no tiene errores de contraste ni de accesibilidad`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'light' });
      await page.goto(path);
      expect(await tema(page)).toBe('light');
      await expectNoA11yViolations(page);
    });
  }

  test('CA4 los errores del formulario de contacto se leen bien en modo claro', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/contacto/');
    await page.getByRole('main').getByRole('button', { name: 'Enviar mensaje' }).click();
    await page.goto('/contacto/#error-envio');
    await expectNoA11yViolations(page);
  });

  test('DoD el botón de tema cabe a 360 px y tiene objetivo táctil de 44 px', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await page.goto('/');
    const caja = await boton(page).boundingBox();
    expect(caja!.width).toBeGreaterThanOrEqual(44);
    expect(caja!.height).toBeGreaterThanOrEqual(44);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
  });
});
