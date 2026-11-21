# HU-04 · Caso de estudio

**Como** reclutador **quiero** leer el detalle de un proyecto **para** valorar el nivel técnico de Julian.

- **Prioridad**: Alta · **Estado**: Hecha (2026-11-21) · **Tests**: `tests/e2e/HU-04-caso-de-estudio.spec.ts`

## Criterios de aceptación
1. **Dado** `/proyectos`, **cuando** pulso un destacado, **entonces** voy a `/proyectos/<slug>`.
2. **Dado** un caso de estudio, **entonces** veo las secciones: Contexto, Mi rol, Stack y arquitectura, Decisiones técnicas, Retos y Resultado.
3. **Dado** un proyecto con enlaces (repo, tienda o demo), **entonces** se muestran como enlaces externos.
4. **Dado** un proyecto interno, **entonces** veo "App interna" y ningún enlace a tiendas.
5. **Dado** un caso de estudio, **entonces** al final hay enlaces al proyecto anterior y al siguiente y un botón de contacto.
6. **Dado** un slug que no existe, **entonces** veo la página 404.

## Notas
- Empezar por Rueda Viva (repo público). ENZONA solo con texto. Capturas de clientes solo con permiso.
- Contenido en `src/content/casos/<idioma>/<slug>.md`: las 6 secciones como `##` (lo comprueba `tests/unit/casos.test.ts`). Los enlaces externos van en `src/content/proyectos.yaml` (`links`); Zod impide enlaces a tiendas en apps internas.
- Enlaces publicados (2026-11-21): repo de Rueda Viva, web y repo de Studio Shaddai, ENZONA en Apklis.
- Textos escritos solo con datos del CV, las notas del vault y Google Sites. Lo que falta está marcado con `[PENDIENTE: …]` (sobre todo decisiones, retos y resultados de ENZONA, SuperPay23 y CD): buscar con `grep -rn PENDIENTE src/content/casos/es`.
- Anterior/siguiente en orden circular entre los 6 destacados.
