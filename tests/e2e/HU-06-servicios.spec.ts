import { expect, test } from '@playwright/test';
import { expectNoA11yViolations } from './a11y';

// HU-06 · Servicios (docs/historias/HU-06-servicios.md)

const idiomas = [
  {
    prefijo: '',
    titulo: 'Servicios',
    menu: 'Servicios',
    servicios: [
      'Apps Flutter de principio a fin',
      'MVP para startups',
      'Consultoría de arquitectura',
      'Migración a Flutter',
    ],
    incluye: 'Qué incluye',
    proceso: 'Cómo trabajamos',
    presupuesto: 'Pedir presupuesto',
  },
  {
    prefijo: '/pt',
    titulo: 'Serviços',
    menu: 'Serviços',
    servicios: [
      'Apps Flutter de ponta a ponta',
      'MVP para startups',
      'Consultoria de arquitetura',
      'Migração para Flutter',
    ],
    incluye: 'O que inclui',
    proceso: 'Como trabalhamos',
    presupuesto: 'Pedir orçamento',
  },
  {
    prefijo: '/en',
    titulo: 'Services',
    menu: 'Services',
    servicios: ['End-to-end Flutter apps', 'MVPs for startups', 'Architecture consulting', 'Migration to Flutter'],
    incluye: "What's included",
    proceso: 'How we work',
    presupuesto: 'Request a quote',
  },
] as const;

/** Ejemplo real de cada servicio, en el mismo orden. */
const ejemplos = [
  { nombre: 'SCA', ruta: '/proyectos/sca/' },
  { nombre: 'Studio Shaddai', ruta: '/proyectos/studio-shaddai/' },
  { nombre: 'SuperPay23', ruta: '/proyectos/superpay23/' },
  { nombre: 'CCONet', ruta: '/proyectos/#cconet' },
];

test.describe('HU-06 · Servicios', () => {
  for (const { prefijo, titulo, menu, servicios } of idiomas) {
    test(`CA1 ${prefijo}/servicios/ muestra los 4 servicios y está en el menú`, async ({ page }) => {
      await page.goto(`${prefijo}/`);
      await page.getByRole('navigation').first().getByRole('link', { name: menu, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`${prefijo}/servicios/$`));
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(titulo);
      const lista = page.getByRole('list', { name: titulo });
      const items = lista.locator(':scope > li');
      await expect(items).toHaveCount(servicios.length);
      for (let i = 0; i < servicios.length; i++) {
        await expect(items.nth(i).getByRole('heading', { level: 2 })).toHaveText(servicios[i]!);
      }
      await expect(page.getByRole('navigation').first().getByRole('link', { name: menu, exact: true })).toHaveAttribute(
        'aria-current',
        'page',
      );
    });
  }

  for (const { prefijo, titulo, incluye } of idiomas) {
    test(`CA2 ${prefijo}/servicios/ cada servicio dice qué incluye y enlaza un proyecto real`, async ({ page }) => {
      await page.goto(`${prefijo}/servicios/`);
      const items = page.getByRole('list', { name: titulo }).locator(':scope > li');
      for (let i = 0; i < ejemplos.length; i++) {
        const item = items.nth(i);
        const lista = item.getByRole('list', { name: incluye });
        expect(await lista.getByRole('listitem').count()).toBeGreaterThanOrEqual(3);
        const enlace = item.getByRole('link', { name: new RegExp(ejemplos[i]!.nombre) });
        await expect(enlace).toHaveAttribute('href', `${prefijo}${ejemplos[i]!.ruta}`);
      }
    });
  }

  test('CA2 los enlaces de ejemplo llevan a páginas que existen (y la tarjeta de CCONet tiene ancla)', async ({
    page,
    request,
  }) => {
    for (const { ruta } of ejemplos) {
      const [path, ancla] = ruta.split('#');
      expect((await request.get(path!)).status(), ruta).toBe(200);
      if (ancla) {
        await page.goto(ruta);
        await expect(page.locator(`#${ancla}`)).toBeInViewport();
        await expect(page.locator(`#${ancla}`)).toContainText('Flutter');
      }
    }
  });

  for (const { prefijo, proceso, presupuesto } of idiomas) {
    test(`CA3 ${prefijo}/servicios/ muestra el proceso por pasos y un botón de presupuesto a contacto`, async ({
      page,
    }) => {
      await page.goto(`${prefijo}/servicios/`);
      const seccion = page.getByRole('region', { name: proceso });
      const pasos = seccion.getByRole('list').getByRole('listitem');
      expect(await pasos.count()).toBeGreaterThanOrEqual(4);
      await expect(seccion.getByRole('list')).toHaveJSProperty('tagName', 'OL');
      const boton = page.getByRole('main').getByRole('link', { name: presupuesto });
      await expect(boton).toHaveAttribute('href', `${prefijo}/contacto/?motivo=proyecto`);
      await boton.click();
      await expect(page).toHaveURL(new RegExp(`${prefijo}/contacto/\\?motivo=proyecto$`));
      // El formulario llega con el motivo «proyecto» elegido.
      await expect(page.getByRole('main').locator('select[name="reason"]')).toHaveValue('proyecto');
    });
  }

  test('sin precios (decisión pendiente)', async ({ page }) => {
    await page.goto('/servicios/');
    await expect(page.getByRole('main')).not.toContainText(/[$€]|R\$|USD|BRL/);
  });

  test('un motivo desconocido en la URL de contacto se ignora', async ({ page }) => {
    await page.goto('/contacto/?motivo=hackeo');
    await expect(page.getByRole('main').locator('select[name="reason"]')).toHaveValue('');
  });

  for (const path of ['/servicios/', '/pt/servicios/', '/en/servicios/']) {
    test(`DoD ${path} sin errores de accesibilidad ni scroll horizontal a 360 px`, async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 780 });
      await page.goto(path);
      await expectNoA11yViolations(page);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
    });
  }

  test('DoD /servicios/ en modo claro sin errores de accesibilidad', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/servicios/');
    await expectNoA11yViolations(page);
  });
});
