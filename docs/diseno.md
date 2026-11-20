# Diseño — Propuesta A · Noche Flutter

Elegida el 2026-11-20. Lienzo con las 3 propuestas: https://claude.ai/artifact/MpjprRN8yDh8tBPvm6vJ28

## Paleta (modo oscuro, por defecto)

| Token Tailwind | Hex | Uso |
| --- | --- | --- |
| `bg` | `#06111F` | Fondo de la página |
| `surface` | `#0B1D33` | Tarjetas, menú |
| `border` | `#16304F` | Bordes de tarjetas y botones |
| `ink` | `#E6EEF7` | Texto principal |
| `ink-soft` | `#B4C3D4` | Párrafos |
| `ink-muted` | `#9DB0C6` | Texto secundario, etiquetas |
| `primary` | `#0175C2` | Botones principales (texto blanco) |
| `primary-deep` | `#02569B` | Hover de botones |
| `sky` | `#13B9FD` | Resaltes, títulos de sección, apellido |
| `link` | `#7FD3FF` | Enlaces |
| `success` | `#6EE7A8` | Insignia "Certificado" |
| `warning` | `#FFD666` | Etiqueta "App interna", icono de sol |

Modo claro (HU-11): pendiente, a partir de la propuesta B (fondo `#FFFFFF`/`#F2F7FC`, texto `#0B1B2B`, acento `#0175C2`, eyebrows `#02569B`).

## Tipografía
- **Títulos**: Space Grotesk 500/700 (`font-display`).
- **Texto**: Inter 400/500/600 (`font-sans`).
- Escala: h1 64 px (46 px en móvil), h2 40 px (30 px en móvil), cuerpo 17 px, etiquetas 13 px con `letter-spacing: 0.12em`.

## Estructura del inicio
1. **Menú** en cápsula (`surface`, radio 20 px): logo "JG" + "Julian.dev", enlaces, selector ES/PT/EN y botón de tema.
2. **Presentación**: iconos de LinkedIn, GitHub y WhatsApp → "Hola, soy" → **Julian Gutierrez** (apellido en `sky`) → "Mobile Tech Lead · Flutter & IA" → descripción → botones *Descargar CV* (relleno) y *Contrátame* (borde). A la derecha, un móvil con una pantalla de Rueda Viva y etiquetas flotantes.
3. **Sobre mí**: foto circular con borde `primary` + texto + 4 cifras (10+ años, ~10 apps, 4 devs, 5 países) + botón *Hablemos*.
4. **Formación**: lista de certificados con insignia "Certificado" + tarjeta de educación (máster en criptografía).
5. **Habilidades**: 6 tarjetas con icono y un dato real (sin barras de porcentaje).
6. **Proyectos destacados**: carrusel con flechas; tarjeta con miniatura, nombre, tipo y flecha. Etiqueta "App interna" en SuperPay23 y CD.
7. **Pie**: © y "Hecho con Astro · Curitiba, Brasil".

## Componentes
- Botones: alto 48 px, radio completo, texto 15 px semibold.
- Tarjetas: `surface` + borde `border`, radio 16–20 px.
- Iconos: SVG de trazo 2 px (estilo Lucide), `aria-hidden` cuando son decorativos.
- Objetivos táctiles ≥ 44 px.
