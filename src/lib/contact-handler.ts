// Lógica de la Pages Function POST /api/contacto (HU-07), separada para probarla con Vitest.
// Secretos en Cloudflare Pages (nunca en el repo): RESEND_API_KEY y CONTACT_TO (el email de Julian).
// Opcional: CONTACT_FROM; por defecto el remitente de pruebas de Resend, que solo entrega al email de la cuenta.
import { languages, type Lang } from '../i18n/ui';
import { validateContact, type Reason } from './contact';

export interface ContactEnv {
  RESEND_API_KEY?: string;
  CONTACT_TO?: string;
  CONTACT_FROM?: string;
}

type Fetcher = (input: string, init: RequestInit) => Promise<Response>;

/** Menos segundos que esto entre cargar la página y enviar: lo ha rellenado un bot. */
const MIN_SECONDS = 3;

const reasonLabel: Record<Reason, string> = { empleo: 'Empleo', proyecto: 'Proyecto', otro: 'Otro' };

export async function handleContact(request: Request, env: ContactEnv, fetcher: Fetcher): Promise<Response> {
  const isJson = (request.headers.get('content-type') ?? '').includes('application/json');
  let input: Record<string, unknown>;
  try {
    input = isJson
      ? ((await request.json()) as Record<string, unknown>)
      : Object.fromEntries((await request.formData()).entries());
  } catch {
    input = {};
  }

  const lang: Lang = typeof input.lang === 'string' && input.lang in languages ? (input.lang as Lang) : 'es';
  // Sin JavaScript el navegador hace un POST normal: se responde con una redirección a la página de contacto.
  const reply = (status: number, body: object, hash: 'enviado' | 'error-envio') =>
    isJson
      ? Response.json(body, { status })
      : Response.redirect(new URL(`${lang === 'es' ? '' : `/${lang}`}/contacto/#${hash}`, request.url).href, 303);

  // Antispam: campo trampa o envío demasiado rápido. Se finge éxito para no dar pistas.
  const elapsed = Number(input.elapsed);
  const spam = (typeof input.website === 'string' && input.website !== '') || (input.elapsed !== undefined && input.elapsed !== '' && elapsed < MIN_SECONDS);
  if (spam) return reply(200, { ok: true }, 'enviado');

  const result = validateContact(input);
  if (!result.ok) return reply(400, { ok: false, errors: result.errors }, 'error-envio');

  if (!env.RESEND_API_KEY || !env.CONTACT_TO) return reply(500, { ok: false }, 'error-envio');

  const { name, email, reason, message } = result.data;
  const oneLine = (s: string) => s.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ');
  try {
    const res = await fetcher('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: env.CONTACT_FROM ?? 'Portafolio <onboarding@resend.dev>',
        to: [env.CONTACT_TO],
        reply_to: email,
        subject: `[Portafolio] ${reasonLabel[reason]} · ${oneLine(name)}`,
        text: `Nombre: ${name}\nEmail: ${email}\nMotivo: ${reasonLabel[reason]}\nIdioma: ${lang}\n\n${message}\n`,
      }),
    });
    if (!res.ok) return reply(502, { ok: false }, 'error-envio');
  } catch {
    return reply(502, { ok: false }, 'error-envio');
  }
  return reply(200, { ok: true }, 'enviado');
}
