# HU-01 · Inicio con propuesta de valor

**Como** visitante (reclutador o cliente) **quiero** ver en el inicio quién es Julian, qué hace y sus cifras **para** entenderlo en 10 segundos.

- **Prioridad**: Alta · **Estado**: Pendiente · **Tests**: `tests/e2e/HU-01-inicio.spec.ts`

## Criterios de aceptación
1. **Dado** que abro `/`, **entonces** veo un único `<h1>` con "Julian Gutierrez", el cargo "Mobile Tech Lead" y una descripción de una o dos frases.
2. **Dado** el inicio, **entonces** veo los botones "Descargar CV" (enlace a un PDF) y "Contrátame" (lleva a contacto).
3. **Dado** el inicio, **entonces** veo enlaces a LinkedIn, GitHub y WhatsApp, cada uno con un nombre accesible.
4. **Dado** el inicio, **entonces** veo la sección "Sobre mí" con 4 cifras: 10+ años, ~10 apps, 4 devs y 5 países.
5. **Dado** el inicio, **entonces** veo el menú con: Inicio, Sobre mí, Proyectos, Experiencia, Blog y Contacto.
6. **Dado** un móvil de 360 px, **entonces** no hay scroll horizontal y el menú se puede usar.
7. **Dado** `/pt/` y `/en/`, **entonces** los mismos elementos aparecen traducidos.

## Notas
- Diseño: `docs/diseno.md`, secciones 1–3. Las secciones de formación, habilidades y proyectos del inicio llegan con HU-03, HU-05 y siguientes.
- Pendiente: foto profesional, URL de LinkedIn/GitHub/WhatsApp y PDF del CV en 3 idiomas.
