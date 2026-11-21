# MEMORY.md — Estado del proyecto

## Estado (2026-11-21)
- Repo creado: Astro 7 + TypeScript estricto + Tailwind v4, i18n ES/PT/EN, Vitest y Playwright (+ axe).
- Tokens de la propuesta A en `src/styles/global.css`.
- Backlog de 13 historias en `docs/BACKLOG.md`. ✅ HU-01 (inicio), ✅ HU-02 (idiomas). **Siguiente: HU-12 (SEO).**
- Marcadores `[PENDIENTE]` en la web: foto (`About.astro`), WhatsApp (`social.whatsapp` en `src/i18n/links.ts`, hoy `https://wa.me/PENDIENTE`) y PDF del CV (`public/cv/julian-gutierrez-{es,pt,en}.pdf`, el botón da 404 hasta subirlos).
- Rutas del menú ya definitivas, con el mismo slug en los 3 idiomas y **barra final**: `/proyectos/`, `/experiencia/`, `/blog/`, `/contacto/` (y `/#sobre-mi`). Experiencia, Blog y Contacto dan 404 hasta su historia.
- `/proyectos/` (ES/PT/EN) existe como página mínima (`src/components/ProjectsPage.astro`): HU-03 la completa.
- Repo en GitHub: https://github.com/juliangg910316/portfolio (remoto por HTTPS, como los demás repos; no hay clave SSH en el Mac).
- Cloudflare Pages: proyecto `juliangg-portfolio` (Direct Upload; publica el CI) → https://juliangg-portfolio.pages.dev
- Pendiente: comprar el dominio y cambiar `site` en `astro.config.mjs`.

## Decisiones
- 2026-11-20: Astro + Cloudflare Pages; historias de usuario + tests en lugar de SDD; diseño A · Noche Flutter (oscuro por defecto, modo claro basado en la propuesta B).
- El español va sin prefijo (`/`); portugués e inglés con prefijo (`/pt/`, `/en/`).
- 2026-11-21 (HU-02): sin redirección automática por idioma del navegador; `trailingSlash: 'always'` porque Cloudflare Pages redirige `/x` → `/x/`; `hreflang` + `x-default` (español).
- 2026-11-21 (HU-01): el selector de idioma del menú son enlaces simples sin JS (HU-02 lo completará); sin botón de tema hasta HU-11; ilustración del móvil sin cifras inventadas.

## Lecciones
- `astro preview` pasa solo a segundo plano cuando lo lanza un agente de IA (variable `AI_AGENT`), y Playwright cree que el servidor terminó. Por eso los tests e2e sirven `dist/` con `vite preview`.
- Publicación: el token de Cloudflare necesita **solo** el permiso `Account · Cloudflare Pages · Edit`, sin filtro de IP (los runners de GitHub cambian de IP). Ojo: "Access: Custom Pages" es de Zero Trust, no sirve. Primera publicación correcta el 2026-11-21.
- En zsh no usar `path` como variable de bucle: está ligada a `PATH` y rompe los comandos.
- Lighthouse en local: `CHROME_PATH` = chromium de Playwright; servir `dist/` con `vite preview` en otro puerto. Hace falta `public/robots.txt` (sin él, el servidor devuelve el HTML y SEO baja a 92). La primera medición en frío puede dar ~94 en rendimiento: repetir.
- Las claves de `src/i18n/ui.ts` deben ser las mismas en los 3 idiomas (lo comprueba `tests/unit/i18n.test.ts`); el test CA5 de HU-02 falla si una página muestra un texto exclusivo de otro idioma.
