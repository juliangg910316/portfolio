---
---

## Contexto

Centro de Distribución es una **app interna de logística** de Treew (Canadá): recepción de mercancía, entradas y salidas de inventario, asignación de ubicaciones en el almacén, proveedores y categorías, despacho de pedidos e **impresión de etiquetas**. Al ser una app interna, no hay enlaces ni capturas.

## Mi rol

Desarrollador Flutter en Treew, entre 2024 y 2025. Me uní cuando la app ya existía para añadir una funcionalidad completa: **leer el QR de los productos del almacén**, mostrarlos en una lista en la app y **despacharlos**.

## Stack y arquitectura

**DDD con Clean Architecture.**

- **Flutter**. **Estado**: BLoC y GetX. **Inyección de dependencias**: GetIt.
- **Lectura de códigos** de barras y QR con Scandit, y **OCR** con Tesseract.
- **Almacenamiento local** con Hive, SQLite y SharedPreferences.
- **API REST** con Dio, **Firebase** Analytics y Crashlytics, y geolocalización.

## Decisiones técnicas

- **Modo sin conexión.** Los datos se guardan en el dispositivo (Hive y SQLite) para poder seguir trabajando en el almacén aunque no haya red.
- **Una lección sobre el estado.** Las decisiones de arquitectura son anteriores a mi llegada. La app mezcla BLoC y GetX porque, a lo largo de su desarrollo, distintos desarrolladores fueron añadiendo cada uno su gestor de estado. Esa mezcla complica el mantenimiento, y por eso en mis proyectos el gestor de estado queda fijado en las reglas desde el primer día.

## Retos

[PENDIENTE: los retos principales y cómo los resolviste]

## Resultado

La app se probó y se distribuyó a todos los almacenes de la empresa.
