# HU-05 · Trayectoria y CV

**Como** reclutador **quiero** ver la trayectoria profesional y descargar el CV en mi idioma **para** tenerlo a mano.

- **Prioridad**: Alta · **Estado**: Hecha · **Tests**: `tests/e2e/HU-05-trayectoria-cv.spec.ts`

## Criterios de aceptación
1. **Dado** `/experiencia`, **entonces** veo una línea de tiempo, de la más reciente a la más antigua: CCONet, SCA (freelance), Treew, Dofleini, DSpot y Xetid.
2. **Dado** cada experiencia, **entonces** veo cargo, empresa, fechas, lugar/modalidad y 2–4 logros.
3. **Dado** `/experiencia`, **entonces** veo la formación: Máster (2014–2018) y Licenciatura en Matemáticas (2009–2014), Universidad de La Habana.
4. **Dado** cualquier idioma, **cuando** pulso "Descargar CV", **entonces** descargo el PDF de ese idioma.
5. **Dado** el inicio, **entonces** veo la sección de certificaciones con su plataforma y una tarjeta de educación.

## Decisiones (2026-11-23)
- Datos en `src/content/experiencia.yaml`, `formacion.yaml` y `certificaciones.yaml` (una sola fuente para la web y el CV).
- Orden de la línea de tiempo por el campo `order`: CCONet (trabajo principal) va antes que SCA aunque SCA empezó después.
- El CV en PDF se genera con `npm run cv` desde la página imprimible `/cv/` (`/pt/cv/`, `/en/cv/`): `noindex` y fuera del sitemap. Es la **única** página con el email (decisión de Julian).
- Los botones "Descargar CV" usan el atributo `download`.

## Notas
- Fechas: DSpot jun.–dic. 2022, Dofleini abr.–dic. 2023 (las de Google Sites).
- Datos extra de Xetid: PKI con BouncyCastle, reconocimiento facial, tesis sobre generadores pseudoaleatorios.
