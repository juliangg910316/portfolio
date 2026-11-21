import { expect, test, type Page } from '@playwright/test';
import { expectNoA11yViolations } from './a11y';

// HU-01 · Inicio con propuesta de valor (docs/historias/HU-01-inicio.md)

type Contenido = {
  path: string;
  prefijo: string;
  lang: 'es' | 'pt' | 'en';
  menu: string;
  enlacesMenu: string[];
  descargarCv: string;
  contratame: string;
  sobreMi: string;
  cifras: string[];
  /** Textos que no deben aparecer (restos sin traducir). */
  ausentes: string[];
};

const es: Contenido = {
  path: '/',
  prefijo: '',
  lang: 'es',
  menu: 'Principal',
  enlacesMenu: ['Inicio', 'Sobre mí', 'Proyectos', 'Experiencia', 'Blog', 'Contacto'],
  descargarCv: 'Descargar CV',
  contratame: 'Contrátame',
  sobreMi: 'Sobre mí',
  cifras: ['años de experiencia', 'apps a mi cargo', 'devs en mi equipo', 'países'],
  ausentes: [],
};

const pt: Contenido = {
  path: '/pt/',
  prefijo: '/pt',
  lang: 'pt',
  menu: 'Principal',
  enlacesMenu: ['Início', 'Sobre mim', 'Projetos', 'Experiência', 'Blog', 'Contato'],
  descargarCv: 'Baixar CV',
  contratame: 'Contrate-me',
  sobreMi: 'Sobre mim',
  cifras: ['anos de experiência', 'apps sob minha responsabilidade', 'devs na minha equipe', 'países'],
  ausentes: ['Descargar CV', 'Contrátame', 'Hola, soy', 'años de experiencia'],
};

const en: Contenido = {
  path: '/en/',
  prefijo: '/en',
  lang: 'en',
  menu: 'Main',
  enlacesMenu: ['Home', 'About me', 'Projects', 'Experience', 'Blog', 'Contact'],
  descargarCv: 'Download CV',
  contratame: 'Hire me',
  sobreMi: 'About me',
  cifras: ['years of experience', 'apps under my care', 'devs on my team', 'countries'],
  ausentes: ['Descargar CV', 'Contrátame', 'Hola, soy', 'años de experiencia'],
};

const valoresCifras = ['10+', '~10', '4', '5'];

async function ca1Presentacion(page: Page) {
  const h1 = page.getByRole('heading', { level: 1 });
  await expect(h1).toHaveCount(1);
  await expect(h1).toHaveText('Julian Gutierrez');
  await expect(page.getByText(/Mobile Tech Lead/).first()).toBeVisible();

  const descripcion = page.getByTestId('hero-descripcion');
  await expect(descripcion).toBeVisible();
  const texto = (await descripcion.textContent())?.trim() ?? '';
  const frases = texto.split(/[.!?](?:\s|$)/).filter((f) => f.trim().length > 0);
  expect(frases.length).toBeGreaterThanOrEqual(1);
  expect(frases.length).toBeLessThanOrEqual(2);
}

async function ca2Botones(page: Page, c: Contenido) {
  const cv = page.getByRole('link', { name: c.descargarCv });
  await expect(cv).toBeVisible();
  await expect(cv).toHaveAttribute('href', new RegExp(`\\.pdf$`));

  const contratame = page.getByRole('link', { name: c.contratame });
  await expect(contratame).toBeVisible();
  await expect(contratame).toHaveAttribute('href', `${c.prefijo}/contacto/`);
}

async function ca3Redes(page: Page) {
  const redes = [
    { nombre: 'LinkedIn', href: 'https://www.linkedin.com/in/juliangutierrez9103' },
    { nombre: 'GitHub', href: 'https://github.com/juliangg910316' },
    { nombre: 'WhatsApp', href: /^https:\/\/wa\.me\// },
  ];
  for (const { nombre, href } of redes) {
    const enlace = page.getByRole('link', { name: nombre, exact: true });
    await expect(enlace).toBeVisible();
    await expect(enlace).toHaveAttribute('href', href);
  }
}

async function ca4SobreMi(page: Page, c: Contenido) {
  const seccion = page.getByRole('region', { name: c.sobreMi });
  await expect(seccion).toBeVisible();
  const cifras = seccion.getByTestId('cifra');
  await expect(cifras).toHaveCount(4);
  for (let i = 0; i < 4; i++) {
    await expect(cifras.nth(i)).toContainText(valoresCifras[i]!);
    await expect(cifras.nth(i)).toContainText(c.cifras[i]!);
  }
}

async function ca5Menu(page: Page, c: Contenido) {
  const nav = page.getByRole('navigation', { name: c.menu });
  await expect(nav).toBeVisible();
  const enlaces = nav.getByRole('link');
  await expect(enlaces).toHaveText(c.enlacesMenu);
  await expect(nav.getByRole('link', { name: c.enlacesMenu[0] })).toHaveAttribute('aria-current', 'page');
}

test.describe('HU-01 · Inicio', () => {
  test('CA1 un único h1 con el nombre, el cargo y una descripción breve', async ({ page }) => {
    await page.goto(es.path);
    await ca1Presentacion(page);
  });

  test('CA2 botones "Descargar CV" (PDF) y "Contrátame" (contacto)', async ({ page }) => {
    await page.goto(es.path);
    await ca2Botones(page, es);
  });

  test('CA3 enlaces a LinkedIn, GitHub y WhatsApp con nombre accesible', async ({ page }) => {
    await page.goto(es.path);
    await ca3Redes(page);
  });

  test('CA4 sección "Sobre mí" con 10+ años, ~10 apps, 4 devs y 5 países', async ({ page }) => {
    await page.goto(es.path);
    await ca4SobreMi(page, es);
  });

  test('CA5 menú con Inicio, Sobre mí, Proyectos, Experiencia, Blog y Contacto', async ({ page }) => {
    await page.goto(es.path);
    await ca5Menu(page, es);
  });

  test('CA6 a 360 px no hay scroll horizontal y el menú se puede usar', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await page.goto(es.path);

    const anchoDocumento = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(anchoDocumento).toBeLessThanOrEqual(360);

    const nav = page.getByRole('navigation', { name: es.menu });
    for (const nombre of es.enlacesMenu) {
      const enlace = nav.getByRole('link', { name: nombre });
      await expect(enlace).toBeVisible();
      const caja = await enlace.boundingBox();
      expect(caja).not.toBeNull();
      expect(caja!.x).toBeGreaterThanOrEqual(0);
      expect(caja!.x + caja!.width).toBeLessThanOrEqual(360);
      expect(caja!.height).toBeGreaterThanOrEqual(44);
    }

    await nav.getByRole('link', { name: 'Sobre mí' }).click();
    await expect(page).toHaveURL(/#sobre-mi$/);
    await expect(page.getByRole('region', { name: es.sobreMi })).toBeInViewport();
  });

  for (const c of [pt, en]) {
    test(`CA7 ${c.path} muestra los mismos elementos traducidos`, async ({ page }) => {
      await page.goto(c.path);
      await expect(page.locator('html')).toHaveAttribute('lang', c.lang);
      await ca1Presentacion(page);
      await ca2Botones(page, c);
      await ca3Redes(page);
      await ca4SobreMi(page, c);
      await ca5Menu(page, c);
      const body = page.locator('body');
      for (const texto of c.ausentes) {
        await expect(body).not.toContainText(texto);
      }
    });
  }

  for (const c of [es, pt, en]) {
    test(`DoD ${c.path} sin errores de accesibilidad`, async ({ page }) => {
      await page.goto(c.path);
      await expectNoA11yViolations(page);
    });
  }
});
