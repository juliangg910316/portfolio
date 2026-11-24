# HU-09 · Cómo trabajo con IA

**Como** visitante **quiero** entender cómo trabaja Julian con IA **para** ver lo que le diferencia.

- **Prioridad**: Media · **Estado**: Hecha · **Tests**: `tests/e2e/HU-09-como-trabajo.spec.ts`

## Criterios de aceptación
1. **Dado** `/como-trabajo`, **entonces** veo el flujo por pasos (especificar → planificar → tareas → implementar con agentes → tests → revisión).
2. **Dado** la página, **entonces** veo un ejemplo real: Rueda Viva (6 specs, 43 tareas, 25 commits) con enlace al repo.
3. **Dado** la página, **entonces** veo las herramientas que uso (Claude Code, Cursor, Copilot, MCP).

## Decisiones (2026-11-24)
- «Cómo trabajo» va en el menú, entre Experiencia y Blog. Con 8 entradas, el menú pasa a su propia línea por debajo de 1280 px (antes, 1024 px) para que el selector de idioma y el tema no se partan.
- Flujo en 6 pasos (especificar → planificar → tareas → implementar con agentes → tests → revisión), con un bloque previo sobre el contexto (constitución, AGENTS.md, MEMORY.md).
- Datos de Rueda Viva tomados de la nota del vault y del repo: 6 specs, 43 tareas, 25 commits, MVP el 16-10-2026. Enlaces al repo SpinStreak y al caso de estudio.
- Herramientas: Claude Code, Cursor, GitHub Copilot y MCP (lista de la nota del portafolio). Las descripciones de Cursor y Copilot son genéricas: Julian debe revisarlas.
