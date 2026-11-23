# HU-06 · Servicios

**Como** cliente potencial **quiero** ver qué servicios ofrece Julian **para** saber si encaja con mi proyecto.

- **Prioridad**: Media · **Estado**: Hecha · **Tests**: `tests/e2e/HU-06-servicios.spec.ts`

## Criterios de aceptación
1. **Dado** `/servicios`, **entonces** veo al menos: apps Flutter de principio a fin, MVP para startups, consultoría de arquitectura y migración de Android nativo a Flutter.
2. **Dado** cada servicio, **entonces** veo qué incluye y un proyecto real de ejemplo enlazado.
3. **Dado** `/servicios`, **entonces** veo cómo es el proceso de trabajo (pasos) y un botón para pedir presupuesto que lleva a contacto.

## Decisiones (2026-11-23)
- Datos en `src/content/servicios.yaml` (colección `servicios`). Ejemplos reales: SCA (apps de principio a fin), Studio Shaddai (MVP), SuperPay23 (arquitectura) y Apps de CCONet (migración: en CCONet Julian migró apps de React Native y de Android nativo a Flutter).
- «Servicios» entra en el menú, antes de Contacto. Las tarjetas de proyecto tienen `id` (ancla `/proyectos/#cconet`).
- «Pedir presupuesto» lleva a `/contacto/?motivo=proyecto`, que deja elegido ese motivo.
- Proceso en 5 pasos, sin plazos ni cifras.

## Notas
- Sin precios por ahora (decisión pendiente).
