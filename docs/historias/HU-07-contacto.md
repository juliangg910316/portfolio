# HU-07 · Formulario de contacto

**Como** visitante **quiero** enviar un mensaje desde la web **para** contactar sin buscar el email.

- **Prioridad**: Alta · **Estado**: Hecha · **Tests**: `tests/e2e/HU-07-contacto.spec.ts`

## Criterios de aceptación
1. **Dado** `/contacto`, **entonces** veo un formulario con nombre, email, motivo (empleo / proyecto / otro) y mensaje, cada campo con su `<label>`.
2. **Dado** el formulario, **cuando** lo envío con campos vacíos o un email inválido, **entonces** veo errores junto a cada campo y no se envía.
3. **Dado** el formulario válido, **cuando** lo envío, **entonces** veo un mensaje de confirmación.
4. **Dado** que el servicio falla, **cuando** lo envío, **entonces** veo un error y una alternativa (LinkedIn o WhatsApp).
5. **Dado** cualquier página, **entonces** el email de Julian **no** aparece en texto plano.
6. **Dado** el formulario, **entonces** tiene protección antispam (campo trampa o Turnstile de Cloudflare).

## Decisiones (2026-11-23)
- Servicio: **Pages Function** `functions/api/contacto.ts` + **Resend**. Lógica en `src/lib/contact-handler.ts` y validación compartida con el navegador en `src/lib/contact.ts` (tests en `tests/unit/contact.test.ts`).
- Secretos en Cloudflare Pages (nunca en el repo): `RESEND_API_KEY` y `CONTACT_TO` (el email de Julian). Opcional `CONTACT_FROM` cuando haya dominio verificado en Resend; mientras tanto el remitente es `onboarding@resend.dev`, que solo entrega al email de la cuenta de Resend.
- Antispam: campo trampa `website` + tiempo mínimo de 3 s (`elapsed`); en ambos casos se finge éxito. Sin Turnstile (sin scripts de terceros).
- Sin JavaScript el formulario hace un POST normal y la función redirige a `#enviado` o `#error-envio`, que se muestran con `:target`.
- CA5: la página imprimible `/cv/` (con el email) ya no se publica (`integrations/print-only.mjs`); el email solo está en los PDF.
- Alternativa en caso de error: LinkedIn (y WhatsApp cuando haya número).

## Notas
- Servicio por decidir: Web3Forms / Formspree, o Pages Function + Resend. En los tests e2e se simula la respuesta (`page.route`).
