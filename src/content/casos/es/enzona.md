---
---

## Contexto

ENZONA es la **plataforma nacional de pagos digitales de Cuba**: una app bancaria para Android con pagos y transferencias, mensajería en tiempo real y servicios de ubicación sobre mapas. Es un sistema crítico de seguridad que se usa en todo el país.

## Mi rol

Fui **miembro fundador** del proyecto y su **desarrollador móvil principal durante casi 8 años** en Xetid. Diseñé e implementé toda la arquitectura Android y mantuve la estabilidad en producción de una plataforma de escala nacional.

## Stack y arquitectura

- **Java nativo** con arquitectura **MVVM**.
- **SQLCipher** para la base de datos local cifrada.
- **MQTT y XMPP (Smack)** para la mensajería y las transacciones en tiempo real.
- **Retrofit** para el API, **Lottie** para las animaciones y **Sentry** para los errores en producción.
- **WorkManager** para tareas en segundo plano y **OpenStreetMap** para los mapas.
- **Seguridad**: autenticación biométrica, doble factor y cifrado RSA.
- **Tests** con JUnit y Mockito.

## Decisiones técnicas

- **Almacenamiento local cifrado.** En una app de pagos, los datos guardados en el móvil también tienen que ir cifrados. Integré SQLCipher con el apoyo de mi formación en criptografía.
- **Mensajería en tiempo real con MQTT y XMPP.** [PENDIENTE: por qué se eligieron estos protocolos]
- [PENDIENTE: otra decisión técnica explicada]

## Retos

[PENDIENTE: los retos principales y cómo los resolviste]

## Resultado

La app estuvo en producción a escala nacional durante años y se distribuye en Apklis, la tienda cubana de apps. [PENDIENTE: cifras de uso, si se pueden publicar]
