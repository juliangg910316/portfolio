# HU-03 · Listado de proyectos

**Como** reclutador **quiero** ver los proyectos destacados y los demás, filtrados por tipo, **para** encontrar rápido lo que me interesa.

- **Prioridad**: Alta · **Estado**: Hecha (2026-11-21) · **Tests**: `tests/e2e/HU-03-proyectos.spec.ts`

## Criterios de aceptación
1. **Dado** `/proyectos`, **entonces** veo primero los 6 destacados: ENZONA, SCA, Rueda Viva, Studio Shaddai, SuperPay23 y Centro de Distribución.
2. **Dado** `/proyectos`, **entonces** veo después "Otros proyectos": Bowling App, DenunciApp, MiCerveza-Desafío, MeuBolso y apps de CCONet.
3. **Dado** los filtros Todos / Empleo / Cliente / Personal, **cuando** elijo uno, **entonces** solo veo los proyectos de ese tipo; y sin JavaScript se ven todos.
4. **Dado** un proyecto interno, **entonces** su tarjeta muestra "App interna" y no tiene enlaces a tiendas.
5. **Dado** el inicio, **entonces** el carrusel muestra los 6 destacados y las flechas tienen nombre accesible.
6. **Dado** cualquier tarjeta, **entonces** muestra nombre, tipo y stack principal; las de los **destacados** enlazan a su caso de estudio (los "otros" son tarjetas cortas sin enlace).

## Notas
- Proyectos como colección de contenido en **un solo archivo** `src/content/proyectos.yaml` (textos en ES/PT/EN dentro de cada entrada), validada con Zod en `src/content.config.ts`. La clave de cada entrada es el slug del caso de estudio.
- Decisiones (2026-11-21): filtros **Empleo / Cliente / Personal** en lugar de Mobile / Full-stack (todos son móviles); "Full-stack" pasa a ser una etiqueta (SCA). Filtros **solo con CSS** (radios + `:has()`), sin JavaScript. MeuBolso y Studio Shaddai con la etiqueta "En desarrollo". "App interna": SuperPay23, CD, DenunciApp y MiCerveza-Desafío.
- Las tarjetas de los destacados enlazan a `/proyectos/<slug>/`, que da 404 hasta HU-04.
- Datos sacados del CV, las notas del vault y el portafolio de Google Sites. Sin capturas todavía: miniatura esquemática.
- Nunca usar el nombre "Lanetalk".
