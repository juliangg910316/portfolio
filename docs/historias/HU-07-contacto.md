# HU-07 · Formulario de contacto

**Como** visitante **quiero** enviar un mensaje desde la web **para** contactar sin buscar el email.

- **Prioridad**: Alta · **Estado**: Pendiente · **Tests**: `tests/e2e/HU-07-contacto.spec.ts`

## Criterios de aceptación
1. **Dado** `/contacto`, **entonces** veo un formulario con nombre, email, motivo (empleo / proyecto / otro) y mensaje, cada campo con su `<label>`.
2. **Dado** el formulario, **cuando** lo envío con campos vacíos o un email inválido, **entonces** veo errores junto a cada campo y no se envía.
3. **Dado** el formulario válido, **cuando** lo envío, **entonces** veo un mensaje de confirmación.
4. **Dado** que el servicio falla, **cuando** lo envío, **entonces** veo un error y una alternativa (LinkedIn o WhatsApp).
5. **Dado** cualquier página, **entonces** el email de Julian **no** aparece en texto plano.
6. **Dado** el formulario, **entonces** tiene protección antispam (campo trampa o Turnstile de Cloudflare).

## Notas
- Servicio por decidir: Web3Forms / Formspree, o Pages Function + Resend. En los tests e2e se simula la respuesta (`page.route`).
