---
title: 'Spec-Driven Development en Flutter: la IA no escribe mejor, deja de adivinar'
description: 'Por qué escribo una especificación antes de pedirle código a un agente de IA, qué debe cubrir en Flutter y cómo lo apliqué en Rueda Viva.'
date: 2026-11-23
tags: [Flutter, IA, Spec-Driven Development]
translationKey: sdd
---

Antes, el cuello de botella era escribir código. Hoy un agente de IA escribe 500 líneas en segundos. El cuello de botella es **saber qué le pediste**.

Pídele a un agente «haz la pantalla de pedidos» y probablemente te devuelva:

- un widget de 400 líneas,
- `setState` mezclado con Riverpod,
- un `fromJson()` dentro de la entidad de dominio.

No es culpa del modelo. Es *vibe coding*: un prompt ambiguo, reglas que se diluyen en una conversación larga y features generadas por separado que no encajan entre sí. Funciona hasta la tercera feature. Después, cada prompt rompe algo que ya estaba bien.

## Invertir el orden

**Spec-Driven Development (SDD)** invierte el orden: primero especificas el comportamiento y después generas el código. La especificación es la fuente de verdad para tu equipo y para el agente. Si el código y la spec no coinciden, el que está mal es el código.

No es volver a documentos de requisitos de cien páginas. Una buena spec de feature ocupa media página y se escribe en minutos.

## Qué debe cubrir una spec en Flutter

En Flutter, una spec útil responde a tres preguntas.

### 1. UI: ¿qué ve el usuario en cada estado?

`loading`, `success`, `empty` y `error`, como mínimo, y qué se muestra en cada uno. Si no lo escribes, el agente se inventa una pantalla de error genérica y se olvida del estado vacío.

### 2. Estado: ¿cuál es el contrato?

Qué eventos entran y qué estados salen (Bloc), o qué métodos expone el Cubit o el Notifier (Riverpod). Sin este contrato, la IA inventa su propio flujo en cada feature y ninguna se parece a la anterior.

### 3. Capas: ¿dónde va cada cosa?

DTO y data source en `data/`, entidad y repositorio en `domain/`, widgets en `presentation/`. Y las prohibiciones explícitas: nada de Dio en `presentation/`.

Así se ve una spec mínima que le paso a un agente antes de pedirle una feature:

```markdown
# orders_list.spec.md

## UI
- loading → esqueleto de 5 elementos
- empty   → ilustración + «Aún no tienes pedidos»
- error   → mensaje + botón Reintentar
- success → lista paginada (20 por página)

## Estado (OrdersCubit)
- load() → loading → success | empty | error
- refresh() conserva la lista mientras recarga

## Capas
- OrderDto (data/) → Order (domain/) con toEntity()
- OrdersRepository: interfaz en domain/, implementación en data/
- presentation/ no importa dio ni data/
```

Media página. Y te ahorra tres rondas de «no, así no».

## La spec no trabaja sola: Context Engineering

Una spec describe una feature. Las reglas que valen para **todo** el proyecto viven en otro sitio, para no repetirlas en cada prompt:

- **Reglas del proyecto** (`CLAUDE.md`, `AGENTS.md`, `.cursor/rules`): arquitectura, gestión de estado, inyección de dependencias, convenciones de nombres y de commits.
- **Skills del agente**: instrucciones reutilizables que enseñan al asistente los patrones y antipatrones de cada paquete (cómo usar `go_router`, cómo escribir un test de `bloc_test`…).

La IA no empieza a escribir mejor. **Deja de adivinar.**

## Mi flujo, paso a paso

En mis proyectos personales sigo este ciclo con agentes de IA:

1. **Constitución**: los principios del proyecto (arquitectura, tests primero, qué está prohibido).
2. **Especificación** de cada feature, con criterios de aceptación verificables.
3. **Plan técnico**: qué archivos se tocan y en qué capas.
4. **Tareas** pequeñas y ordenadas, cada una con su test.
5. **Implementación con agentes**, tarea a tarea.
6. **Tests y revisión**: leo cada diff como si fuera el pull request de un compañero.

En [Rueda Viva](/proyectos/rueda-viva/), una app de bicicleta estática con rachas y récords, ese flujo dio **6 specs y 43 tareas**. Lo que más noté no fue la velocidad, sino la coherencia: la feature número seis se parecía a la primera, porque las dos salían del mismo contrato.

## Lo que no hace SDD

SDD no sustituye al criterio técnico: alguien tiene que decidir que la lista va paginada o que el refresco conserva los datos. Tampoco sustituye a la revisión de código. Lo que cambia es **dónde** pones el esfuerzo: en definir bien el problema y en revisar, no en corregir a posteriori lo que el agente imaginó.

## En resumen

Escribir código ya es barato. Definir bien el problema, no. Antes de pedirle una feature a un agente, escribe media página que diga qué ve el usuario, qué contrato tiene el estado y dónde va cada cosa. Es la mejor inversión de tiempo que hago hoy en un proyecto con IA.
