import { readdirSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { expectNoA11yViolations } from './a11y';

// HU-08 · Blog (docs/historias/HU-08-blog.md)

const idiomas = [
  { lang: 'es', prefijo: '', titulo: 'Blog', lectura: /\d+ min de lectura/, etiquetas: 'Etiquetas' },
  { lang: 'pt', prefijo: '/pt', titulo: 'Blog', lectura: /\d+ min de leitura/, etiquetas: 'Tags' },
  { lang: 'en', prefijo: '/en', titulo: 'Blog', lectura: /\d+ min read/, etiquetas: 'Tags' },
] as const;

/** Artículos que existen en cada idioma (uno por archivo en src/content/blog/<lang>/). */
const articulos = (lang: string) =>
  readdirSync(`src/content/blog/${lang}`)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''));

test.describe('HU-08 · Blog', () => {
  for (const { lang, prefijo, titulo, lectura, etiquetas } of idiomas) {
    test(`CA1 ${prefijo}/blog/ lista los artículos del más nuevo al más antiguo con fecha, lectura y etiquetas`, async ({
      page,
    }) => {
      await page.goto(`${prefijo}/blog/`);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(titulo);
      const items = page.getByRole('main').getByRole('article');
      await expect(items).toHaveCount(articulos(lang).length);
      expect(await items.count()).toBeGreaterThanOrEqual(4);
      const fechas: string[] = [];
      for (let i = 0; i < (await items.count()); i++) {
        const item = items.nth(i);
        await expect(item.getByRole('heading', { level: 2 }).getByRole('link')).toHaveAttribute(
          'href',
          new RegExp(`^${prefijo}/blog/[a-z0-9-]+/$`),
        );
        const fecha = await item.locator('time').getAttribute('datetime');
        expect(fecha).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        fechas.push(fecha!);
        await expect(item).toContainText(lectura);
        expect(await item.getByRole('list', { name: etiquetas }).getByRole('listitem').count()).toBeGreaterThan(0);
      }
      expect(fechas).toEqual([...fechas].sort().reverse());
    });
  }

  test('CA2 un artículo se lee con buena tipografía y el código tiene resaltado de sintaxis', async ({ page }) => {
    await page.goto('/blog/bloc-vs-cubit/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Bloc');
    const cuerpo = page.getByRole('main').locator('article .prose-caso');
    const estilo = await cuerpo.evaluate((el) => {
      const s = getComputedStyle(el);
      return { size: parseFloat(s.fontSize), line: parseFloat(s.lineHeight), width: el.getBoundingClientRect().width };
    });
    expect(estilo.size).toBeGreaterThanOrEqual(17);
    expect(estilo.line / estilo.size).toBeGreaterThanOrEqual(1.6);
    expect(estilo.width).toBeLessThanOrEqual(760);
    await expect(cuerpo.locator('h2').first()).toBeVisible();
    // Los párrafos van separados (regresión: un selector roto de HU-11 les quitó el margen).
    const margen = await cuerpo.locator('p').nth(1).evaluate((p) => parseFloat(getComputedStyle(p).marginTop));
    expect(margen).toBeGreaterThanOrEqual(16);
    // Shiki: bloque de Dart con colores por token en los dos temas.
    const codigo = cuerpo.locator('pre.astro-code[data-language="dart"]').first();
    await expect(codigo).toBeVisible();
    const colores = await codigo.locator('span[style]').evaluateAll((spans) =>
      new Set(spans.map((s) => getComputedStyle(s).color)).size,
    );
    expect(colores).toBeGreaterThan(2);
    await expect(page.getByRole('main')).toContainText(/\d+ min de lectura/);
    await expect(page.getByRole('main').locator('time')).toHaveAttribute('datetime', /^\d{4}-\d{2}-\d{2}$/);
  });

  test('CA2 el artículo tiene enlace de vuelta al blog, botón de contacto y datos estructurados', async ({ page }) => {
    await page.goto('/en/blog/repository-pattern/');
    await expect(page.getByRole('main').getByRole('link', { name: 'Back to the blog' })).toHaveAttribute('href', '/en/blog/');
    await expect(page.getByRole('main').getByRole('link', { name: 'Contact me' })).toHaveAttribute('href', '/en/contacto/');
    const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!);
    expect(ld['@type']).toBe('BlogPosting');
    expect(ld.inLanguage).toBe('en');
    expect(ld.author.name).toBe('Julian Gutierrez Garcia');
  });

  test('CA3 cada idioma solo lista sus artículos, y un slug que no existe en un idioma da 404', async ({ page, request }) => {
    for (const { lang, prefijo } of idiomas) {
      await page.goto(`${prefijo}/blog/`);
      const enlaces = await page
        .getByRole('main')
        .getByRole('article')
        .getByRole('heading', { level: 2 })
        .getByRole('link')
        .evaluateAll((as) => as.map((a) => a.getAttribute('href')));
      expect(enlaces.sort()).toEqual(articulos(lang).map((s) => `${prefijo}/blog/${s}/`).sort());
    }
    // El slug español no existe en inglés (allí el artículo tiene otro slug).
    expect((await request.get('/en/blog/patron-repository/')).status()).toBe(404);
  });

  for (const { lang, prefijo } of idiomas) {
    test(`CA4 hay un feed RSS en ${lang} con sus artículos`, async ({ page, request }) => {
      const res = await request.get(`${prefijo}/blog/rss.xml`);
      expect(res.status()).toBe(200);
      expect(res.headers()['content-type']).toMatch(/xml/);
      const xml = await res.text();
      expect(xml).toContain(`<language>${lang}</language>`);
      const items = xml.match(/<item>/g) ?? [];
      expect(items).toHaveLength(articulos(lang).length);
      for (const slug of articulos(lang)) expect(xml).toContain(`${prefijo}/blog/${slug}/</link>`);
      // Las páginas anuncian el feed de su idioma.
      await page.goto(`${prefijo}/blog/`);
      await expect(page.locator('link[rel="alternate"][type="application/rss+xml"]')).toHaveAttribute(
        'href',
        new RegExp(`${prefijo}/blog/rss.xml$`),
      );
    });
  }

  test('el cambio de idioma en un artículo lleva al mismo artículo traducido', async ({ page }) => {
    await page.goto('/blog/manejo-de-errores/');
    const alternos = await page
      .locator('link[rel="alternate"][hreflang]')
      .evaluateAll((ls) => ls.map((l) => [l.getAttribute('hreflang'), new URL(l.getAttribute('href')!).pathname]));
    expect(alternos).toContainEqual(['pt', '/pt/blog/tratamento-de-erros/']);
    expect(alternos).toContainEqual(['en', '/en/blog/error-handling/']);
    await page.getByRole('banner').getByRole('link', { name: 'English' }).click();
    await expect(page).toHaveURL(/\/en\/blog\/error-handling\/$/);
  });

  for (const path of ['/blog/', '/pt/blog/', '/blog/spec-driven-development/', '/en/blog/bloc-vs-cubit/']) {
    test(`DoD ${path} sin errores de accesibilidad ni scroll horizontal a 360 px`, async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 780 });
      await page.goto(path);
      await expectNoA11yViolations(page);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
    });
  }

  for (const tema of ['light', 'dark'] as const) {
    test(`DoD un artículo en modo ${tema} sin errores de contraste (también los comentarios del código)`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: tema });
      await page.goto('/blog/manejo-de-errores/');
      await expectNoA11yViolations(page);
    });
  }
});
