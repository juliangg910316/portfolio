import { expect, test } from '@playwright/test';
import { expectNoA11yViolations } from './a11y';

// HU-10 · Sobre mí (docs/historias/HU-10-sobre-mi.md)

const idiomas = [
  {
    prefijo: '',
    menu: 'Sobre mí',
    titulo: 'Sobre mí',
    historia: 'Mi historia',
    capitulos: ['Matemáticas y criptografía', 'ENZONA', 'Remoto internacional', 'Tech Lead en Brasil'],
    valoro: 'Qué valoro al trabajar',
    idiomas: 'Idiomas que hablo',
    lenguas: ['Español', 'Portugués', 'Inglés'],
    contacto: 'Hablemos',
    leerHistoria: 'Leer mi historia',
  },
  {
    prefijo: '/pt',
    menu: 'Sobre mim',
    titulo: 'Sobre mim',
    historia: 'Minha história',
    capitulos: ['Matemática e criptografia', 'ENZONA', 'Remoto internacional', 'Tech Lead no Brasil'],
    valoro: 'O que valorizo no trabalho',
    idiomas: 'Idiomas que falo',
    lenguas: ['Espanhol', 'Português', 'Inglês'],
    contacto: 'Vamos conversar',
    leerHistoria: 'Ler minha história',
  },
  {
    prefijo: '/en',
    menu: 'About me',
    titulo: 'About me',
    historia: 'My story',
    capitulos: ['Mathematics and cryptography', 'ENZONA', 'Remote and international', 'Tech Lead in Brazil'],
    valoro: 'What I value at work',
    idiomas: 'Languages I speak',
    lenguas: ['Spanish', 'Portuguese', 'English'],
    contacto: "Let's talk",
    leerHistoria: 'Read my story',
  },
] as const;

test.describe('HU-10 · Sobre mí', () => {
  for (const { prefijo, menu, titulo, historia, capitulos } of idiomas) {
    test(`CA1 ${prefijo}/sobre-mi/ cuenta la historia en orden y está en el menú`, async ({ page }) => {
      await page.goto(`${prefijo}/`);
      await page.getByRole('navigation').first().getByRole('link', { name: menu, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`${prefijo}/sobre-mi/$`));
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(titulo);
      const seccion = page.getByRole('region', { name: historia });
      const pasos = seccion.getByRole('list').locator(':scope > li');
      await expect(pasos).toHaveCount(capitulos.length);
      for (let i = 0; i < capitulos.length; i++) {
        await expect(pasos.nth(i).getByRole('heading', { level: 3 })).toHaveText(capitulos[i]!);
        await expect(pasos.nth(i).locator('p').first()).not.toBeEmpty();
      }
      await expect(seccion.getByRole('list')).toHaveJSProperty('tagName', 'OL');
    });
  }

  test('CA1 la historia usa datos reales (fechas y lugares del CV)', async ({ page }) => {
    await page.goto('/sobre-mi/');
    const pasos = page.getByRole('region', { name: 'Mi historia' }).getByRole('list').locator(':scope > li');
    await expect(pasos.nth(0)).toContainText('Universidad de La Habana');
    await expect(pasos.nth(1)).toContainText('2014');
    await expect(pasos.nth(2)).toContainText('Polonia');
    await expect(pasos.nth(2)).toContainText('Canadá');
    await expect(pasos.nth(3)).toContainText('Curitiba');
  });

  for (const { prefijo } of idiomas) {
    test(`CA2 ${prefijo}/sobre-mi/ muestra una foto con texto alternativo descriptivo`, async ({ page }) => {
      await page.goto(`${prefijo}/sobre-mi/`);
      const foto = page.getByRole('main').getByRole('img', { name: /Julian/ }).first();
      await expect(foto).toBeVisible();
      const alt = (await foto.getAttribute('alt')) ?? '';
      expect(alt.length).toBeGreaterThan(25);
      expect(alt).not.toMatch(/PENDIENTE|PENDENTE|foto\b$/i);
      // Optimizada con astro:assets (formato moderno y tamaño explícito).
      expect(await foto.getAttribute('src')).toMatch(/\/_astro\/.+\.(webp|avif)$/);
      expect(await foto.getAttribute('width')).not.toBeNull();
      expect(await foto.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
    });
  }

  test('CA2 la foto también está en la sección «Sobre mí» del inicio', async ({ page }) => {
    await page.goto('/');
    const foto = page.getByRole('region', { name: 'Sobre mí' }).getByRole('img', { name: /Julian/ });
    await expect(foto).toBeVisible();
    await expect(page.getByRole('region', { name: 'Sobre mí' })).not.toContainText('PENDIENTE');
  });

  for (const { prefijo, valoro, idiomas: titIdiomas, lenguas, contacto } of idiomas) {
    test(`CA3 ${prefijo}/sobre-mi/ muestra idiomas, qué valoro y un botón de contacto`, async ({ page }) => {
      await page.goto(`${prefijo}/sobre-mi/`);
      const valores = page.getByRole('region', { name: valoro }).getByRole('listitem');
      await expect(valores).toHaveCount(3);
      const idiomasSec = page.getByRole('region', { name: titIdiomas });
      for (const lengua of lenguas) await expect(idiomasSec).toContainText(lengua);
      const boton = page.getByRole('main').getByRole('link', { name: contacto });
      await expect(boton).toHaveAttribute('href', `${prefijo}/contacto/`);
    });
  }

  test('CA3 los niveles de idioma son los del CV', async ({ page }) => {
    await page.goto('/sobre-mi/');
    const sec = page.getByRole('region', { name: 'Idiomas que hablo' });
    await expect(sec.getByRole('listitem').nth(0)).toContainText('Nativo');
    await expect(sec.getByRole('listitem').nth(1)).toContainText('Intermedio');
    await expect(sec.getByRole('listitem').nth(2)).toContainText('Profesional básico');
  });

  test('toque personal: la bici estática enlaza el caso de Rueda Viva', async ({ page }) => {
    await page.goto('/sobre-mi/');
    await expect(page.getByRole('main')).toContainText('bici');
    await expect(page.getByRole('main').getByRole('link', { name: 'Rueda Viva' })).toHaveAttribute(
      'href',
      '/proyectos/rueda-viva/',
    );
  });

  for (const { prefijo, leerHistoria, titulo } of idiomas) {
    test(`la sección del inicio ${prefijo}/ enlaza a la historia completa`, async ({ page }) => {
      await page.goto(`${prefijo}/`);
      const enlace = page.getByRole('region', { name: titulo }).getByRole('link', { name: leerHistoria });
      await expect(enlace).toHaveAttribute('href', `${prefijo}/sobre-mi/`);
    });
  }

  for (const path of ['/sobre-mi/', '/pt/sobre-mi/', '/en/sobre-mi/']) {
    test(`DoD ${path} sin errores de accesibilidad ni scroll horizontal a 360 px`, async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 780 });
      await page.goto(path);
      await expectNoA11yViolations(page);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
    });
  }

  test('DoD /sobre-mi/ en modo claro sin errores de accesibilidad', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/sobre-mi/');
    await expectNoA11yViolations(page);
  });
});
