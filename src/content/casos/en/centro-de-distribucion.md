---
---

## Context

Distribution Center is an **internal logistics app** at Treew (Canada): goods receiving, stock in and out, warehouse location assignment, suppliers and categories, order dispatch and **label printing**. As an internal app, there are no links or screenshots.

## My role

Flutter developer of the app at Treew, between 2024 and 2025. [PENDING: which parts you built and which the team built]

## Stack and architecture

**DDD with Clean Architecture.**

- **Flutter**. **State**: BLoC and GetX. **Dependency injection**: GetIt.
- **Barcode and QR reading** with Scandit, and **OCR** with Tesseract.
- **Local storage** with Hive, SQLite and SharedPreferences.
- **REST API** with Dio, **Firebase** Analytics and Crashlytics, and geolocation.

## Technical decisions

- **Offline mode.** Data is stored on the device (Hive and SQLite) so work in the warehouse can continue without a network.
- [PENDING: other technical decisions, explained, e.g. why Scandit and Tesseract]

## Challenges

[PENDING: the main challenges and how you solved them]

## Outcome

[PENDING: app status and outcome]
