# HU-02 · Cambio de idioma

**Como** visitante **quiero** cambiar entre español, portugués e inglés sin perder la página en la que estoy **para** leer en mi idioma.

- **Prioridad**: Alta · **Estado**: Hecha (2026-11-21) · **Tests**: `tests/e2e/HU-02-idiomas.spec.ts`

## Criterios de aceptación
1. **Dado** cualquier página, **entonces** veo un selector ES / PT / EN y el idioma actual está marcado (`aria-current` o `aria-pressed`).
2. **Dado** que estoy en `/proyectos`, **cuando** elijo PT, **entonces** voy a `/pt/proyectos`.
3. **Dado** que estoy en `/en/`, **cuando** elijo ES, **entonces** voy a `/`.
4. **Dado** cualquier página, **entonces** `<html lang>` coincide con el idioma y hay `<link rel="alternate" hreflang>` para los 3 idiomas.
5. **Dado** cualquier idioma, **entonces** no aparece ningún texto de la interfaz en otro idioma.

## Notas
- Lógica ya hecha y probada en `src/i18n/utils.ts` (`localizePath`). Falta el componente del selector.
- **Sin redirección automática** por idioma del navegador (decidido el 2026-11-21): cada URL muestra siempre su idioma.
- Todas las URL llevan barra final (`trailingSlash: 'always'`), como las sirve Cloudflare Pages: `/pt/proyectos/`.
- Para probar el CA2 se crearon páginas mínimas de Proyectos (`ProjectsPage.astro`: título + entradilla) que HU-03 completará.
- Además de `hreflang` por idioma, hay `x-default` apuntando a la versión en español.
