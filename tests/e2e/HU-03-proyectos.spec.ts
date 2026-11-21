import { expect, test, type Page } from '@playwright/test';
import { expectNoA11yViolations } from './a11y';

// HU-03 · Listado de proyectos (docs/historias/HU-03-proyectos.md)

const destacados = [
  { nombre: 'ENZONA', slug: 'enzona' },
  { nombre: 'SCA', slug: 'sca' },
  { nombre: 'Rueda Viva', slug: 'rueda-viva' },
  { nombre: 'Studio Shaddai', slug: 'studio-shaddai' },
  { nombre: 'SuperPay23', slug: 'superpay23' },
  { nombre: 'Centro de Distribución', slug: 'centro-de-distribucion' },
];
const otros = ['Bowling App', 'DenunciApp', 'MiCerveza-Desafío', 'MeuBolso', 'Apps de CCONet'];
const internos = ['SuperPay23', 'Centro de Distribución', 'DenunciApp', 'MiCerveza-Desafío'];
const porFiltro: Record<string, string[]> = {
  Empleo: ['ENZONA', 'SuperPay23', 'Centro de Distribución', 'Bowling App', 'DenunciApp', 'MiCerveza-Desafío', 'Apps de CCONet'],
  Cliente: ['SCA', 'Studio Shaddai', 'MeuBolso'],
  Personal: ['Rueda Viva'],
};
const todos = [...destacados.map((d) => d.nombre), ...otros];
const tiendas = /play\.google\.com|apps\.apple\.com|apklis\.cu/;

const seccion = (page: Page, nombre: string) => page.getByRole('region', { name: nombre, exact: true });
const nombresVisibles = (page: Page) => page.locator('article h3:visible').allInnerTexts();
const tarjeta = (page: Page, nombre: string) =>
  page.getByRole('article').filter({ has: page.getByRole('heading', { level: 3, name: nombre, exact: true }) });

test.describe('HU-03 · Proyectos', () => {
  test('CA1 /proyectos/ muestra primero los 6 destacados', async ({ page }) => {
    await page.goto('/proyectos/');
    const s = seccion(page, 'Destacados');
    await expect(s.getByRole('heading', { level: 3 })).toHaveText(destacados.map((d) => d.nombre));
  });

  test('CA2 después aparece "Otros proyectos"', async ({ page }) => {
    await page.goto('/proyectos/');
    const s = seccion(page, 'Otros proyectos');
    await expect(s.getByRole('heading', { level: 3 })).toHaveText(otros);
    const yDestacados = (await seccion(page, 'Destacados').boundingBox())!.y;
    const yOtros = (await s.boundingBox())!.y;
    expect(yOtros).toBeGreaterThan(yDestacados);
  });

  test('CA3 cada filtro muestra solo los proyectos de ese tipo', async ({ page }) => {
    await page.goto('/proyectos/');
    const grupo = page.getByRole('group', { name: 'Filtrar por tipo' });
    await expect(grupo.getByRole('radio', { name: 'Todos' })).toBeChecked();
    expect(await nombresVisibles(page)).toEqual(todos);

    for (const [filtro, esperados] of Object.entries(porFiltro)) {
      await grupo.getByRole('radio', { name: filtro }).check();
      expect((await nombresVisibles(page)).sort()).toEqual([...esperados].sort());
    }
    // Con "Personal" no queda ningún "otro" proyecto: la sección se oculta.
    await expect(seccion(page, 'Otros proyectos')).toBeHidden();

    await grupo.getByRole('radio', { name: 'Todos' }).check();
    expect(await nombresVisibles(page)).toEqual(todos);
  });

  test.describe('sin JavaScript', () => {
    test.use({ javaScriptEnabled: false });
    test('CA3 sin JavaScript se ven todos los proyectos', async ({ page }) => {
      await page.goto('/proyectos/');
      expect(await nombresVisibles(page)).toEqual(todos);
    });
  });

  test('CA4 los proyectos internos muestran "App interna" y ninguna tarjeta enlaza a tiendas', async ({ page }) => {
    await page.goto('/proyectos/');
    for (const nombre of todos) {
      const t = tarjeta(page, nombre);
      if (internos.includes(nombre)) await expect(t).toContainText('App interna');
      else await expect(t).not.toContainText('App interna');
      for (const href of await t.getByRole('link').evaluateAll((as) => as.map((a) => a.getAttribute('href')))) {
        expect(href).not.toMatch(tiendas);
      }
    }
  });

  test('CA5 el carrusel del inicio muestra los 6 destacados con flechas accesibles', async ({ page }) => {
    await page.goto('/');
    const s = seccion(page, 'Proyectos destacados');
    await expect(s.getByRole('heading', { level: 3 })).toHaveText(destacados.map((d) => d.nombre));
    for (const { nombre, slug } of destacados) {
      await expect(s.getByRole('link', { name: nombre, exact: true })).toHaveAttribute('href', `/proyectos/${slug}/`);
    }
    const anterior = s.getByRole('button', { name: 'Proyecto anterior' });
    const siguiente = s.getByRole('button', { name: 'Proyecto siguiente' });
    await expect(anterior).toBeVisible();
    await expect(siguiente).toBeVisible();

    const carril = s.locator('#carrusel-proyectos');
    await siguiente.click();
    await expect.poll(() => carril.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
    await anterior.click();
    await expect.poll(() => carril.evaluate((el) => el.scrollLeft)).toBe(0);
    await expect(s.getByRole('link', { name: 'Ver todos los proyectos' })).toHaveAttribute('href', '/proyectos/');
  });

  test('CA6 cada tarjeta muestra nombre, tipo y stack; los destacados enlazan a su caso de estudio', async ({ page }) => {
    await page.goto('/proyectos/');
    for (const nombre of todos) {
      const t = tarjeta(page, nombre);
      await expect(t.getByTestId('tipo')).not.toBeEmpty();
      expect(await t.getByRole('list', { name: 'Tecnologías' }).getByRole('listitem').count()).toBeGreaterThan(0);
    }
    for (const { nombre, slug } of destacados) {
      await expect(tarjeta(page, nombre).getByRole('link', { name: nombre, exact: true })).toHaveAttribute(
        'href',
        `/proyectos/${slug}/`,
      );
    }
    for (const nombre of otros) {
      await expect(tarjeta(page, nombre).getByRole('link')).toHaveCount(0);
    }
  });

  for (const { path, destacadosTitulo, otrosTitulo, filtro, cd, internaTexto } of [
    { path: '/pt/proyectos/', destacadosTitulo: 'Destaques', otrosTitulo: 'Outros projetos', filtro: 'Filtrar por tipo', cd: 'Centro de Distribuição', internaTexto: 'App interno' },
    { path: '/en/proyectos/', destacadosTitulo: 'Featured', otrosTitulo: 'Other projects', filtro: 'Filter by type', cd: 'Distribution Center', internaTexto: 'Internal app' },
  ]) {
    test(`i18n ${path} muestra el listado traducido`, async ({ page }) => {
      await page.goto(path);
      await expect(seccion(page, destacadosTitulo).getByRole('heading', { level: 3 })).toHaveCount(6);
      await expect(seccion(page, otrosTitulo).getByRole('heading', { level: 3 })).toHaveCount(5);
      await expect(page.getByRole('group', { name: filtro })).toBeVisible();
      await expect(tarjeta(page, cd)).toContainText(internaTexto);
      const prefijo = path.slice(0, 3);
      await expect(tarjeta(page, 'ENZONA').getByRole('link', { name: 'ENZONA' })).toHaveAttribute(
        'href',
        `${prefijo}/proyectos/enzona/`,
      );
    });
  }

  for (const path of ['/', '/proyectos/', '/pt/proyectos/', '/en/']) {
    test(`DoD ${path} sin "Lanetalk" y sin errores de accesibilidad`, async ({ page }) => {
      await page.goto(path);
      expect(await page.content()).not.toMatch(/lanetalk/i);
      await expectNoA11yViolations(page);
    });
  }
});
