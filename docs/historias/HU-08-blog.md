# HU-08 · Blog

**Como** visitante **quiero** leer los artículos de Julian **para** conocer su criterio técnico.

- **Prioridad**: Media · **Estado**: Hecha · **Tests**: `tests/e2e/HU-08-blog.spec.ts`

## Criterios de aceptación
1. **Dado** `/blog`, **entonces** veo los artículos del más nuevo al más antiguo, con título, fecha, tiempo de lectura y etiquetas.
2. **Dado** un artículo, **entonces** se lee con buena tipografía y el código tiene resaltado de sintaxis.
3. **Dado** un artículo que no existe en mi idioma, **entonces** no aparece en el listado de ese idioma.
4. **Dado** el blog, **entonces** existe un feed RSS por idioma.

## Notas
- Fuente: los posts de LinkedIn del vault (Bloc vs Cubit, Patrón Repository, SDD, Manejo de errores…), ampliados.

## Decisiones (2026-11-23)
- 4 artículos iniciales a partir de los posts de LinkedIn: Bloc vs Cubit, Patrón Repository, Manejo de errores y Spec-Driven Development. Escritos en español y traducidos a PT y EN, con fecha de hoy. Julian los revisa antes de publicar.
- Un archivo Markdown por idioma en `src/content/blog/<lang>/`, con slug traducido. Las traducciones se enlazan con `translationKey` (hreflang y selector de idioma van al mismo artículo).
- Un slug que no existe en un idioma da 404; el selector de idioma cae en el blog de ese idioma si no hay traducción.
- Código con Shiki en dos temas (`github-light-default` / `github-dark-default`): los temas `github-light` y `github-dark` no llegaban a contraste AA en los comentarios.
- RSS por idioma en `<prefijo>/blog/rss.xml`, anunciado en el `<head>` de todas las páginas.
