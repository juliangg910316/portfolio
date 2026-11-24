# HU-13 · Demo de Flutter Web

**Como** reclutador **quiero** probar una app de Julian dentro de su caso de estudio **para** ver Flutter funcionando.

- **Prioridad**: Baja · **Estado**: Hecha · **Tests**: `tests/e2e/HU-13-demo-flutter.spec.ts`

## Criterios de aceptación
1. **Dado** el caso de estudio de Rueda Viva, **cuando** pulso "Probar demo", **entonces** se carga la demo (no antes, para no penalizar la carga).
2. **Dado** la demo, **entonces** tiene un título accesible y un enlace para abrirla a pantalla completa.
3. **Dado** un móvil, **entonces** la demo se abre a pantalla completa en lugar de incrustada.

## Notas
- Build de Flutter Web servido desde `public/demos/rueda-viva/` o un subdominio.

## Decisiones (2026-11-24)
- La versión web vive en la rama `feat/demo-web` de SpinStreak (worktree `../SpinStreak-demo-web`, creada desde `master`). drift usa `sqlite3.wasm` + `drift_worker.js`; los datos se guardan en el navegador del visitante.
- El build se copia en `public/demos/rueda-viva/` **sin** la carpeta `canvaskit/` (~36 MB): el motor de Flutter se carga desde la CDN oficial (gstatic). En el repo ocupa ~6 MB.
- «Probar demo» es un enlace a `/demos/rueda-viva/`: sin JS o por debajo de 768 px abre la demo a pantalla completa; en pantallas anchas un script la incrusta en un iframe al pulsar (no antes).
- La demo está solo en español (la app lo está) y lleva `noindex`.

### Regenerar la demo
```bash
cd ../SpinStreak-demo-web
flutter build web --release --base-href /demos/rueda-viva/
rsync -a --delete --exclude canvaskit/ --exclude '*.symbols' build/web/ ../portfolio/public/demos/rueda-viva/
```
