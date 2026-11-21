---
---

## Context

Stationary bikes show the time, distance, calories and speed of each session, but that data is lost when you switch them off. General apps like Strava, Fitbit or Google Fit allow manual entries, but they have no fields specific to stationary bikes, such as the odometer, and no streaks designed around a daily habit.

Rueda Viva is an Android and iOS app that saves every session and turns it into **streaks, stats and personal records**, so you want to get back on the bike the next day.

## My role

It is a personal project from start to finish: product, design, architecture and code. I built it with **Spec-Driven Development** and AI agents: a 6-principle constitution, requirements in EARS format and **6 specs with 43 tasks**, all implemented in 25 commits.

## Stack and architecture

It follows Flutter's official architecture, in layers with a single direction:

```text
UI (one Cubit per screen) → domain (freezed models and pure logic) → data (repositories + drift)
```

- **State**: flutter_bloc, with one Cubit per screen.
- **Dependency injection**: get_it.
- **Persistence**: drift on SQLite, on the device only. There is no server.
- **Immutable models and states** with freezed, and errors with `Result<T>`.
- **Light and dark theme** following the phone, with custom colors and fonts bundled in the app.

## Technical decisions

- **No streams.** Reads return `Future<Result<T>>` and each Cubit reloads its data after every action and when coming back from another screen.
- **Strictly daily streak.** Only today's sessions can be logged and the app sets the date, so streaks can't be "filled in" afterwards.
- **Unchanged identifiers.** When the app was renamed from SpinStreak to Rueda Viva, the package and database names were kept: changing them would have installed a different app and the data would have been lost.
- **WCAG 2.1 contrast.** Text on the main orange is almost black, not white, to reach 4.5:1.

## Challenges

- **Unambiguous streak rules.** Several sessions on the same day count as one day, the streak stays alive until 23:59 if you haven't trained yet, and the best streak is always kept.
- **Migrating the database** to version 2 when max speed changed from decimal to integer, without losing sessions.
- **Logging a session in under 30 seconds**, with a time picker, a numeric keyboard and ⓘ help for every bike parameter.

## Outcome

The MVP was completed on 16 October 2026. After that came iOS support, a custom visual design ("Fire" palette, light and dark mode) and a new name and logo. It is an app for personal use, not published on the stores, and the code is public on GitHub.
