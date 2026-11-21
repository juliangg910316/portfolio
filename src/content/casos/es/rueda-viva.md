---
---

## Contexto

Las bicis estáticas muestran el tiempo, la distancia, las calorías y la velocidad de cada sesión, pero esos datos se pierden al apagarlas. Las apps generalistas como Strava, Fitbit o Google Fit permiten registros manuales, pero no tienen campos propios de la bici estática, como el odómetro, ni rachas pensadas para el hábito diario.

Rueda Viva es una app para Android e iOS que guarda cada sesión y la convierte en **rachas, estadísticas y récords**, para tener ganas de volver a pedalear al día siguiente.

## Mi rol

Es un proyecto personal de principio a fin: producto, diseño, arquitectura y código. Lo desarrollé con **Spec-Driven Development** y agentes de IA: una constitución de 6 principios, requisitos en formato EARS y **6 specs con 43 tareas**, todas implementadas en 25 commits.

## Stack y arquitectura

Sigue la arquitectura oficial de Flutter, en capas y con una sola dirección:

```text
UI (un Cubit por pantalla) → dominio (modelos freezed y lógica pura) → datos (repositorios + drift)
```

- **Estado**: flutter_bloc, con un Cubit por pantalla.
- **Inyección de dependencias**: get_it.
- **Persistencia**: drift sobre SQLite, solo en el dispositivo. No hay servidor.
- **Modelos y estados inmutables** con freezed, y errores con `Result<T>`.
- **Tema claro y oscuro** según el móvil, con colores propios y las fuentes incluidas en la app.

## Decisiones técnicas

- **Sin streams.** Las lecturas devuelven `Future<Result<T>>` y cada Cubit recarga sus datos después de cada acción y al volver de otra pantalla.
- **Racha estrictamente diaria.** Solo se pueden registrar sesiones del día actual y la fecha la pone la app, así que no se pueden «rellenar» rachas después.
- **Identificadores sin cambiar.** Al renombrar la app de SpinStreak a Rueda Viva se mantuvieron el paquete y la base de datos: cambiarlos habría instalado otra app y se habrían perdido los datos.
- **Contraste WCAG 2.1.** El texto sobre el naranja principal es casi negro, no blanco, para llegar a 4,5:1.

## Retos

- **Reglas de la racha sin ambigüedades.** Varias sesiones el mismo día cuentan como un solo día, la racha sigue viva hasta las 23:59 si aún no has entrenado y la mejor racha se conserva siempre.
- **Migrar la base de datos** a la versión 2 cuando la velocidad máxima pasó de decimal a entero, sin perder sesiones.
- **Registrar una sesión en menos de 30 segundos**, con selector de tiempo, teclado numérico y ayuda ⓘ en cada parámetro de la bici.

## Resultado

El MVP quedó completo el 16 de octubre de 2026. Después llegaron el soporte de iOS, un diseño visual propio (paleta «Fuego», modo claro y oscuro) y un nombre y un logo nuevos. Es una app de uso personal, no publicada en las tiendas, y el código es público en GitHub.
