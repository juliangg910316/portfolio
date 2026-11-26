# MEMORY.md — Estado del proyecto

## Estado (2026-11-23)
- Repo creado: Astro 7 + TypeScript estricto + Tailwind v4, i18n ES/PT/EN, Vitest y Playwright (+ axe).
- Tokens de la propuesta A en `src/styles/global.css`.
- Backlog de 15 historias en `docs/BACKLOG.md`. ✅ HU-01 (inicio), ✅ HU-02 (idiomas), ✅ HU-12 (SEO), ✅ HU-03 (proyectos), ✅ HU-04 (casos de estudio), ✅ HU-05 (trayectoria y CV), ✅ HU-07 (contacto), ✅ HU-11 (tema), ✅ HU-06 (servicios), ✅ HU-10 (sobre mí), ✅ HU-08 (blog), ✅ HU-09 (cómo trabajo), ✅ HU-13 (demo Flutter Web), ✅ HU-14 (ver certificados), ✅ HU-15 (logos de proyectos). **Backlog completo.**
- Casos de estudio con huecos `[PENDIENTE: …]` (ES/PT/EN): `grep -rn PENDIENTE src/content/casos/es` para ver la lista. Al rellenarlos, cambiar los 3 idiomas.
- Foto de Julian en `src/assets/julian.jpg` (componente `Photo.astro`).
- Pendiente de Julian: hacer un **test de inglés** para validar el nivel. Desde el 2026-11-25 la web y el CV dicen «Intermedio» (antes «Profesional básico»); si el test da otro nivel, cambiar `aboutPage.lang.en.level` y `cv.languages` en `src/i18n/ui.ts` (3 idiomas) y regenerar el CV (`npm run cv`).
- Marcadores `[PENDIENTE]` en la web: WhatsApp (`social.whatsapp` en `src/i18n/links.ts`, hoy `https://wa.me/PENDIENTE`).
- CV en PDF: **generado** con `npm run cv` desde `/cv/` (datos de `experiencia.yaml`, `formacion.yaml`, `certificaciones.yaml` y las claves `cv.*` de `ui.ts`). La página `/cv/` solo existe con `CV_PRINT=1`; no se publica. Volver a ejecutarlo y hacer commit de `public/cv/` cada vez que cambien esos datos.
- Rutas del menú ya definitivas, con el mismo slug en los 3 idiomas y **barra final**: `/proyectos/`, `/experiencia/`, `/blog/`, `/contacto/` (y `/#sobre-mi`). Blog da 404 hasta su historia.
- Proyectos: datos en `src/content/proyectos.yaml` (colección `proyectos`, esquema en `src/content.config.ts`); lógica pura en `src/lib/projects.ts`. Listado en `ProjectsPage.astro`, carrusel del inicio en `FeaturedProjects.astro` (único JS: las flechas).
- Contacto: Pages Function `functions/api/contacto.ts` + Resend. **Pendiente de Julian**: crear la cuenta de Resend y poner los secretos `RESEND_API_KEY` y `CONTACT_TO` en Cloudflare Pages (`npx wrangler pages secret put <NOMBRE> --project-name=juliangg-portfolio`). Sin ellos el formulario muestra el error con la alternativa de LinkedIn. En local van en `.dev.vars` (ignorado por git).
- Repo en GitHub: https://github.com/juliangg910316/portfolio (remoto por HTTPS, como los demás repos; no hay clave SSH en el Mac).
- Cloudflare Pages: proyecto `juliangg-portfolio` (Direct Upload; publica el CI) → https://juliangg-portfolio.pages.dev
- Pendiente: comprar el dominio y cambiar `site` en `astro.config.mjs` → después **`npm run og`** (la URL sale en la imagen). `robots.txt`, sitemap, canonical y OG toman `site` solos.

## Decisiones
- 2026-11-26 (HU-15): logos en las tarjetas (`logo:` en `proyectos.yaml`, archivos en `src/assets/logos/`). Bowling App y SCA sin logo a propósito (confidencialidad). Pendiente: logo completo de MiCerveza-Desafío; MeuBolso y CCONet sin logo.
- 2026-11-25 (HU-14): certificados en ventana (`<dialog>`) desde el inicio; imágenes = 1.ª página de los PDF del vault en `src/assets/certificados/` (los PDF no se publican). Pendiente: certificado de Domina Kotlin. Marca del menú: JulianGG (antes Julian.dev).
- 2026-11-24 (HU-13): demo web de Rueda Viva en `public/demos/rueda-viva/` (build de la rama `feat/demo-web` de SpinStreak, sin `canvaskit/`: el motor sale de la CDN de Flutter). Cómo regenerarla: `docs/historias/HU-13-demo-flutter.md`. La rama de SpinStreak no tiene push.
- 2026-11-24 (HU-09): `/como-trabajo/` en el menú (8 entradas → menú en su propia línea por debajo de `xl`); Rueda Viva 6 specs / 43 tareas / 25 commits. Pendiente: que Julian revise las descripciones de Cursor y Copilot.
- 2026-11-23 (HU-08): 4 artículos (ES + traducciones PT/EN) con slug por idioma enlazado por `translationKey`; RSS por idioma; Shiki `github-*-default` por contraste AA de los comentarios. Pendiente: que Julian revise los textos.
- 2026-11-23 (HU-10): página `/sobre-mi/` en el menú; foto con `astro:assets`; toque personal: bici estática → Rueda Viva.
- 2026-11-23 (HU-06): «Servicios» en el menú; ejemplo de migración = apps de CCONet (React Native y Android nativo → Flutter, dato de Julian); sin precios.
- 2026-11-23 (HU-11): tema en `data-theme` con script en línea en `<head>`; elección guardada > sistema > oscuro; tokens claros en `global.css` con los mismos nombres.
- 2026-11-23 (HU-07): Pages Function + Resend; antispam con campo trampa + tiempo mínimo (sin Turnstile); `/cv/` deja de publicarse, el email solo está en los PDF.
- 2026-11-23 (HU-05): el CV en PDF se genera desde la web (una sola fuente); el email solo aparece en `/cv/` y en los PDF (noindex, fuera del sitemap), nunca en las demás páginas.
- 2026-11-20: Astro + Cloudflare Pages; historias de usuario + tests en lugar de SDD; diseño A · Noche Flutter (oscuro por defecto, modo claro basado en la propuesta B).
- El español va sin prefijo (`/`); portugués e inglés con prefijo (`/pt/`, `/en/`).
- 2026-11-21 (HU-04): los 6 casos publicados aunque tengan huecos `[PENDIENTE]`; enlaces externos solo los confirmados por Julian.
- 2026-11-21 (HU-03): filtros Empleo/Cliente/Personal solo con CSS; solo los 6 destacados tienen caso de estudio; MeuBolso y Studio Shaddai "En desarrollo".
- 2026-11-21 (HU-12): imagen OG por idioma generada por script (no en cada build); 404 propio por idioma; JSON-LD `Person` sin datos de contacto.
- 2026-11-21 (HU-02): sin redirección automática por idioma del navegador; `trailingSlash: 'always'` porque Cloudflare Pages redirige `/x` → `/x/`; `hreflang` + `x-default` (español).
- 2026-11-21 (HU-01): el selector de idioma del menú son enlaces simples sin JS (HU-02 lo completará); sin botón de tema hasta HU-11; ilustración del móvil sin cifras inventadas.

## Lecciones
- Los tests e2e sirven `dist/` con **`wrangler pages dev`** (como Cloudflare: 404 reales, `404.html` por carpeta, 308 a la barra final). `astro preview` pasa a segundo plano cuando lo lanza un agente de IA y `vite preview` responde 200 a cualquier ruta.
- Publicación: el token de Cloudflare necesita **solo** el permiso `Account · Cloudflare Pages · Edit`, sin filtro de IP (los runners de GitHub cambian de IP). Ojo: "Access: Custom Pages" es de Zero Trust, no sirve. Primera publicación correcta el 2026-11-21.
- En zsh no usar `path` como variable de bucle: está ligada a `PATH` y rompe los comandos.
- Lighthouse en local: `CHROME_PATH` = chromium de Playwright; servir `dist/` con `wrangler pages dev` en otro puerto. Lighthouse no mide páginas con estado 404. La primera medición en frío puede dar ~94 en rendimiento: repetir.
- Los nombres propios del contenido que coinciden con textos de otro idioma (p. ej. el curso "Flutter Experience" frente a "Experience") se excluyen en `nombresPropios` del test CA5 de HU-02.
- Playwright/Chromium emula `colorScheme: 'no-preference'` como claro: para probar el «oscuro por defecto» se quita `window.matchMedia`.
- Colores nuevos: siempre como token en los dos temas (oscuro en `@theme`, claro en `:root[data-theme="light"]` y en el bloque `@media (prefers-color-scheme: light)`); axe en modo claro lo comprueba HU-11 CA4.
- `*.pages.dev` no permite vaciar la caché desde el panel (no es una zona tuya): la copia vieja de `/cv/` se cacheó con `s-maxage=604800` (7 días). Con el dominio propio se podrá purgar desde Caching.
- Las claves de `src/i18n/ui.ts` deben ser las mismas en los 3 idiomas (lo comprueba `tests/unit/i18n.test.ts`); el test CA5 de HU-02 falla si una página muestra un texto exclusivo de otro idioma.
