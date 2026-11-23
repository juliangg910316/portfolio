# AGENTS.md — Portafolio de Julian Gutierrez

Web personal: **Mobile Tech Lead · Flutter + Clean Architecture + IA**. Objetivo doble: **empleo** y **clientes freelance**.

- **Stack**: Astro (sitio estático) + TypeScript estricto + Tailwind CSS v4.
- **Idiomas**: español (por defecto, sin prefijo), portugués (`/pt/`) e inglés (`/en/`).
- **Hosting**: Cloudflare Pages. Dominio propio (pendiente de comprar; cambiar `site` en `astro.config.mjs`).
- **Diseño**: propuesta **A · Noche Flutter** → [`docs/diseno.md`](docs/diseno.md).
- Idioma de trabajo: **español** (docs, commits, historias).

## Forma de trabajo: historias de usuario + tests primero

No se usa SDD (sin constitución ni specs EARS). Cada funcionalidad es una **historia de usuario** en [`docs/historias/`](docs/historias/), y el backlog está en [`docs/BACKLOG.md`](docs/BACKLOG.md).

Ciclo por historia:
1. Leer la historia y sus criterios de aceptación (Dado / Cuando / Entonces). Si algo es ambiguo, **preguntar antes de programar**.
2. **Rojo**: escribir un test e2e en `tests/e2e/HU-XX-<nombre>.spec.ts` por cada criterio (`test('CA1 …')`). Ejecutarlo y ver que falla.
3. **Verde**: implementar lo mínimo para que pase. La lógica pura (i18n, fechas, filtros) va en `src/` con tests unitarios en `tests/unit/` (Vitest).
4. **Refactorizar** y comprobar la **Definición de Hecho**.
5. Commit `feat(HU-XX): <resumen>` y marcar la historia en `docs/BACKLOG.md` y en `MEMORY.md`.

### Definición de Hecho (todas las historias)
- [ ] Tests e2e de todos los criterios en verde, en escritorio y móvil (`npm run test:e2e`).
- [ ] Tests unitarios en verde (`npm test`) y `npm run check` sin errores.
- [ ] Funciona en **ES, PT y EN** (sin textos sin traducir).
- [ ] **Sin errores de accesibilidad** (helper `expectNoA11yViolations` de `tests/e2e/a11y.ts`).
- [ ] Se ve bien a 360 px de ancho, sin scroll horizontal.
- [ ] Lighthouse ≥ 95 en rendimiento, accesibilidad, buenas prácticas y SEO.

## Comandos

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo (los agentes: `npx astro dev --background`) |
| `npm run build` | Build estático en `dist/` |
| `npm test` | Tests unitarios (Vitest) |
| `npm run test:e2e` | Build + tests e2e (Playwright, escritorio y móvil) |
| `npm run check` | Comprobación de tipos de Astro |
| `npm run og` | Regenera las imágenes Open Graph (`public/og/<lang>.png`) |
| `npm run cv` | Regenera el CV en PDF de cada idioma (`public/cv/julian-gutierrez-<lang>.pdf`) |

## Estructura

```
src/
  i18n/        textos de la interfaz (ui.ts) y utilidades de idioma (utils.ts)
  layouts/     Layout.astro: <html lang>, SEO, hreflang, fuentes
  pages/       rutas: index.astro (es), pt/, en/
  styles/      global.css con los tokens del diseño (@theme)
  lib/         lógica pura (proyectos, fechas, contacto)
functions/     Cloudflare Pages Functions (api/contacto.ts)
integrations/  integraciones de Astro propias (404 por idioma, páginas solo para imprimir)
tests/
  unit/        Vitest
  e2e/         Playwright (+ a11y.ts con axe)
docs/
  BACKLOG.md   lista de historias y estado
  historias/   una historia por archivo
  diseno.md    paleta, tipografía y estructura del inicio
```

## Reglas

- **Textos**: nunca escritos a mano en los componentes; van en `src/i18n/ui.ts` (o en colecciones de contenido por idioma). Las tres traducciones a la vez.
- **Colores y fuentes**: solo con los tokens de `global.css` (`bg-surface`, `text-ink-muted`, `font-display`…). Nada de hex sueltos.
- **Contenido real**: no inventar cifras, fechas ni proyectos. Si falta un dato, dejar `[PENDIENTE: …]` y avisar.
- **Confidencialidad**: no usar el nombre comercial "Lanetalk" (la app es **"Bowling App"**). SuperPay23, CD, DenunciApp y MiCerveza-Desafío son apps internas: **sin enlaces** a tiendas y con la etiqueta "App interna".
- **Rendimiento**: JavaScript solo cuando sea imprescindible (islas de Astro). Imágenes con `astro:assets`.
- **Accesibilidad**: elementos nativos (`<a>`, `<button>`), `aria-label` en botones de icono, contraste AA.
- Commits en español con Conventional Commits (`feat`, `fix`, `test`, `docs`, `chore`).

## Documentación de Astro

Servidor en segundo plano para agentes: `astro dev --background` (`astro dev stop|status|logs`). Guías: [rutas](https://docs.astro.build/en/guides/routing/), [componentes](https://docs.astro.build/en/basics/astro-components/), [colecciones de contenido](https://docs.astro.build/en/guides/content-collections/), [estilos y Tailwind](https://docs.astro.build/en/guides/styling/), [i18n](https://docs.astro.build/en/guides/internationalization/).
