---
---

## Context

Studio Shaddai is a nail salon in Curitiba. Clients needed to see the services and **book appointments** based on the salon's availability, and the owner needed to manage her schedule. At the start, the code was split across two repositories: an app with Firebase and bookings, and a website with the final design.

## My role

It is a project for a client. I handle the full development of the app for **Android, iOS and Web**: architecture, merging the two repositories, the Firebase connection and publishing the website at dshaddai.com.

## Stack and architecture

**Feature-first** architecture (`core`, `data`, `features`), with a single direction:

```text
features → data → Firebase
```

- **Flutter** for Android, iOS and Web from a single codebase.
- **State**: Riverpod. **Navigation**: go_router.
- **100% Firebase backend**: Auth with Google Sign-In, Firestore, Cloud Messaging and Cloud Functions.
- **Light and dark theme** (dark by default) and the interface in Spanish and Portuguese, with a manual switcher.

## Technical decisions

- **A single repository.** The base is the app (Firebase connection and bookings), and the theme, typography, language switcher and landing page come from the website.
- **Same features, one interface per platform.** On the web, a one-page landing where scrolling is the structure; on Android and iOS, navigation with a bottom bar. Data and logic are shared.
- **Only the data layer talks to Firebase.** Repositories take Firestore and Auth as optional parameters so tests can use fakes.
- **Services and prices in Firestore**, instead of being hard-coded in the code and the translation files.

## Challenges

- **Calculating free slots** in the schedule based on the availability set by the administrator.
- **Admin panel**: confirm or cancel appointments, contact clients on WhatsApp, set up the calendar and block clients.
- **Merging two projects** with different architectures without losing the Firebase connection.

## Outcome

The website is live at dshaddai.com. Push notifications, Cloud Functions and Firestore security rules are still to do, and the goal is to publish the app on Google Play and the App Store. [PENDING: store release status and date]
