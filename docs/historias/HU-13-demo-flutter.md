# HU-13 · Demo de Flutter Web

**Como** reclutador **quiero** probar una app de Julian dentro de su caso de estudio **para** ver Flutter funcionando.

- **Prioridad**: Baja · **Estado**: Pendiente · **Tests**: `tests/e2e/HU-13-demo-flutter.spec.ts`

## Criterios de aceptación
1. **Dado** el caso de estudio de Rueda Viva, **cuando** pulso "Probar demo", **entonces** se carga la demo (no antes, para no penalizar la carga).
2. **Dado** la demo, **entonces** tiene un título accesible y un enlace para abrirla a pantalla completa.
3. **Dado** un móvil, **entonces** la demo se abre a pantalla completa en lugar de incrustada.

## Notas
- Build de Flutter Web servido desde `public/demos/rueda-viva/` o un subdominio.
