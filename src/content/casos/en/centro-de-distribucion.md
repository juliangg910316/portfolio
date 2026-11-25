---
---

## Context

Distribution Center is an **internal logistics app** at Treew (Canada): goods receiving, stock in and out, warehouse location assignment, suppliers and categories, order dispatch and **label printing**. As an internal app, there are no links or screenshots.

## My role

Flutter developer at Treew, between 2024 and 2025. I joined when the app already existed to add a complete feature: **scanning the QR codes of warehouse products**, showing them in a list in the app and **dispatching them**.

## Stack and architecture

**DDD with Clean Architecture.**

- **Flutter**. **State**: BLoC and GetX. **Dependency injection**: GetIt.
- **Barcode and QR reading** with Scandit, and **OCR** with Tesseract.
- **Local storage** with Hive, SQLite and SharedPreferences.
- **REST API** with Dio, **Firebase** Analytics and Crashlytics, and geolocation.

## Technical decisions

- **Offline mode.** Data is stored on the device (Hive and SQLite) so work in the warehouse can continue without a network.
- **A lesson about state.** The architecture decisions predate my arrival. The app mixes BLoC and GetX because, over its development, different developers each added their own state manager. That mix makes maintenance harder, which is why on my projects the state manager is fixed in the rules from day one.

## Challenges

[PENDING: the main challenges and how you solved them]

## Outcome

The app was tested and rolled out to all of the company's warehouses.
