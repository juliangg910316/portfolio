import { describe, expect, it, vi } from 'vitest';
import { validateContact } from '../../src/lib/contact';
import { handleContact, type ContactEnv } from '../../src/lib/contact-handler';

const valido = {
  name: 'Ana Souza',
  email: 'ana@example.com',
  reason: 'proyecto',
  message: 'Hola, necesito una app Flutter para mi empresa.',
};

describe('validateContact', () => {
  it('acepta un formulario válido y recorta espacios', () => {
    const r = validateContact({ ...valido, name: '  Ana Souza  ' });
    expect(r).toEqual({ ok: true, data: { ...valido } });
  });

  it('marca como obligatorios los campos vacíos', () => {
    const r = validateContact({ name: ' ', email: '', reason: '', message: '' });
    expect(r).toEqual({
      ok: false,
      errors: { name: 'required', email: 'required', reason: 'required', message: 'required' },
    });
  });

  it('rechaza un email inválido', () => {
    for (const email of ['ana', 'ana@', 'ana@example', 'ana @example.com', 'ana@example.c']) {
      expect(validateContact({ ...valido, email })).toEqual({ ok: false, errors: { email: 'email' } });
    }
  });

  it('rechaza un motivo que no está en la lista', () => {
    expect(validateContact({ ...valido, reason: 'spam' })).toEqual({ ok: false, errors: { reason: 'required' } });
  });

  it('pide un mensaje de al menos 10 caracteres y no más de 5000', () => {
    expect(validateContact({ ...valido, message: 'Hola' })).toEqual({ ok: false, errors: { message: 'tooShort' } });
    expect(validateContact({ ...valido, message: 'a'.repeat(5001) })).toEqual({
      ok: false,
      errors: { message: 'tooLong' },
    });
  });

  it('limita la longitud del nombre', () => {
    expect(validateContact({ ...valido, name: 'a'.repeat(101) })).toEqual({ ok: false, errors: { name: 'tooLong' } });
  });

  it('ignora valores que no son texto', () => {
    expect(validateContact({ ...valido, name: 42 }).ok).toBe(false);
  });
});

describe('handleContact (Pages Function /api/contacto)', () => {
  const env: ContactEnv = { RESEND_API_KEY: 're_test', CONTACT_TO: 'julian@example.com' };
  const json = (body: unknown) =>
    new Request('https://web.test/api/contacto', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
  const form = (body: Record<string, string>) =>
    new Request('https://web.test/api/contacto', { method: 'POST', body: new URLSearchParams(body) });
  const resendOk = () => vi.fn(async () => new Response('{"id":"1"}', { status: 200 }));

  it('envía el mensaje con Resend y responde ok', async () => {
    const fetcher = resendOk();
    const res = await handleContact(json({ ...valido, lang: 'pt' }), env, fetcher);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(fetcher).toHaveBeenCalledOnce();
    const [url, init] = fetcher.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://api.resend.com/emails');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer re_test');
    const body = JSON.parse(init.body as string);
    expect(body.to).toEqual(['julian@example.com']);
    expect(body.reply_to).toBe('ana@example.com');
    expect(body.subject).toBe('[Portafolio] Proyecto · Ana Souza');
    expect(body.text).toContain(valido.message);
    expect(body.text).toContain('Idioma: pt');
  });

  it('quita los saltos de línea del asunto', async () => {
    const fetcher = resendOk();
    await handleContact(json({ ...valido, name: 'Ana\r\nBcc: x@y.com' }), env, fetcher);
    const body = JSON.parse((fetcher.mock.calls[0] as unknown as [string, RequestInit])[1].body as string);
    expect(body.subject).toBe('[Portafolio] Proyecto · Ana Bcc: x@y.com');
  });

  it('con datos inválidos responde 400 con los errores y no envía nada', async () => {
    const fetcher = resendOk();
    const res = await handleContact(json({ ...valido, email: 'mal' }), env, fetcher);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ ok: false, errors: { email: 'email' } });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('antispam: si el campo trampa viene relleno, finge éxito y no envía nada', async () => {
    const fetcher = resendOk();
    const res = await handleContact(json({ ...valido, website: 'http://spam.example' }), env, fetcher);
    expect(res.status).toBe(200);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('antispam: si se envía en menos de 3 segundos, finge éxito y no envía nada', async () => {
    const fetcher = resendOk();
    const res = await handleContact(json({ ...valido, elapsed: '1' }), env, fetcher);
    expect(res.status).toBe(200);
    expect(fetcher).not.toHaveBeenCalled();
    await handleContact(json({ ...valido, elapsed: '12' }), env, fetcher);
    expect(fetcher).toHaveBeenCalledOnce();
  });

  it('si Resend falla responde 502', async () => {
    const fetcher = vi.fn(async () => new Response('error', { status: 500 }));
    const res = await handleContact(json(valido), env, fetcher);
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ ok: false });
  });

  it('si la red falla responde 502', async () => {
    const fetcher = vi.fn(async () => {
      throw new Error('red');
    });
    expect((await handleContact(json(valido), env, fetcher)).status).toBe(502);
  });

  it('sin secretos configurados responde 500 sin llamar a Resend', async () => {
    const fetcher = resendOk();
    const res = await handleContact(json(valido), {}, fetcher);
    expect(res.status).toBe(500);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('sin JavaScript (formulario normal) redirige a la confirmación en el idioma del formulario', async () => {
    const res = await handleContact(form({ ...valido, lang: 'en' }), env, resendOk());
    expect(res.status).toBe(303);
    expect(res.headers.get('location')).toBe('https://web.test/en/contacto/#enviado');
  });

  it('sin JavaScript, si falla, redirige al aviso de error', async () => {
    const res = await handleContact(form({ ...valido, lang: 'es' }), {}, resendOk());
    expect(res.status).toBe(303);
    expect(res.headers.get('location')).toBe('https://web.test/contacto/#error-envio');
  });

  it('un idioma desconocido se trata como español', async () => {
    const res = await handleContact(form({ ...valido, lang: 'xx' }), env, resendOk());
    expect(res.headers.get('location')).toBe('https://web.test/contacto/#enviado');
  });
});
