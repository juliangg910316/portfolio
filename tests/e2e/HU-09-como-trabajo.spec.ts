import { expect, test } from '@playwright/test';
import { expectNoA11yViolations } from './a11y';

// HU-09 · Cómo trabajo con IA (docs/historias/HU-09-como-trabajo.md)

const idiomas = [
  {
    prefijo: '',
    menu: 'Cómo trabajo',
    titulo: 'Cómo trabajo con IA',
    flujo: 'Mi flujo, paso a paso',
    pasos: ['Especificar', 'Planificar', 'Dividir en tareas', 'Implementar con agentes', 'Tests', 'Revisión'],
    ejemplo: 'Un ejemplo real: Rueda Viva',
    cifras: ['6', 'specs', '43', 'tareas', '25', 'commits'],
    repo: 'Ver el código en GitHub',
    herramientas: 'Herramientas que uso',
  },
  {
    prefijo: '/pt',
    menu: 'Como trabalho',
    titulo: 'Como trabalho com IA',
    flujo: 'Meu fluxo, passo a passo',
    pasos: ['Especificar', 'Planejar', 'Dividir em tarefas', 'Implementar com agentes', 'Testes', 'Revisão'],
    ejemplo: 'Um exemplo real: Rueda Viva',
    cifras: ['6', 'specs', '43', 'tarefas', '25', 'commits'],
    repo: 'Ver o código no GitHub',
    herramientas: 'Ferramentas que uso',
  },
  {
    prefijo: '/en',
    menu: 'How I work',
    titulo: 'How I work with AI',
    flujo: 'My workflow, step by step',
    pasos: ['Specify', 'Plan', 'Break into tasks', 'Build with agents', 'Tests', 'Review'],
    ejemplo: 'A real example: Rueda Viva',
    cifras: ['6', 'specs', '43', 'tasks', '25', 'commits'],
    repo: 'See the code on GitHub',
    herramientas: 'Tools I use',
  },
] as const;

test.describe('HU-09 · Cómo trabajo con IA', () => {
  for (const { prefijo, menu, titulo, flujo, pasos } of idiomas) {
    test(`CA1 ${prefijo}/como-trabajo/ muestra el flujo por pasos y está en el menú`, async ({ page }) => {
      await page.goto(`${prefijo}/`);
      await page.getByRole('navigation').first().getByRole('link', { name: menu, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`${prefijo}/como-trabajo/$`));
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(titulo);
      const lista = page.getByRole('region', { name: flujo }).getByRole('list').first();
      await expect(lista).toHaveJSProperty('tagName', 'OL');
      const items = lista.locator(':scope > li');
      await expect(items).toHaveCount(pasos.length);
      for (let i = 0; i < pasos.length; i++) {
        await expect(items.nth(i).getByRole('heading', { level: 3 })).toHaveText(pasos[i]!);
        await expect(items.nth(i).locator('p').first()).not.toBeEmpty();
      }
    });
  }

  test('CA1 el enlace del menú está entre Experiencia y Blog', async ({ page }) => {
    await page.goto('/');
    const textos = await page.getByRole('navigation').first().getByRole('link').allInnerTexts();
    const i = textos.indexOf('Cómo trabajo');
    expect(textos[i - 1]).toBe('Experiencia');
    expect(textos[i + 1]).toBe('Blog');
  });

  for (const { prefijo, ejemplo, cifras, repo } of idiomas) {
    test(`CA2 ${prefijo}/como-trabajo/ muestra Rueda Viva con sus cifras y enlace al repo`, async ({ page }) => {
      await page.goto(`${prefijo}/como-trabajo/`);
      const sec = page.getByRole('region', { name: ejemplo });
      // Cifras en una lista de definiciones: <dt>etiqueta</dt><dd>número</dd>.
      const pares = await sec.locator('dl > div').evaluateAll((divs) =>
        divs.map((d) => [d.querySelector('dd')?.textContent?.trim(), d.querySelector('dt')?.textContent?.trim()]),
      );
      for (let i = 0; i < cifras.length; i += 2) expect(pares).toContainEqual([cifras[i], cifras[i + 1]]);
      await expect(sec.getByRole('link', { name: repo })).toHaveAttribute(
        'href',
        'https://github.com/juliangg910316/SpinStreak',
      );
      await expect(sec.getByRole('link', { name: 'Rueda Viva' }).first()).toHaveAttribute(
        'href',
        `${prefijo}/proyectos/rueda-viva/`,
      );
    });
  }

  for (const { prefijo, herramientas } of idiomas) {
    test(`CA3 ${prefijo}/como-trabajo/ lista las herramientas que uso`, async ({ page }) => {
      await page.goto(`${prefijo}/como-trabajo/`);
      const items = page.getByRole('region', { name: herramientas }).getByRole('listitem');
      for (const h of ['Claude Code', 'Cursor', 'GitHub Copilot', 'MCP']) {
        await expect(items.filter({ has: page.getByRole('heading', { name: h, exact: true }) })).toHaveCount(1);
      }
    });
  }

  test('enlaza al artículo de SDD del blog y tiene botón de contacto', async ({ page }) => {
    await page.goto('/en/como-trabajo/');
    await expect(page.getByRole('main').locator('a[href="/en/blog/spec-driven-development/"]')).toHaveCount(1);
    await expect(page.getByRole('main').getByRole('link', { name: 'Contact me' })).toHaveAttribute('href', '/en/contacto/');
  });

  for (const path of ['/como-trabajo/', '/pt/como-trabajo/', '/en/como-trabajo/']) {
    test(`DoD ${path} sin errores de accesibilidad ni scroll horizontal a 360 px`, async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 780 });
      await page.goto(path);
      await expectNoA11yViolations(page);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
    });
  }

  test('DoD /como-trabajo/ en modo claro sin errores de accesibilidad', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/como-trabajo/');
    await expectNoA11yViolations(page);
  });
});
