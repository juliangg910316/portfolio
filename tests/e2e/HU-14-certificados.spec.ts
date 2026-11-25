import { expect, test } from '@playwright/test';
import { expectNoA11yViolations } from './a11y';

// HU-14 · Ver los certificados (docs/historias/HU-14-certificados.md)

const idiomas = [
  { prefijo: '', ver: 'Ver certificado', cerrar: 'Cerrar', alt: 'Certificado de Flutter Experience' },
  { prefijo: '/pt', ver: 'Ver certificado', cerrar: 'Fechar', alt: 'Certificado de Flutter Experience' },
  { prefijo: '/en', ver: 'View certificate', cerrar: 'Close', alt: 'Flutter Experience certificate' },
] as const;

const IMAGENES = /\/_astro\/(flutter-experience|ias-\d|big-school|devtalles)[^/]*\.webp/;

test.describe('HU-14 · Ver los certificados', () => {
  for (const { prefijo, ver, cerrar, alt } of idiomas) {
    test(`CA1 ${prefijo || '/'}: al pulsar un certificado se abre la ventana con su nombre y la imagen`, async ({ page }) => {
      await page.goto(`${prefijo}/`);
      await page.getByRole('link', { name: `${ver}: Flutter Experience` }).click();
      const ventana = page.getByRole('dialog', { name: 'Flutter Experience' });
      await expect(ventana).toBeVisible();
      const imagen = ventana.getByRole('img', { name: alt });
      await expect(imagen).toBeVisible();
      await expect.poll(() => imagen.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
      await expect(ventana.getByRole('button', { name: cerrar })).toBeVisible();
    });
  }

  test('CA2 se cierra con Esc, con el botón y al pulsar fuera, y el foco vuelve al certificado', async ({ page }) => {
    await page.goto('/');
    const enlace = page.getByRole('link', { name: 'Ver certificado: Flutter Experience' });
    const ventana = page.getByRole('dialog', { name: 'Flutter Experience' });

    await enlace.click();
    await expect(ventana).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(ventana).toBeHidden();
    await expect(enlace).toBeFocused();

    await enlace.click();
    await ventana.getByRole('button', { name: 'Cerrar' }).click();
    await expect(ventana).toBeHidden();
    await expect(enlace).toBeFocused();

    await enlace.click();
    await expect(ventana).toBeVisible();
    await page.mouse.click(5, 5);
    await expect(ventana).toBeHidden();
    await expect(enlace).toBeFocused();
  });

  test('CA3 Academia das IAs muestra sus cuatro certificados con su título', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /^Ver certificado: IA aplicada al desarrollo/ }).click();
    const ventana = page.getByRole('dialog', { name: /IA aplicada al desarrollo/ });
    await expect(ventana.getByRole('img')).toHaveCount(4);
    for (const titulo of [
      'Fundamentos da IA para Desenvolvimento de Software',
      'Engenharia de Prompt & Contexto',
      'AI Dev Workflow & Automação',
      'Model Context Protocol na prática',
    ]) {
      await expect(ventana.getByText(titulo, { exact: true })).toBeVisible();
    }
  });

  test('CA4 un curso sin certificado disponible no es pulsable', async ({ page }) => {
    await page.goto('/');
    const lista = page.getByRole('list', { name: 'Certificados' });
    await expect(lista.getByRole('listitem').filter({ hasText: 'Domina Kotlin' })).toBeVisible();
    await expect(lista.getByRole('link', { name: /Domina Kotlin/ })).toHaveCount(0);
    await expect(lista.getByRole('link')).toHaveCount(4);
  });

  test('CA5 las imágenes no se descargan hasta abrir la ventana', async ({ page }) => {
    const pedidas: string[] = [];
    page.on('request', (r) => {
      if (IMAGENES.test(new URL(r.url()).pathname)) pedidas.push(r.url());
    });
    await page.goto('/');
    await page.getByRole('list', { name: 'Certificados' }).scrollIntoViewIfNeeded();
    await page.waitForLoadState('networkidle');
    expect(pedidas).toEqual([]);
    await page.getByRole('link', { name: 'Ver certificado: Flutter Experience' }).click();
    await expect.poll(() => pedidas.length).toBeGreaterThan(0);
  });

  test('CA5 sin JavaScript el certificado enlaza a su imagen', async ({ browser }) => {
    const contexto = await browser.newContext({ javaScriptEnabled: false });
    const page = await contexto.newPage();
    await page.goto('/');
    const href = await page.getByRole('link', { name: 'Ver certificado: Flutter Experience' }).getAttribute('href');
    expect(href).toMatch(IMAGENES);
    const respuesta = await page.request.get(href!);
    expect(respuesta.ok()).toBe(true);
    expect(respuesta.headers()['content-type']).toContain('image/webp');
    await contexto.close();
  });

  for (const { prefijo, ver } of idiomas) {
    test(`CA6 ${prefijo || '/'}: la ventana abierta no tiene errores de accesibilidad ni scroll a 360 px`, async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 740 });
      await page.goto(`${prefijo}/`);
      await page.getByRole('link', { name: new RegExp(`^${ver}: (IA|AI) ap`) }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await expectNoA11yViolations(page);
      const ancho = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(ancho).toBeLessThanOrEqual(360);
    });
  }
});
