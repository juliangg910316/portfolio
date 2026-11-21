# HU-12 · SEO y vista previa al compartir

**Como** Julian **quiero** que cada página tenga buen SEO **para** aparecer en Google y verse bien al compartirla en LinkedIn o WhatsApp.

- **Prioridad**: Alta · **Estado**: Hecha (2026-11-21) · **Tests**: `tests/e2e/HU-12-seo.spec.ts`

## Criterios de aceptación
1. **Dado** cualquier página, **entonces** tiene `<title>` y `<meta name="description">` propios, en su idioma.
2. **Dado** cualquier página, **entonces** tiene Open Graph y Twitter Card (título, descripción, imagen 1200×630).
3. **Dado** el sitio, **entonces** existen `/sitemap-index.xml` (con los 3 idiomas) y `/robots.txt`.
4. **Dado** cualquier página, **entonces** tiene `canonical` y `hreflang` (incluido `x-default`).
5. **Dado** el inicio, **entonces** incluye datos estructurados JSON-LD de tipo `Person`.
6. **Dado** una ruta inexistente, **entonces** responde 404 con una página propia.

## Notas
- Open Graph y Twitter Card en `Layout.astro`. Imagen **una por idioma** en `public/og/<lang>.png`, generada con `npm run og` (`scripts/og.ts`, colores de `global.css` y textos de `ui.ts`). Regenerarla al cambiar el dominio, el cargo o al tener la foto.
- `@astrojs/sitemap` con `hreflang`; los 404 quedan fuera. `robots.txt` lo genera `src/pages/robots.txt.ts` con la URL de `site`.
- JSON-LD `Person` en el inicio (sin email ni teléfono).
- 404 por idioma: `404.html`, `pt/404.html` y `en/404.html` (la integración `integrations/localized-404.mjs` los mueve tras el build; Cloudflare Pages sirve el más cercano). Llevan `noindex`, sin `canonical`, y el selector de idioma lleva al inicio.
- Lighthouse no puede medir páginas con estado 404; su accesibilidad la cubre axe en el test CA6.
