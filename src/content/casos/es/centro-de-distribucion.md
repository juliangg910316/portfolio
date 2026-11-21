---
---

## Contexto

Centro de Distribución es una **app interna de logística** de Treew (Canadá): recepción de mercancía, entradas y salidas de inventario, asignación de ubicaciones en el almacén, proveedores y categorías, despacho de pedidos e **impresión de etiquetas**. Al ser una app interna, no hay enlaces ni capturas.

## Mi rol

Desarrollador Flutter de la app en Treew, entre 2024 y 2025. [PENDIENTE: qué partes hiciste tú y cuáles el equipo]

## Stack y arquitectura

**DDD con Clean Architecture.**

- **Flutter**. **Estado**: BLoC y GetX. **Inyección de dependencias**: GetIt.
- **Lectura de códigos** de barras y QR con Scandit, y **OCR** con Tesseract.
- **Almacenamiento local** con Hive, SQLite y SharedPreferences.
- **API REST** con Dio, **Firebase** Analytics y Crashlytics, y geolocalización.

## Decisiones técnicas

- **Modo sin conexión.** Los datos se guardan en el dispositivo (Hive y SQLite) para poder seguir trabajando en el almacén aunque no haya red.
- [PENDIENTE: otras decisiones técnicas explicadas, p. ej. por qué Scandit y Tesseract]

## Retos

[PENDIENTE: los retos principales y cómo los resolviste]

## Resultado

[PENDIENTE: estado de la app y resultado]
