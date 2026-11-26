# HU-15 · Logo de cada proyecto en su tarjeta

**Como** visitante **quiero** ver el logo de cada app en su tarjeta **para** reconocer los proyectos de un vistazo.

- **Prioridad**: Media · **Estado**: Hecha · **Tests**: `tests/e2e/HU-15-logos-proyectos.spec.ts`

## Criterios de aceptación
1. **Dado** un proyecto con logo, **entonces** su tarjeta (en Proyectos y en el carrusel del inicio) muestra el logo en lugar de la miniatura genérica.
2. **Dado** un proyecto sin logo, **entonces** su tarjeta mantiene la miniatura genérica.
3. **Dado** el logo, **entonces** es decorativo (el nombre del proyecto ya está en el título) y se sirve optimizado.
4. Funciona en ES, PT y EN, sin errores de accesibilidad y sin scroll horizontal a 360 px.

## Decisiones (2026-11-26)
- Logos en `src/assets/logos/`, enlazados con `logo:` en `proyectos.yaml`.
- Fuentes: Google Sites (ENZONA, SuperPay23, Centro de Distribución, DenunciApp), icono claro de iOS de SpinStreak (Rueda Viva) y monograma SVG de `shaddai-web` (Studio Shaddai).
- **Sin logo** a propósito:
  - Bowling App: su logo identifica la marca confidencial.
  - SCA: el icono es el escudo del cliente, que la web no nombra.
- **Sin logo de momento**: MiCerveza-Desafío (en Google Sites está recortado; falta el original), MeuBolso (aún tiene el icono de Flutter) y Apps de CCONet.
- El logo de DenunciApp solo existe a 72 px: se ve algo menos nítido.
