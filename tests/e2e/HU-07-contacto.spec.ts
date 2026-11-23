import { expect, test, type Page } from '@playwright/test';
import { expectNoA11yViolations } from './a11y';

// HU-07 · Formulario de contacto (docs/historias/HU-07-contacto.md)
// El envío se simula con page.route: los tests nunca mandan correos de verdad.

const idiomas = [
  {
    lang: 'es',
    prefijo: '',
    titulo: 'Contacto',
    campos: ['Nombre', 'Email', 'Motivo', 'Mensaje'],
    motivos: ['Empleo', 'Proyecto', 'Otro'],
    enviar: 'Enviar mensaje',
    obligatorio: 'Este campo es obligatorio.',
    gracias: 'Gracias',
    fallo: 'No se pudo enviar',
  },
  {
    lang: 'pt',
    prefijo: '/pt',
    titulo: 'Contato',
    campos: ['Nome', 'Email', 'Motivo', 'Mensagem'],
    motivos: ['Emprego', 'Projeto', 'Outro'],
    enviar: 'Enviar mensagem',
    obligatorio: 'Este campo é obrigatório.',
    gracias: 'Obrigado',
    fallo: 'Não foi possível enviar',
  },
  {
    lang: 'en',
    prefijo: '/en',
    titulo: 'Contact',
    campos: ['Name', 'Email', 'Reason', 'Message'],
    motivos: ['Job', 'Project', 'Other'],
    enviar: 'Send message',
    obligatorio: 'This field is required.',
    gracias: 'Thank you',
    fallo: "couldn't be sent",
  },
] as const;
const [es] = idiomas;

/** Cuenta las llamadas a /api/contacto y responde con el estado dado. */
async function simularApi(page: Page, status: number) {
  const llamadas: unknown[] = [];
  await page.route('**/api/contacto', async (route) => {
    llamadas.push(route.request().postDataJSON());
    await route.fulfill({ status, json: { ok: status === 200 } });
  });
  return llamadas;
}

async function rellenar(page: Page) {
  const form = page.getByRole('main').locator('form');
  await form.getByLabel('Nombre').fill('Ana Souza');
  await form.getByLabel('Email').fill('ana@example.com');
  await form.getByLabel('Motivo').selectOption({ label: 'Proyecto' });
  await form.getByLabel('Mensaje').fill('Hola, necesito una app Flutter para mi empresa.');
}

test.describe('HU-07 · Formulario de contacto', () => {
  for (const { prefijo, titulo, campos, motivos, enviar } of idiomas) {
    test(`CA1 ${prefijo}/contacto/ tiene nombre, email, motivo y mensaje, cada uno con su label`, async ({ page }) => {
      await page.goto(`${prefijo}/contacto/`);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(titulo);
      const form = page.getByRole('main').locator('form');
      for (const campo of campos) await expect(form.getByLabel(campo, { exact: true })).toBeVisible();
      await expect(form.getByLabel(campos[1], { exact: true })).toHaveAttribute('type', 'email');
      const opciones = await form.getByLabel(campos[2], { exact: true }).locator('option:not([value=""])').allTextContents();
      expect(opciones.map((o) => o.trim())).toEqual([...motivos]);
      await expect(form.getByLabel(campos[3], { exact: true })).toHaveJSProperty('tagName', 'TEXTAREA');
      await expect(form.getByRole('button', { name: enviar })).toBeVisible();
    });
  }

  test('CA2 con campos vacíos se ven los errores junto a cada campo y no se envía', async ({ page }) => {
    const llamadas = await simularApi(page, 200);
    await page.goto('/contacto/');
    const form = page.getByRole('main').locator('form');
    await form.getByRole('button', { name: es.enviar }).click();
    for (const campo of es.campos) {
      const input = form.getByLabel(campo, { exact: true });
      await expect(input).toHaveAttribute('aria-invalid', 'true');
      await expect(input).toHaveAccessibleDescription(es.obligatorio);
    }
    await expect(form.getByLabel('Nombre', { exact: true })).toBeFocused();
    expect(llamadas).toHaveLength(0);
  });

  test('CA2 con un email inválido se ve el error de ese campo y no se envía', async ({ page }) => {
    const llamadas = await simularApi(page, 200);
    await page.goto('/contacto/');
    await rellenar(page);
    const form = page.getByRole('main').locator('form');
    const email = form.getByLabel('Email', { exact: true });
    await email.fill('ana@example');
    await form.getByRole('button', { name: es.enviar }).click();
    await expect(email).toHaveAttribute('aria-invalid', 'true');
    await expect(email).toHaveAccessibleDescription('Escribe un email válido.');
    await expect(form.getByLabel('Nombre', { exact: true })).not.toHaveAttribute('aria-invalid', 'true');
    expect(llamadas).toHaveLength(0);
    // Al corregirlo, el error desaparece.
    await email.fill('ana@example.com');
    await email.blur();
    await expect(email).not.toHaveAttribute('aria-invalid', 'true');
  });

  test('CA3 con el formulario válido veo la confirmación', async ({ page }) => {
    const llamadas = await simularApi(page, 200);
    await page.goto('/contacto/');
    await rellenar(page);
    await page.getByRole('main').getByRole('button', { name: es.enviar }).click();
    const aviso = page.getByRole('status');
    await expect(aviso).toBeVisible();
    await expect(aviso).toContainText(es.gracias);
    await expect(aviso).toBeFocused();
    expect(llamadas).toHaveLength(1);
    expect(llamadas[0]).toMatchObject({
      name: 'Ana Souza',
      email: 'ana@example.com',
      reason: 'proyecto',
      message: 'Hola, necesito una app Flutter para mi empresa.',
      lang: 'es',
      website: '',
    });
    // El formulario queda vacío para no enviarlo dos veces.
    await expect(page.getByRole('main').locator('form').getByLabel('Nombre', { exact: true })).toHaveValue('');
  });

  for (const fallo of ['error del servicio', 'sin conexión'] as const) {
    test(`CA4 si el envío falla (${fallo}) veo un error y la alternativa de LinkedIn`, async ({ page }) => {
      if (fallo === 'sin conexión') await page.route('**/api/contacto', (route) => route.abort());
      else await simularApi(page, 502);
      await page.goto('/contacto/');
      await rellenar(page);
      await page.getByRole('main').getByRole('button', { name: es.enviar }).click();
      const alerta = page.getByRole('alert');
      await expect(alerta).toBeVisible();
      await expect(alerta).toContainText(es.fallo);
      await expect(alerta.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute(
        'href',
        'https://www.linkedin.com/in/juliangutierrez9103',
      );
      // Lo escrito no se pierde.
      await expect(page.getByRole('main').locator('form').getByLabel('Mensaje', { exact: true })).not.toHaveValue('');
    });
  }

  for (const { prefijo, gracias, fallo } of idiomas) {
    test(`CA3/CA4 sin JavaScript, ${prefijo}/contacto/ muestra la confirmación o el error tras la redirección`, async ({
      browser,
    }) => {
      const context = await browser.newContext({ javaScriptEnabled: false });
      const page = await context.newPage();
      await page.goto(`${prefijo}/contacto/`);
      await expect(page.getByRole('status')).toBeHidden();
      await expect(page.getByRole('alert')).toBeHidden();
      // Sin JS el navegador hace un POST normal y la función redirige a #enviado o #error-envio.
      await expect(page.locator('form')).toHaveAttribute('action', '/api/contacto');
      await expect(page.locator('form')).toHaveAttribute('method', 'post');
      await page.goto(`${prefijo}/contacto/#enviado`);
      await expect(page.getByRole('status')).toContainText(gracias);
      await page.goto(`${prefijo}/contacto/#error-envio`);
      await expect(page.getByRole('alert')).toContainText(fallo);
      await context.close();
    });
  }

  test('CA5 el email de Julian no aparece en texto plano en ninguna página', async ({ page, request }) => {
    const sitemap = await (await request.get('/sitemap-0.xml')).text();
    const rutas = [...sitemap.matchAll(/<loc>https?:\/\/[^/]+(\/[^<]*)<\/loc>/g)].map((m) => m[1]!);
    expect(rutas.length).toBeGreaterThan(20);
    for (const ruta of [...rutas, '/404.html']) {
      const html = await (await request.get(ruta)).text();
      expect(html, ruta).not.toMatch(/[\w.+-]+@gmail\.com/i);
      expect(html, ruta).not.toContain('mailto:');
    }
    // La página imprimible del CV (con el email) no se publica: solo los PDF.
    for (const ruta of ['/cv/', '/pt/cv/', '/en/cv/']) expect((await request.get(ruta)).status(), ruta).toBe(404);
    await page.goto('/contacto/');
    expect(await page.content()).not.toMatch(/@gmail\.com/i);
  });

  test('CA6 hay un campo trampa invisible para las personas y fuera del orden de tabulación', async ({ page }) => {
    await page.goto('/contacto/');
    const trampa = page.locator('form input[name="website"]');
    await expect(trampa).toHaveCount(1);
    await expect(trampa).toHaveAttribute('tabindex', '-1');
    await expect(trampa).toHaveAttribute('autocomplete', 'off');
    await expect(trampa).not.toBeInViewport();
    // No aparece en el árbol de accesibilidad.
    await expect(page.getByRole('main').getByRole('textbox')).toHaveCount(3);
  });

  test('CA6 la función descarta un envío con el campo trampa relleno', async ({ request }) => {
    const res = await request.post('/api/contacto', {
      data: {
        name: 'Bot',
        email: 'bot@example.com',
        reason: 'otro',
        message: 'Compra seguidores baratos ya mismo',
        website: 'http://spam.example',
        lang: 'es',
      },
    });
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  test('la función valida en el servidor', async ({ request }) => {
    const res = await request.post('/api/contacto', { data: { name: '', email: 'x', reason: 'otro', message: '' } });
    expect(res.status()).toBe(400);
    expect(await res.json()).toEqual({ ok: false, errors: { name: 'required', email: 'email', message: 'required' } });
  });

  for (const { prefijo, campos, enviar, obligatorio } of idiomas.slice(1)) {
    test(`i18n los errores de ${prefijo}/contacto/ están traducidos`, async ({ page }) => {
      await page.goto(`${prefijo}/contacto/`);
      const form = page.getByRole('main').locator('form');
      await form.getByRole('button', { name: enviar }).click();
      await expect(form.getByLabel(campos[0], { exact: true })).toHaveAccessibleDescription(obligatorio);
    });
  }

  for (const path of ['/contacto/', '/pt/contacto/', '/en/contacto/']) {
    test(`DoD ${path} sin errores de accesibilidad ni scroll horizontal a 360 px`, async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 780 });
      await page.goto(path);
      await expectNoA11yViolations(page);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
      await page.getByRole('main').locator('form button[type="submit"]').click();
      await expectNoA11yViolations(page);
    });
  }
});
