---
title: 'The Repository pattern in Flutter: the boundary matters more than the interface'
description: 'Services, repositories and domain models: how to truly separate data from the UI without filling the project with interfaces nobody needs.'
date: 2026-11-23
tags: [Flutter, Architecture, Clean Architecture]
translationKey: repository
---

I once reviewed a pull request with a repository that returned a Firestore `Query<Item>` straight to the UI. The interface looked clean. The coupling to Firebase was still there.

That's the most common mistake when applying the Repository pattern: confusing "having a class called Repository" with "having actually separated data from the UI". And it has an evil twin, the opposite mistake: abstracting everything just in case.

## What a repository is (and isn't)

Flutter's official architecture guide splits the data layer into two pieces:

- **Services**: stateless wrappers around an API or an SDK (Dio, SQLite, Firebase). They speak the data source's language and return DTOs as they come.
- **Repositories**: they coordinate one or more services, turn DTOs into **immutable domain models** and handle caching, retries and errors. They're the single source of truth for a type of data.

```dart
// Service: knows HTTP and nothing else.
class WeatherService {
  WeatherService(this._dio);
  final Dio _dio;

  Future<WeatherDto> fetchWeather(String city) async {
    final response = await _dio.get<Map<String, dynamic>>('/weather', queryParameters: {'q': city});
    return WeatherDto.fromJson(response.data!);
  }
}

// Repository: speaks the app's language.
class WeatherRepository {
  WeatherRepository(this._service);
  final WeatherService _service; // private: the UI never sees it

  Future<Weather> getWeather(String city) async {
    final dto = await _service.fetchWeather(city);
    return Weather(city: city, celsius: dto.main.temp, condition: Condition.fromCode(dto.weather.first.id));
  }
}
```

The UI and the Cubits only know about `Weather`. If the API changes its JSON format tomorrow, the change stays in the DTO and the mapping. Nothing else finds out.

## Trap 1: the leaky abstraction

Back to that `Query<Item>`. If the repository returns SDK types (`Query`, `DocumentSnapshot`, `Response`, `FirebaseException`), there is no boundary: the presentation layer still knows Firestore is underneath. The day you move to a REST API, you end up touching widgets.

The rule is simple: **nothing that leaves a repository may import the SDK**. Not the models, not the errors, not the streams. If you need real-time updates, the repository exposes a `Stream<List<Item>>` from your domain, not Firestore's `Stream<QuerySnapshot>`.

## Trap 2: the lowest common denominator

The opposite extreme is expensive too. Designing a generic repository "for any database" forces you to keep only what they all have in common and to give up what makes each one good: Firestore's cursor pagination, real-time queries or SQLite transactions. A repository doesn't have to hide every difference in the world. It has to hide **your app's**.

## YAGNI: start with a concrete class

The practice I follow in production:

1. **Start with a concrete class**, no interface.
2. **Add the abstraction only for a real scenario**: several implementations at once (a local one and a remote one for offline mode) or a testing need the concrete class can't cover.
3. **If those scenarios never come, the concrete class stays as it is.**

Creating `abstract class WeatherRepository` + `WeatherRepositoryImpl` for every repository doubles the files and adds nothing when there's only one way to fetch the weather.

Dart makes this easy, too: **every class defines an implicit interface**. For a test you can write a double without touching production code:

```dart
class FakeWeatherRepository implements WeatherRepository {
  @override
  Future<Weather> getWeather(String city) async =>
      Weather(city: city, celsius: 21, condition: Condition.clear);
}
```

The same goes for `mocktail`: `class MockWeatherRepository extends Mock implements WeatherRepository {}` works with a concrete class.

## When an interface does pay off: two data sources

The classic case is offline mode. There the abstraction earns its keep, because there are two real implementations for the repository to coordinate:

```dart
class ExpensesRepository {
  ExpensesRepository(this._remote, this._local);
  final ExpensesRemoteSource _remote;
  final ExpensesLocalSource _local;

  Stream<List<Expense>> watchExpenses() => _local.watchAll().map((rows) => rows.map(Expense.fromRow).toList());

  Future<void> refresh() async {
    final dtos = await _remote.fetchAll();
    await _local.replaceAll(dtos.map((dto) => dto.toRow()));
  }
}
```

The UI listens to the local database (which always answers, network or not) and the repository decides when to refresh from the server.

## SDKs you can't fake: composition

Some SDK types can't be implemented or extended in your tests, like Firebase Auth's `User`. The answer isn't to fight them but to **not let them out**: turn them into your own model at the boundary.

```dart
class AppUser {
  const AppUser({required this.id, required this.email, required this.isVerified});

  factory AppUser.fromFirebase(User user) =>
      AppUser(id: user.uid, email: user.email ?? '', isVerified: user.emailVerified);

  final String id;
  final String email;
  final bool isVerified;
}
```

The rest of the app works with `AppUser`, which you can create in one line in any test.

## In short

Abstraction isn't dogma: it's a tool with costs. The value of the Repository pattern is the **clear boundary** it draws between your app and the outside world, not how many files you generate to justify it. Start concrete, don't let SDK types escape, and abstract when the second implementation shows up, not before.
