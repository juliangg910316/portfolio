---
---

## Context

A private security company in Houston (USA) needed to track its guards' attendance. The full system has a backend, a web dashboard for the company and a **mobile app** for the guards: they sign in with their phone number, see their shifts and **check in and out with a photo and GPS location**.

## My role

It is a freelance project. I build **the whole mobile app** for Android and iOS and **contribute to the NestJS backend**, with over 100 commits, mainly on the APIs the app uses: workers, shifts, attendance logs, anomalies, tracking and authentication. Another team builds the web dashboard.

## Stack and architecture

It follows Flutter's official layered architecture:

```text
UI → Cubit → repository (interface in the domain) → implementation in data → Retrofit client → API
```

- **State**: flutter_bloc Cubits with freezed states.
- **Dependency injection**: get_it.
- **HTTP**: Retrofit + Dio, with a Bearer token and session refresh.
- **Errors**: fpdart, with `Future<Either<Failure, T>>`.
- **Navigation**: go_router with a bottom bar.
- **Native**: camera, geolocation, background service and local notifications.
- **Backend**: NestJS + Prisma + PostgreSQL.
- **Languages**: Spanish and English.

## Technical decisions

- **Errors as values.** Every API call returns a typed success or failure (`Either`), so the UI has to handle both cases and there are no unhandled exceptions.
- **Mappers between layers.** API models are converted into domain models, so the UI never depends on the backend's format.
- **Batched GPS tracking.** A background service sends the worker's location points to the backend in batches instead of one by one.
- **An agreed API contract.** Since I work on both sides, we adjusted the contract between the app and the backend (check-in, session, errors and GPS points) and documented it in the backend repository.

## Challenges

- **Reliable check-ins**: permissions, camera, location and uploading the photo to a dedicated endpoint, all in the same flow.
- **Tracking while the app is in the background**, with its own service and notifications.

## Outcome

The app is in its final testing phase, with Android in Google Play internal testing. It will then be released on the App Store and Google Play with the client's accounts. The code is private.
