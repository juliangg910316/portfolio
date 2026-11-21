---
---

## Contexto

Studio Shaddai es un salón de uñas de Curitiba. Las clientas necesitaban ver los servicios y **reservar turnos** según la disponibilidad del salón, y la dueña, gestionar su agenda. Al empezar, el código estaba repartido en dos repositorios: una app con Firebase y reservas, y una web con el diseño definitivo.

## Mi rol

Es un proyecto para una clienta. Me encargo del desarrollo completo de la app para **Android, iOS y Web**: arquitectura, unificación de los dos repositorios, conexión con Firebase y publicación de la web en dshaddai.com.

## Stack y arquitectura

Arquitectura **por funcionalidades** (`core`, `data`, `features`), con una sola dirección:

```text
features → data → Firebase
```

- **Flutter** para Android, iOS y Web con un solo código.
- **Estado**: Riverpod. **Navegación**: go_router.
- **Backend 100 % Firebase**: Auth con Google Sign-In, Firestore, Cloud Messaging y Cloud Functions.
- **Tema claro y oscuro** (oscuro por defecto) y la interfaz en español y portugués, con selector manual.

## Decisiones técnicas

- **Un solo repositorio.** La base es la app (conexión con Firebase y reservas) y de la web se traen el tema, la tipografía, el selector de idioma y la landing.
- **Las mismas funciones, una interfaz por plataforma.** En la web, una landing de una página en la que el scroll es la estructura; en Android e iOS, navegación con barra inferior. Los datos y la lógica se comparten.
- **Solo la capa de datos habla con Firebase.** Los repositorios reciben Firestore y Auth como parámetros opcionales para poder usar dobles en los tests.
- **Servicios y precios en Firestore**, en lugar de estar escritos en el código y en los archivos de traducción.

## Retos

- **Calcular los huecos libres** de la agenda según la disponibilidad que configura la administradora.
- **Panel de administración**: confirmar o cancelar turnos, contactar por WhatsApp, configurar el calendario y bloquear clientas.
- **Unir dos proyectos** con arquitecturas distintas sin perder la conexión con Firebase.

## Resultado

La web está publicada en dshaddai.com. Quedan las notificaciones push, las Cloud Functions y las reglas de seguridad de Firestore, y la meta es publicar la app en Google Play y App Store. [PENDIENTE: estado y fecha de la publicación en las tiendas]
