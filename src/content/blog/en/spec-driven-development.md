---
title: "Spec-Driven Development in Flutter: AI doesn't write better, it stops guessing"
description: 'Why I write a specification before asking an AI agent for code, what it should cover in Flutter, and how I applied it to Rueda Viva.'
date: 2026-11-23
tags: [Flutter, AI, Spec-Driven Development]
translationKey: sdd
---

The bottleneck used to be writing code. Today an AI agent writes 500 lines in seconds. The bottleneck is **knowing what you asked for**.

Ask an agent to "build the orders screen" and it will probably give you:

- a 400-line widget,
- `setState` mixed with Riverpod,
- a `fromJson()` inside the domain entity.

It isn't the model's fault. It's *vibe coding*: an ambiguous prompt, rules that fade over a long conversation, and features generated separately that don't fit together. It works until the third feature. After that, every prompt breaks something that was already fine.

## Flip the order

**Spec-Driven Development (SDD)** flips the order: you specify the behavior first and generate the code afterwards. The specification is the source of truth for your team and for the agent. If the code and the spec disagree, the code is wrong.

This isn't a return to hundred-page requirements documents. A good feature spec fits in half a page and takes minutes to write.

## What a spec should cover in Flutter

In Flutter, a useful spec answers three questions.

### 1. UI: what does the user see in each state?

`loading`, `success`, `empty` and `error` at the very least, and what's shown in each one. If you don't write it down, the agent makes up a generic error screen and forgets the empty state.

### 2. State: what's the contract?

Which events come in and which states go out (Bloc), or which methods the Cubit or Notifier (Riverpod) exposes. Without that contract, the AI invents its own flow for every feature and none of them look alike.

### 3. Layers: where does everything go?

DTO and data source in `data/`, entity and repository in `domain/`, widgets in `presentation/`. Plus the explicit prohibitions: no Dio in `presentation/`.

This is what a minimal spec looks like when I hand it to an agent before asking for a feature:

```markdown
# orders_list.spec.md

## UI
- loading → 5-item skeleton
- empty   → illustration + "You don't have any orders yet"
- error   → message + Try again button
- success → paginated list (20 per page)

## State (OrdersCubit)
- load() → loading → success | empty | error
- refresh() keeps the list while reloading

## Layers
- OrderDto (data/) → Order (domain/) via toEntity()
- OrdersRepository: interface in domain/, implementation in data/
- presentation/ doesn't import dio or data/
```

Half a page. And it saves you three rounds of "no, not like that".

## The spec doesn't work alone: context engineering

A spec describes one feature. The rules that apply to the **whole** project live somewhere else, so you don't repeat them in every prompt:

- **Project rules** (`CLAUDE.md`, `AGENTS.md`, `.cursor/rules`): architecture, state management, dependency injection, naming and commit conventions.
- **Agent skills**: reusable instructions that teach the assistant the patterns and anti-patterns of each package (how to use `go_router`, how to write a `bloc_test` test…).

The AI doesn't start writing better. **It stops guessing.**

## My workflow, step by step

On my personal projects I follow this cycle with AI agents:

1. **Constitution**: the project's principles (architecture, tests first, what's off limits).
2. **Specification** for each feature, with verifiable acceptance criteria.
3. **Technical plan**: which files change and in which layers.
4. Small, ordered **tasks**, each with its own test.
5. **Implementation with agents**, one task at a time.
6. **Tests and review**: I read every diff as if it were a teammate's pull request.

On [Rueda Viva](/en/proyectos/rueda-viva/), a stationary bike app with streaks and personal records, that workflow produced **6 specs and 43 tasks**. What I noticed most wasn't speed but consistency: the sixth feature looked like the first one, because both came from the same contract.

## What SDD doesn't do

SDD doesn't replace technical judgment: someone has to decide that the list is paginated or that a refresh keeps the data. It doesn't replace code review either. What changes is **where** you put the effort: into defining the problem well and reviewing, not into fixing afterwards whatever the agent imagined.

## In short

Writing code is cheap now. Defining the problem well isn't. Before asking an agent for a feature, write half a page that says what the user sees, what the state's contract is and where everything goes. It's the best time investment I make today on an AI-assisted project.
