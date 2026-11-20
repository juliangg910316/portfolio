# HU-11 · Modo claro y oscuro

**Como** visitante **quiero** elegir modo claro u oscuro **para** leer cómodo.

- **Prioridad**: Media · **Estado**: Pendiente · **Tests**: `tests/e2e/HU-11-tema.spec.ts`

## Criterios de aceptación
1. **Dado** mi primera visita, **entonces** se usa la preferencia del sistema (`prefers-color-scheme`); si no hay, oscuro.
2. **Dado** el botón de tema, **cuando** lo pulso, **entonces** cambia el tema y su `aria-label` describe la acción siguiente.
3. **Dado** que elegí un tema, **cuando** recargo o cambio de página, **entonces** se mantiene, sin parpadeo inicial.
4. **Dado** cualquiera de los dos temas, **entonces** no hay errores de contraste (axe).

## Notas
- Paleta clara a partir de la propuesta B (ver `docs/diseno.md`).
