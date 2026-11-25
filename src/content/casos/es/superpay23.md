---
---

## Contexto

SuperPay23 es una **app financiera interna** de Treew (Canadá) para personas y empresas: cuentas, transferencias y pagos, **tarjetas Visa** (alta, cambio de PIN, saldo y aviso de pérdida), verificación **KYC**, **doble factor**, informes financieros y **pagos con QR**. Al ser una app interna, no hay enlaces ni capturas.

## Mi rol

**Empecé la app desde cero** como desarrollador Flutter de un equipo de producto canadiense, en remoto, entre 2024 y 2025. Participé en todo el ciclo: diseño e implementación de funcionalidades, pruebas y publicación.

## Stack y arquitectura

**Clean Architecture** en tres capas: presentación, dominio e infraestructura.

- **Flutter** para Android e iOS.
- **Estado**: Bloc y Cubit. **Inyección de dependencias**: GetIt. **Navegación**: GoRouter.
- **Idiomas**: Easy Localization.
- **Firebase** Analytics y Crashlytics.
- **Cifrado de los datos sensibles** e integración con APIs bancarias.

## Decisiones técnicas

- **Bloc y Cubit, cada uno donde encaja.** Los dos dan un estado único e inmutable, trazabilidad de los cambios y widgets propios para reaccionar a ellos. Los Cubit necesitan menos código, así que eran la opción por defecto. En las pantallas de pago y en las que disparan acciones que deben ejecutarse una sola vez se usaba Bloc, que permite controlar cada evento que entra.
- **Datos sensibles con `flutter_secure_storage`**, que los guarda cifrados en el Keychain de iOS y el Keystore de Android, nunca en texto plano.
- **Doble factor con app de autenticación** (códigos de un solo uso generados en el móvil del usuario).
- **Clean Architecture** en toda la app, para separar las reglas de negocio de Flutter y de las APIs bancarias.

## Retos

[PENDIENTE: los retos principales y cómo los resolviste]

## Resultado

La app quedó funcionando en uso interno: con ella se pagan los salarios de los trabajadores y las compras en Supermarket23, la tienda virtual de la empresa.
