# MEMORY.md — Estado del proyecto

## Estado (2026-11-20)
- Repo creado: Astro 7 + TypeScript estricto + Tailwind v4, i18n ES/PT/EN, Vitest y Playwright (+ axe).
- Tokens de la propuesta A en `src/styles/global.css`.
- Backlog de 13 historias en `docs/BACKLOG.md`. **Siguiente: HU-01 (inicio).**
- Pendiente: crear el repo en GitHub, el proyecto en Cloudflare Pages y comprar el dominio.

## Decisiones
- 2026-11-20: Astro + Cloudflare Pages; historias de usuario + tests en lugar de SDD; diseño A · Noche Flutter (oscuro por defecto, modo claro basado en la propuesta B).
- El español va sin prefijo (`/`); portugués e inglés con prefijo (`/pt/`, `/en/`).

## Lecciones
- `astro preview` pasa solo a segundo plano cuando lo lanza un agente de IA (variable `AI_AGENT`), y Playwright cree que el servidor terminó. Por eso los tests e2e sirven `dist/` con `vite preview`.
