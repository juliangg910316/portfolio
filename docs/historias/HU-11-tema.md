# HU-11 · Modo claro y oscuro

**Como** visitante **quiero** elegir modo claro u oscuro **para** leer cómodo.

- **Prioridad**: Media · **Estado**: Hecha · **Tests**: `tests/e2e/HU-11-tema.spec.ts`

## Criterios de aceptación
1. **Dado** mi primera visita, **entonces** se usa la preferencia del sistema (`prefers-color-scheme`); si no hay, oscuro.
2. **Dado** el botón de tema, **cuando** lo pulso, **entonces** cambia el tema y su `aria-label` describe la acción siguiente.
3. **Dado** que elegí un tema, **cuando** recargo o cambio de página, **entonces** se mantiene, sin parpadeo inicial.
4. **Dado** cualquiera de los dos temas, **entonces** no hay errores de contraste (axe).

## Decisiones (2026-11-23)
- El tema va en `data-theme` de `<html>`, lo fija un script en línea al principio de `<head>` (sin parpadeo) y se guarda en `localStorage` (`tema`).
- Orden: elección guardada > `prefers-color-scheme` > oscuro. Los navegadores actuales tratan «sin preferencia» como claro, así que el oscuro por defecto se aplica cuando el navegador no informa de la preferencia.
- Sin JavaScript se sigue la preferencia del sistema con CSS y el botón no se muestra.
- Mientras no se elija tema, la web sigue los cambios del sistema.
- Código de los casos de estudio: Shiki con `github-light` y `github-dark`.
- A menos de 400 px el texto «Julian.dev» del logo queda solo para lectores de pantalla, para que quepa el botón.

## Notas
- Paleta clara a partir de la propuesta B (ver `docs/diseno.md`).
