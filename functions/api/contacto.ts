// Cloudflare Pages Function: POST /api/contacto (HU-07). La lógica está en src/lib/contact-handler.ts.
import { handleContact, type ContactEnv } from '../../src/lib/contact-handler';

export const onRequestPost = (context: { request: Request; env: ContactEnv }) =>
  handleContact(context.request, context.env, (input, init) => fetch(input, init));
