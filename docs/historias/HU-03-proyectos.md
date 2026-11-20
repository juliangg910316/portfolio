# HU-03 · Listado de proyectos

**Como** reclutador **quiero** ver los proyectos destacados y los demás, filtrados por tipo, **para** encontrar rápido lo que me interesa.

- **Prioridad**: Alta · **Estado**: Pendiente · **Tests**: `tests/e2e/HU-03-proyectos.spec.ts`

## Criterios de aceptación
1. **Dado** `/proyectos`, **entonces** veo primero los 6 destacados: ENZONA, SCA, Rueda Viva, Studio Shaddai, SuperPay23 y Centro de Distribución.
2. **Dado** `/proyectos`, **entonces** veo después "Otros proyectos": Bowling App, DenunciApp, MiCerveza-Desafío, MeuBolso y apps de CCONet.
3. **Dado** los filtros Mobile / Full-stack / Personal / Cliente, **cuando** elijo uno, **entonces** solo veo los proyectos de ese tipo; y sin JavaScript se ven todos.
4. **Dado** un proyecto interno, **entonces** su tarjeta muestra "App interna" y no tiene enlaces a tiendas.
5. **Dado** el inicio, **entonces** el carrusel muestra los 6 destacados y las flechas tienen nombre accesible.
6. **Dado** cualquier tarjeta, **entonces** muestra nombre, tipo, stack principal y enlaza a su caso de estudio.

## Notas
- Proyectos como colección de contenido (`src/content/proyectos/<idioma>/`), con esquema validado por Zod.
- Nunca usar el nombre "Lanetalk".
