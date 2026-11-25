---
---

## Contexto

Una empresa de seguridad privada de Houston (EE. UU.) necesitaba controlar la asistencia de sus vigilantes. El sistema completo tiene un backend, un panel web para la empresa y una **app móvil** para los vigilantes: inician sesión con su teléfono, ven sus turnos y **fichan la entrada y la salida con foto y ubicación GPS**.

## Mi rol

Es un proyecto freelance. Desarrollo **la app móvil completa** para Android e iOS y **colaboro en el backend** NestJS, con más de 100 commits, sobre todo en las APIs que usa la app: trabajadores, turnos, registros de asistencia, anomalías, rastreo y autenticación. El panel web lo hace otro equipo.

## Stack y arquitectura

Sigue la arquitectura oficial de Flutter en capas:

```text
UI → Cubit → repositorio (interfaz en el dominio) → implementación en datos → cliente Retrofit → API
```

- **Estado**: Cubits de flutter_bloc con estados freezed.
- **Inyección de dependencias**: get_it.
- **HTTP**: Retrofit + Dio, con token Bearer y renovación de la sesión.
- **Errores**: fpdart, con `Future<Either<Failure, T>>`.
- **Navegación**: go_router con barra inferior.
- **Nativo**: cámara, geolocalización, servicio en segundo plano y notificaciones locales.
- **Backend**: NestJS + Prisma + PostgreSQL.
- **Idiomas**: español e inglés.

## Decisiones técnicas

- **Errores como valores.** Cada llamada al API devuelve un éxito o un fallo con tipo (`Either`), así que la interfaz tiene que tratar los dos casos y no hay excepciones sin controlar.
- **Mappers entre capas.** Los modelos del API se convierten en modelos de dominio, y la interfaz nunca depende del formato del backend.
- **Rastreo GPS por lotes.** Un servicio en segundo plano envía los puntos del trabajador al backend en lotes, en lugar de uno a uno.
- **Contrato del API acordado.** Como colaboro en los dos lados, ajustamos el contrato entre la app y el backend (fichaje, sesión, errores y puntos GPS) y lo documentamos en el repositorio del backend.

## Retos

- **Un fichaje fiable**: permisos, cámara, ubicación y subida de la foto a un endpoint propio, todo dentro del mismo flujo.
- **Rastreo con la app en segundo plano**, con su servicio y sus notificaciones.

## Resultado

La app está en la fase final de pruebas, con Android en la prueba interna de Google Play. Después se publicará en App Store y Google Play con las cuentas del cliente. El código es privado.
