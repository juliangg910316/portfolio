---
---

## Context

ENZONA is **Cuba's national digital payments platform**: an Android banking app with payments and transfers, real-time messaging and map-based location services. It is a security-critical system used across the country.

## My role

I was a **founding member** of the project and its **lead mobile developer for almost 8 years** at Xetid. I designed and built the whole Android architecture and kept a nationwide platform stable in production.

## Stack and architecture

- **Native Java** with an **MVVM** architecture.
- **SQLCipher** for the encrypted local database.
- **MQTT and XMPP (Smack)** for real-time messaging and transactions.
- **Retrofit** for the API, **Lottie** for animations and **Sentry** for production errors.
- **WorkManager** for background tasks and **OpenStreetMap** for maps.
- **Security**: biometric authentication, two-factor authentication and RSA encryption.
- **Tests** with JUnit and Mockito.

## Technical decisions

- **Encrypted local storage.** In a payments app, data stored on the phone must be encrypted too. I integrated SQLCipher, backed by my background in cryptography.
- **Real-time messaging with MQTT and XMPP.** [PENDING: why these protocols were chosen]
- [PENDING: another technical decision, explained]

## Challenges

[PENDING: the main challenges and how you solved them]

## Outcome

The app ran in production at national scale for years and is distributed on Apklis, the Cuban app store. [PENDING: usage figures, if they can be published]
