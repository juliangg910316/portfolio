import { expect, test, type Page } from '@playwright/test';
import { languages, ui, type Lang } from '../../src/i18n/ui';
import { expectNoA11yViolations } from './a11y';

// HU-02 · Cambio de idioma (docs/historias/HU-02-idiomas.md)

const SITE = 'https://juliangg-portfolio.pages.dev';
const langs = Object.keys(languages) as Lang[];

/** Páginas que existen, con su idioma y su ruta sin prefijo. */
const paginas: Array<{ path: string; lang: Lang; base: string }> = [
  { path: '/', lang: 'es', base: '/' },
  { path: '/pt/', lang: 'pt', base: '/' },
  { path: '/en/', lang: 'en', base: '/' },
  { path: '/proyectos/', lang: 'es', base: '/proyectos/' },
  { path: '/pt/proyectos/', lang: 'pt', base: '/proyectos/' },
  { path: '/en/proyectos/', lang: 'en', base: '/proyectos/' },
];

/** Nombres propios del contenido que coinciden con textos de la interfaz de otro idioma. */
// Los nombres de los idiomas en su propia lengua (selector de idioma) también son nombres propios.
const nombresPropios = ['Flutter Experience', 'React Native', 'Español', 'Português', 'English'];

const enIdioma = (base: string, lang: Lang) => (lang === 'es' ? base : `/${lang}${base}`);

function selector(page: Page, lang: Lang) {
  return page.getByRole('navigation', { name: ui[lang]['lang.label'], exact: true });
}

/** Textos de la interfaz que son exclusivos de otros idiomas (no aparecen en ningún texto de `lang`). */
function textosAjenos(lang: Lang): string[] {
  const propios = Object.values(ui[lang]) as string[];
  const ajenos = new Set<string>();
  for (const otro of langs) {
    if (otro === lang) continue;
    for (const texto of Object.values(ui[otro]) as string[]) {
      if (!propios.some((p) => p.includes(texto))) ajenos.add(texto);
    }
  }
  return [...ajenos];
}

test.describe('HU-02 · Idiomas', () => {
  for (const { path, lang } of paginas) {
    test(`CA1 ${path} tiene el selector ES/PT/EN con el idioma actual marcado`, async ({ page }) => {
      await page.goto(path);
      const nav = selector(page, lang);
      await expect(nav).toBeVisible();
      await expect(nav.getByRole('link')).toHaveCount(3);
      for (const l of langs) {
        const enlace = nav.getByRole('link', { name: languages[l] });
        await expect(enlace).toBeVisible();
        if (l === lang) await expect(enlace).toHaveAttribute('aria-current', 'true');
        else await expect(enlace).not.toHaveAttribute('aria-current');
      }
    });
  }

  test('CA2 desde /proyectos/ al elegir PT voy a /pt/proyectos/', async ({ page }) => {
    await page.goto('/proyectos/');
    await selector(page, 'es').getByRole('link', { name: languages.pt }).click();
    await expect(page).toHaveURL(/\/pt\/proyectos\/$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(ui.pt['projects.title']);
  });

  test('CA3 desde /en/ al elegir ES voy a /', async ({ page }) => {
    await page.goto('/en/');
    await selector(page, 'en').getByRole('link', { name: languages.es }).click();
    await expect(page).toHaveURL(/:\d+\/$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  });

  for (const { path, lang, base } of paginas) {
    test(`CA4 ${path} declara lang="${lang}" y hreflang de los 3 idiomas`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
      for (const l of langs) {
        await expect(page.locator(`link[rel="alternate"][hreflang="${l}"]`)).toHaveAttribute(
          'href',
          SITE + enIdioma(base, l),
        );
      }
      await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute(
        'href',
        SITE + base,
      );
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', SITE + path);
    });
  }

  for (const { path, lang } of paginas) {
    test(`CA5 ${path} no muestra textos de la interfaz en otro idioma`, async ({ page }) => {
      await page.goto(path);
      const textos = await page.evaluate(() => {
        const etiquetas = [...document.querySelectorAll('[aria-label]')].map((e) => e.getAttribute('aria-label'));
        const descripcion = document.querySelector('meta[name="description"]')?.getAttribute('content');
        return [document.body.innerText, document.title, descripcion, ...etiquetas].join('\n');
      });
      const sinNombres = nombresPropios.reduce((texto, nombre) => texto.replaceAll(nombre, ''), textos);
      for (const ajeno of textosAjenos(lang)) {
        expect(sinNombres, `"${ajeno}" no debería aparecer en ${path}`).not.toContain(ajeno);
      }
    });
  }

  for (const path of ['/proyectos/', '/pt/proyectos/', '/en/proyectos/']) {
    test(`DoD ${path} sin errores de accesibilidad ni scroll horizontal a 360 px`, async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 780 });
      await page.goto(path);
      await expectNoA11yViolations(page);
      const ancho = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(ancho).toBeLessThanOrEqual(360);
    });
  }
});
