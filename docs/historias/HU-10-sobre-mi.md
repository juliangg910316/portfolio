# HU-10 · Sobre mí

**Como** visitante **quiero** conocer la historia de Julian **para** saber quién hay detrás del código.

- **Prioridad**: Media · **Estado**: Hecha · **Tests**: `tests/e2e/HU-10-sobre-mi.spec.ts`

## Criterios de aceptación
1. **Dado** `/sobre-mi`, **entonces** veo la historia: matemáticas y criptografía → ENZONA → remoto internacional → Tech Lead en Brasil.
2. **Dado** la página, **entonces** veo una foto con texto alternativo descriptivo.
3. **Dado** la página, **entonces** veo idiomas que hablo y qué valoro al trabajar, y un botón de contacto.

## Decisiones (2026-11-23)
- «Sobre mí» del menú lleva a `/sobre-mi/`; la sección del inicio queda como resumen con el enlace «Leer mi historia».
- Foto: `src/assets/julian.jpg` (de Julian, sin datos de ubicación), con `astro:assets` (WebP, recorte circular) mediante `Photo.astro`, en el inicio y en `/sobre-mi/`. Texto alternativo en `about.photo.alt`.
- Historia en 4 pasos con datos del CV; valores de la nota del portafolio (código limpio, mentoría, productividad con IA); idiomas con los niveles del CV.
- Toque personal: la bici estática y Rueda Viva.
