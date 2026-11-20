# HU-04 · Caso de estudio

**Como** reclutador **quiero** leer el detalle de un proyecto **para** valorar el nivel técnico de Julian.

- **Prioridad**: Alta · **Estado**: Pendiente · **Tests**: `tests/e2e/HU-04-caso-de-estudio.spec.ts`

## Criterios de aceptación
1. **Dado** `/proyectos`, **cuando** pulso un destacado, **entonces** voy a `/proyectos/<slug>`.
2. **Dado** un caso de estudio, **entonces** veo las secciones: Contexto, Mi rol, Stack y arquitectura, Decisiones técnicas, Retos y Resultado.
3. **Dado** un proyecto con enlaces (repo, tienda o demo), **entonces** se muestran como enlaces externos.
4. **Dado** un proyecto interno, **entonces** veo "App interna" y ningún enlace a tiendas.
5. **Dado** un caso de estudio, **entonces** al final hay enlaces al proyecto anterior y al siguiente y un botón de contacto.
6. **Dado** un slug que no existe, **entonces** veo la página 404.

## Notas
- Empezar por Rueda Viva (repo público). ENZONA solo con texto. Capturas de clientes solo con permiso.
