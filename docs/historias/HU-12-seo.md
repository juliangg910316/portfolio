# HU-12 · SEO y vista previa al compartir

**Como** Julian **quiero** que cada página tenga buen SEO **para** aparecer en Google y verse bien al compartirla en LinkedIn o WhatsApp.

- **Prioridad**: Alta · **Estado**: Pendiente · **Tests**: `tests/e2e/HU-12-seo.spec.ts`

## Criterios de aceptación
1. **Dado** cualquier página, **entonces** tiene `<title>` y `<meta name="description">` propios, en su idioma.
2. **Dado** cualquier página, **entonces** tiene Open Graph y Twitter Card (título, descripción, imagen 1200×630).
3. **Dado** el sitio, **entonces** existen `/sitemap-index.xml` (con los 3 idiomas) y `/robots.txt`.
4. **Dado** cualquier página, **entonces** tiene `canonical` y `hreflang` (incluido `x-default`).
5. **Dado** el inicio, **entonces** incluye datos estructurados JSON-LD de tipo `Person`.
6. **Dado** una ruta inexistente, **entonces** responde 404 con una página propia.

## Notas
- Ya hay `canonical` y `hreflang` básicos en `Layout.astro`. Usar `@astrojs/sitemap`.
