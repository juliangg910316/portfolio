import { expect, test, type Page } from '@playwright/test';
import { expectNoA11yViolations } from './a11y';

// HU-04 · Caso de estudio (docs/historias/HU-04-caso-de-estudio.md)

const casos = [
  { slug: 'enzona', nombre: 'ENZONA' },
  { slug: 'sca', nombre: 'SCA' },
  { slug: 'rueda-viva', nombre: 'Rueda Viva' },
  { slug: 'studio-shaddai', nombre: 'Studio Shaddai' },
  { slug: 'superpay23', nombre: 'SuperPay23' },
  { slug: 'centro-de-distribucion', nombre: 'Centro de Distribución' },
];

const secciones = {
  es: ['Contexto', 'Mi rol', 'Stack y arquitectura', 'Decisiones técnicas', 'Retos', 'Resultado'],
  pt: ['Contexto', 'Meu papel', 'Stack e arquitetura', 'Decisões técnicas', 'Desafios', 'Resultado'],
  en: ['Context', 'My role', 'Stack and architecture', 'Technical decisions', 'Challenges', 'Outcome'],
};

const enlacesExternos: Record<string, string[]> = {
  enzona: ['https://www.apklis.cu/application/cu.xetid.apk.enzona'],
  'rueda-viva': ['https://github.com/juliangg910316/SpinStreak'],
  'studio-shaddai': ['https://dshaddai.com', 'https://github.com/juliangg910316/shaddai-app'],
};
const tiendas = /play\.google\.com|apps\.apple\.com|apklis\.cu/;

const articulo = (page: Page) => page.getByRole('article');
const h2 = (page: Page) => articulo(page).getByRole('heading', { level: 2 });

test.describe('HU-04 · Caso de estudio', () => {
  test('CA1 desde /proyectos/ al pulsar un destacado voy a su caso de estudio', async ({ page }) => {
    await page.goto('/proyectos/');
    await page.getByRole('link', { name: 'Rueda Viva', exact: true }).click();
    await expect(page).toHaveURL(/\/proyectos\/rueda-viva\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Rueda Viva');
  });

  for (const { slug, nombre } of casos) {
    test(`CA2 /proyectos/${slug}/ tiene las 6 secciones`, async ({ page }) => {
      const res = await page.goto(`/proyectos/${slug}/`);
      expect(res?.status()).toBe(200);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(nombre);
      await expect(h2(page)).toHaveText(secciones.es);
    });
  }

  for (const [lang, titulos] of [['pt', secciones.pt], ['en', secciones.en]] as const) {
    test(`CA2 /${lang}/proyectos/sca/ tiene las 6 secciones traducidas`, async ({ page }) => {
      await page.goto(`/${lang}/proyectos/sca/`);
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
      await expect(h2(page)).toHaveText(titulos);
    });
  }

  test('CA3 los enlaces de repo, web o tienda se muestran como enlaces externos', async ({ page }) => {
    for (const [slug, urls] of Object.entries(enlacesExternos)) {
      await page.goto(`/proyectos/${slug}/`);
      const enlaces = page.getByRole('list', { name: 'Enlaces del proyecto' }).getByRole('link');
      await expect(enlaces).toHaveCount(urls.length);
      for (const url of urls) {
        const enlace = enlaces.and(page.locator(`[href="${url}"]`));
        await expect(enlace).toHaveAttribute('target', '_blank');
        await expect(enlace).toHaveAttribute('rel', /noopener/);
        await expect(enlace).toContainText('se abre en una pestaña nueva');
      }
    }
  });

  for (const slug of ['superpay23', 'centro-de-distribucion']) {
    test(`CA4 /proyectos/${slug}/ es interno: "App interna" y ningún enlace a tiendas`, async ({ page }) => {
      await page.goto(`/proyectos/${slug}/`);
      await expect(page.getByRole('main')).toContainText('App interna');
      await expect(page.getByRole('list', { name: 'Enlaces del proyecto' })).toHaveCount(0);
      const hrefs = await page.locator('a[href]').evaluateAll((as) => as.map((a) => a.getAttribute('href') ?? ''));
      for (const href of hrefs) expect(href).not.toMatch(tiendas);
    });
  }

  test('CA5 al final hay enlaces al proyecto anterior y al siguiente, y un botón de contacto', async ({ page }) => {
    const esperado = [
      { slug: 'rueda-viva', anterior: 'sca', siguiente: 'studio-shaddai' },
      { slug: 'enzona', anterior: 'centro-de-distribucion', siguiente: 'sca' },
      { slug: 'centro-de-distribucion', anterior: 'superpay23', siguiente: 'enzona' },
    ];
    for (const { slug, anterior, siguiente } of esperado) {
      await page.goto(`/proyectos/${slug}/`);
      const nav = page.getByRole('navigation', { name: 'Más proyectos' });
      await expect(nav.getByRole('link', { name: /Proyecto anterior/ })).toHaveAttribute('href', `/proyectos/${anterior}/`);
      await expect(nav.getByRole('link', { name: /Proyecto siguiente/ })).toHaveAttribute('href', `/proyectos/${siguiente}/`);
      await expect(page.getByRole('main').getByRole('link', { name: 'Contáctame' })).toHaveAttribute('href', '/contacto/');
    }
    await page.goto('/en/proyectos/rueda-viva/');
    const nav = page.getByRole('navigation', { name: 'More projects' });
    await expect(nav.getByRole('link', { name: /Next project/ })).toHaveAttribute('href', '/en/proyectos/studio-shaddai/');
    await expect(page.getByRole('main').getByRole('link', { name: 'Contact me' })).toHaveAttribute('href', '/en/contacto/');
  });

  for (const path of ['/proyectos/no-existe/', '/pt/proyectos/no-existe/']) {
    test(`CA6 ${path} responde con la página 404`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(404);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Página no encontrada|Página não encontrada/);
    });
  }

  for (const path of ['/proyectos/rueda-viva/', '/proyectos/superpay23/', '/pt/proyectos/enzona/', '/en/proyectos/studio-shaddai/']) {
    test(`DoD ${path} sin errores de accesibilidad ni scroll horizontal a 360 px`, async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 780 });
      await page.goto(path);
      await expectNoA11yViolations(page);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
      expect(await page.content()).not.toMatch(/lanetalk/i);
    });
  }
});
