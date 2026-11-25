# HU-14 · Ver los certificados

**Como** reclutador **quiero** ver el certificado de un curso sin salir del inicio **para** comprobar que es real.

- **Prioridad**: Media · **Estado**: Hecha · **Tests**: `tests/e2e/HU-14-certificados.spec.ts`

## Criterios de aceptación
1. **Dado** un certificado con imagen en «Certificaciones y cursos», **cuando** lo pulso, **entonces** se abre una ventana flotante con su nombre y la imagen del certificado.
2. **Dado** la ventana abierta, **cuando** pulso Esc, el botón de cerrar o fuera de la imagen, **entonces** se cierra y el foco vuelve al certificado.
3. **Dado** un curso con varios certificados (Academia das IAs), **entonces** la ventana muestra todos, cada uno con su título.
4. **Dado** un curso sin certificado disponible (Domina Kotlin), **entonces** no es pulsable.
5. **Dado** el inicio, **entonces** las imágenes no se descargan hasta abrir la ventana; y sin JavaScript el elemento enlaza a la imagen.
6. Funciona en ES, PT y EN, sin errores de accesibilidad con la ventana abierta y sin scroll horizontal a 360 px.

## Decisiones (2026-11-25)
- Fuente: PDF del vault (`02 - Areas/Formación`). Se publica la **primera página** convertida en imagen (`src/assets/certificados/*.jpg`, 1600 px; Astro las sirve en WebP). Los PDF no se publican (el de BIG school pesa 8,5 MB).
- Se publica lo que lleva el certificado: nombre, fecha, firma del instructor e ID/QR de verificación. Nada más.
- `files` en `certificaciones.yaml` es opcional: sin archivo, el elemento no es pulsable.
- Ventana con `<dialog>` nativo (`showModal`): Esc, botón de cerrar y clic en el fondo.
- Pendiente: certificado de **Domina Kotlin** (LinkedIn Learning). Al tenerlo, añadir la imagen y `files` en el YAML.

### Añadir un certificado
```bash
qlmanage -t -s 2000 -o /tmp certificado.pdf     # primera página a PNG
sips -s format jpeg -s formatOptions 82 --resampleWidth 1600 /tmp/certificado.pdf.png --out src/assets/certificados/<id>.jpg
```
