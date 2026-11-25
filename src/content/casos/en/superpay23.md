---
---

## Context

SuperPay23 is an **internal finance app** at Treew (Canada) for individuals and businesses: accounts, transfers and payments, **Visa cards** (issuing, PIN change, balance and loss reports), **KYC** verification, **two-factor authentication**, financial reports and **QR payments**. As an internal app, there are no links or screenshots.

## My role

**I started the app from scratch** as a Flutter developer in a Canadian product team, working remotely between 2024 and 2025. I took part in the whole cycle: feature design and implementation, testing and release.

## Stack and architecture

**Clean Architecture** in three layers: presentation, domain and infrastructure.

- **Flutter** for Android and iOS.
- **State**: Bloc and Cubit. **Dependency injection**: GetIt. **Navigation**: GoRouter.
- **Languages**: Easy Localization.
- **Firebase** Analytics and Crashlytics.
- **Encryption of sensitive data** and integration with banking APIs.

## Technical decisions

- **Bloc and Cubit, each where it fits.** Both give a single immutable state, traceable changes and dedicated widgets to react to them. Cubits need less code, so they were the default. Payment screens, and screens that trigger actions that must run only once, used Bloc, which lets you control every incoming event.
- **Sensitive data in `flutter_secure_storage`**, which stores it encrypted in the iOS Keychain and the Android Keystore, never in plain text.
- **Two-factor authentication with an authenticator app** (one-time codes generated on the user's phone).
- **Clean Architecture** across the app, to keep business rules apart from Flutter and from the banking APIs.

## Challenges

[PENDING: the main challenges and how you solved them]

## Outcome

The app ended up running in internal use: it's used to pay employees' salaries and to pay for purchases at Supermarket23, the company's online store.
