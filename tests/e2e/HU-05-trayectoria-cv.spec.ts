import { expect, test } from '@playwright/test';
import { expectNoA11yViolations } from './a11y';

// HU-05 · Trayectoria y CV (docs/historias/HU-05-trayectoria-cv.md)

const empresas = ['CCONet Sistemas', 'SCA (freelance)', 'Treew', 'Dofleini Software', 'DSpot', 'XETID'];

const idiomas = [
  { lang: 'es', prefijo: '', descargar: 'Descargar CV', trayectoria: 'Trayectoria', formacion: 'Formación', certificaciones: 'Certificaciones y cursos', master: 'Máster en Matemáticas' },
  { lang: 'pt', prefijo: '/pt', descargar: 'Baixar CV', trayectoria: 'Trajetória', formacion: 'Formação', certificaciones: 'Certificações e cursos', master: 'Mestrado em Matemática' },
  { lang: 'en', prefijo: '/en', descargar: 'Download CV', trayectoria: 'Career', formacion: 'Education', certificaciones: 'Certifications and courses', master: "Master's in Mathematics" },
] as const;

test.describe('HU-05 · Trayectoria y CV', () => {
  test('CA1 /experiencia/ muestra la línea de tiempo de la más reciente a la más antigua', async ({ page }) => {
    await page.goto('/experiencia/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Experiencia');
    const linea = page.getByRole('list', { name: 'Trayectoria' });
    const items = linea.locator(':scope > li');
    await expect(items).toHaveCount(empresas.length);
    for (let i = 0; i < empresas.length; i++) {
      await expect(items.nth(i).getByTestId('empresa')).toHaveText(empresas[i]!);
    }
  });

  test('CA2 cada experiencia muestra cargo, empresa, fechas, lugar y 2–4 logros', async ({ page }) => {
    await page.goto('/experiencia/');
    const items = page.getByRole('list', { name: 'Trayectoria' }).locator(':scope > li');
    for (let i = 0; i < (await items.count()); i++) {
      const item = items.nth(i);
      await expect(item.getByRole('heading', { level: 3 })).not.toBeEmpty();
      await expect(item.getByTestId('empresa')).not.toBeEmpty();
      await expect(item.locator('time').first()).toHaveAttribute('datetime', /^\d{4}-\d{2}$/);
      await expect(item.getByTestId('lugar')).not.toBeEmpty();
      const logros = await item.getByRole('list', { name: 'Logros' }).getByRole('listitem').count();
      expect(logros).toBeGreaterThanOrEqual(2);
      expect(logros).toBeLessThanOrEqual(4);
    }
    // La experiencia actual no tiene fecha de fin.
    await expect(items.first()).toContainText('actualidad');
    // Fechas confirmadas (Google Sites).
    await expect(items.nth(4)).toContainText('jun. 2022 – dic. 2022');
    await expect(items.nth(3)).toContainText('abr. 2023 – dic. 2023');
  });

  test('CA3 /experiencia/ muestra la formación en la Universidad de La Habana', async ({ page }) => {
    await page.goto('/experiencia/');
    const formacion = page.getByRole('region', { name: 'Formación' });
    await expect(formacion).toContainText('Máster en Matemáticas');
    await expect(formacion).toContainText('2014–2018');
    await expect(formacion).toContainText('Licenciatura en Matemáticas');
    await expect(formacion).toContainText('2009–2014');
    await expect(formacion).toContainText('Universidad de La Habana');
  });

  for (const { lang, prefijo, descargar } of idiomas) {
    test(`CA4 en ${lang}, "${descargar}" descarga el PDF de ese idioma`, async ({ page, request }) => {
      const archivo = `julian-gutierrez-${lang}.pdf`;
      for (const ruta of [`${prefijo}/`, `${prefijo}/experiencia/`]) {
        await page.goto(ruta);
        const boton = page.getByRole('main').getByRole('link', { name: descargar }).first();
        await expect(boton).toHaveAttribute('href', `/cv/${archivo}`);
        const [descarga] = await Promise.all([page.waitForEvent('download'), boton.click()]);
        expect(descarga.suggestedFilename()).toBe(archivo);
      }
      const res = await request.get(`/cv/${archivo}`);
      expect(res.status()).toBe(200);
      expect(res.headers()['content-type']).toContain('application/pdf');
      expect((await res.body()).subarray(0, 5).toString()).toBe('%PDF-');
    });

    test(`CA4 la versión imprimible del CV en ${lang} existe, está traducida y no se indexa`, async ({ page }) => {
      await page.goto(`${prefijo}/cv/`);
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Julian Gutierrez Garcia');
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
      await expect(page.getByRole('main')).toContainText('Mobile Tech Lead');
      await expect(page.getByRole('main')).toContainText('juliangg910316@gmail.com');
      for (const empresa of empresas) await expect(page.getByRole('main')).toContainText(empresa);
    });
  }

  test('CA5 el inicio muestra las certificaciones con su plataforma y la tarjeta de educación', async ({ page }) => {
    await page.goto('/');
    const seccion = page.getByRole('region', { name: 'Certificaciones y cursos' });
    const certificados = seccion.getByRole('list', { name: 'Certificados' }).getByRole('listitem');
    expect(await certificados.count()).toBeGreaterThanOrEqual(4);
    for (const plataforma of ['Academia do Flutter', 'BIG school', 'DevTalles', 'LinkedIn Learning', 'Academia das IAs']) {
      await expect(seccion).toContainText(plataforma);
    }
    await expect(certificados.first()).toContainText('Certificado');
    const educacion = seccion.getByTestId('educacion');
    await expect(educacion).toContainText('Máster en Matemáticas');
    await expect(educacion).toContainText('Universidad de La Habana');
  });

  for (const { prefijo, trayectoria, formacion, certificaciones, master } of idiomas.slice(1)) {
    test(`i18n ${prefijo}/experiencia/ y el inicio están traducidos`, async ({ page }) => {
      await page.goto(`${prefijo}/experiencia/`);
      await expect(page.getByRole('list', { name: trayectoria }).locator(':scope > li')).toHaveCount(empresas.length);
      await expect(page.getByRole('region', { name: formacion })).toContainText(master);
      await expect(page.getByRole('main')).not.toContainText('actualidad');
      await page.goto(`${prefijo}/`);
      await expect(page.getByRole('region', { name: certificaciones })).toContainText(master);
    });
  }

  test('el email no aparece en las páginas normales, solo en el CV', async ({ page }) => {
    for (const ruta of ['/', '/experiencia/', '/proyectos/', '/en/experiencia/']) {
      await page.goto(ruta);
      expect(await page.content()).not.toContain('@gmail');
    }
  });

  test('las páginas del CV no están en el sitemap', async ({ request }) => {
    const sitemap = await (await request.get('/sitemap-0.xml')).text();
    expect(sitemap).toContain('/experiencia/</loc>');
    expect(sitemap).not.toMatch(/\/cv\/<\/loc>/);
  });

  for (const path of ['/experiencia/', '/pt/experiencia/', '/']) {
    test(`DoD ${path} sin errores de accesibilidad ni scroll horizontal a 360 px`, async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 780 });
      await page.goto(path);
      await expectNoA11yViolations(page);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
    });
  }
});
