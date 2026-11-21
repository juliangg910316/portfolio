import { expect, test } from '@playwright/test';
import { languages, ui, type Lang, type UiKey } from '../../src/i18n/ui';
import { expectNoA11yViolations } from './a11y';

// HU-12 · SEO y vista previa al compartir (docs/historias/HU-12-seo.md)

const SITE = 'https://juliangg-portfolio.pages.dev';
const langs = Object.keys(languages) as Lang[];
const enIdioma = (base: string, lang: Lang) => (lang === 'es' ? base : `/${lang}${base}`);

/** Páginas publicadas y la clave de su descripción. */
const paginas = langs.flatMap((lang) => [
  { path: enIdioma('/', lang), base: '/', lang, descripcion: 'site.description' as UiKey },
  { path: enIdioma('/proyectos/', lang), base: '/proyectos/', lang, descripcion: 'projects.lead' as UiKey },
]);

const ogLocale: Record<Lang, string> = { es: 'es_ES', pt: 'pt_BR', en: 'en_US' };

const meta = (atributo: 'name' | 'property', valor: string) => `meta[${atributo}="${valor}"]`;

/** Ancho y alto de un PNG (cabecera IHDR). */
function tamañoPng(buffer: Buffer) {
  expect(buffer.subarray(1, 4).toString()).toBe('PNG');
  return { ancho: buffer.readUInt32BE(16), alto: buffer.readUInt32BE(20) };
}

test.describe('HU-12 · SEO', () => {
  test('CA1 cada página tiene <title> y description propios, en su idioma', async ({ page }) => {
    const titulos = new Set<string>();
    for (const { path, lang, descripcion } of paginas) {
      await page.goto(path);
      const titulo = await page.title();
      expect(titulo.length, path).toBeGreaterThan(10);
      titulos.add(`${lang}:${titulo}`);
      await expect(page.locator(meta('name', 'description'))).toHaveAttribute('content', ui[lang][descripcion]);
    }
    expect(titulos.size, 'títulos repetidos dentro de un idioma').toBe(paginas.length);
  });

  for (const { path, lang } of paginas) {
    test(`CA2 ${path} tiene Open Graph y Twitter Card con imagen 1200×630`, async ({ page, request }) => {
      await page.goto(path);
      const titulo = await page.title();
      const descripcion = await page.locator(meta('name', 'description')).getAttribute('content');
      const imagen = `${SITE}/og/${lang}.png`;

      await expect(page.locator(meta('property', 'og:type'))).toHaveAttribute('content', 'website');
      await expect(page.locator(meta('property', 'og:site_name'))).toHaveAttribute('content', 'Julian Gutierrez');
      await expect(page.locator(meta('property', 'og:title'))).toHaveAttribute('content', titulo);
      await expect(page.locator(meta('property', 'og:description'))).toHaveAttribute('content', descripcion!);
      await expect(page.locator(meta('property', 'og:url'))).toHaveAttribute('content', SITE + path);
      await expect(page.locator(meta('property', 'og:locale'))).toHaveAttribute('content', ogLocale[lang]);
      await expect(page.locator(meta('property', 'og:locale:alternate'))).toHaveCount(2);
      await expect(page.locator(meta('property', 'og:image'))).toHaveAttribute('content', imagen);
      await expect(page.locator(meta('property', 'og:image:width'))).toHaveAttribute('content', '1200');
      await expect(page.locator(meta('property', 'og:image:height'))).toHaveAttribute('content', '630');
      await expect(page.locator(meta('property', 'og:image:alt'))).not.toHaveAttribute('content', '');

      await expect(page.locator(meta('name', 'twitter:card'))).toHaveAttribute('content', 'summary_large_image');
      await expect(page.locator(meta('name', 'twitter:title'))).toHaveAttribute('content', titulo);
      await expect(page.locator(meta('name', 'twitter:description'))).toHaveAttribute('content', descripcion!);
      await expect(page.locator(meta('name', 'twitter:image'))).toHaveAttribute('content', imagen);

      const res = await request.get(`/og/${lang}.png`);
      expect(res.status()).toBe(200);
      expect(tamañoPng(await res.body())).toEqual({ ancho: 1200, alto: 630 });
    });
  }

  test('CA3 existen /sitemap-index.xml (con los 3 idiomas) y /robots.txt', async ({ request }) => {
    const indice = await request.get('/sitemap-index.xml');
    expect(indice.status()).toBe(200);
    const sitemaps = [...(await indice.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]!);
    expect(sitemaps.length).toBeGreaterThan(0);

    let urls = '';
    for (const loc of sitemaps) {
      const res = await request.get(new URL(loc).pathname);
      expect(res.status()).toBe(200);
      urls += await res.text();
    }
    for (const { path } of paginas) expect(urls).toContain(`<loc>${SITE}${path}</loc>`);
    for (const l of langs) expect(urls).toContain(`hreflang="${l}"`);
    expect(urls).not.toContain('404');

    const robots = await request.get('/robots.txt');
    expect(robots.status()).toBe(200);
    const texto = await robots.text();
    expect(texto).toMatch(/User-agent: \*/);
    expect(texto).toContain(`Sitemap: ${SITE}/sitemap-index.xml`);
  });

  test('CA4 cada página tiene canonical y hreflang (con x-default)', async ({ page }) => {
    for (const { path, base } of paginas) {
      await page.goto(path);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', SITE + path);
      for (const l of langs) {
        await expect(page.locator(`link[rel="alternate"][hreflang="${l}"]`)).toHaveAttribute('href', SITE + enIdioma(base, l));
      }
      await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute('href', SITE + base);
    }
  });

  for (const lang of langs) {
    test(`CA5 el inicio en ${lang} incluye JSON-LD de tipo Person`, async ({ page }) => {
      await page.goto(enIdioma('/', lang));
      const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
      const datos = bloques.map((b) => JSON.parse(b));
      const persona = datos.find((d) => d['@type'] === 'Person');
      expect(persona).toBeDefined();
      expect(persona['@context']).toBe('https://schema.org');
      expect(persona.name).toBe('Julian Gutierrez');
      expect(persona.jobTitle).toBe('Mobile Tech Lead');
      expect(persona.url).toBe(SITE + enIdioma('/', lang));
      expect(persona.sameAs).toEqual(
        expect.arrayContaining(['https://www.linkedin.com/in/juliangutierrez9103', 'https://github.com/juliangg910316']),
      );
      expect(JSON.stringify(persona)).not.toContain('@gmail');
    });
  }

  for (const lang of langs) {
    test(`CA6 una ruta inexistente en ${lang} responde 404 con una página propia`, async ({ page }) => {
      const res = await page.goto(enIdioma('/no-existe/', lang));
      expect(res?.status()).toBe(404);
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(ui[lang]['notfound.title']);
      await expect(page.locator(meta('name', 'robots'))).toHaveAttribute('content', 'noindex');
      await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);

      const volver = page.getByRole('main').getByRole('link', { name: ui[lang]['notfound.home'] });
      await expect(volver).toHaveAttribute('href', enIdioma('/', lang));

      // El selector de idioma lleva al inicio de cada idioma, no a una ruta 404.
      const selector = page.getByRole('navigation', { name: ui[lang]['lang.label'], exact: true });
      for (const l of langs) {
        await expect(selector.getByRole('link', { name: languages[l] })).toHaveAttribute('href', enIdioma('/', l));
      }
      await expectNoA11yViolations(page);
    });
  }
});
