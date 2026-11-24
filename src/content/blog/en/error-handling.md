---
title: 'Error handling in Flutter: an architecture decision, not a try/catch'
description: "Exceptions vs Failures, mapping in the data layer, a Result as the contract, and the screen that shouldn't wipe your data when a refresh fails."
date: 2026-11-23
tags: [Flutter, Architecture, Errors]
translationKey: errores
---

"Something went wrong."

That's what your user sees. In your console, at the same moment: `FirebaseAuthException: The password is invalid`.

One of those two messages is useful. Neither is in the right layer.

Error handling isn't an implementation detail. It's an architecture decision. The question isn't "where do I put the try/catch?" but **at which point in this chain each failure gets handled**:

```text
Firebase → DataSource → Repository → Cubit / Notifier → UI
```

## Each layer knows something different

The rule that puts everything in order: **handle the error in the layer that has enough context to make a meaningful decision**.

- The **data layer** knows that HTTP returned a 401, that there was a timeout, or that Firestore answered `permission-denied`.
- The **domain** knows the user isn't authorized, or that the expense they're looking for doesn't exist.
- The **UI** knows whether that goes in a snackbar, in a dialog, or whether it's time to go back to the login screen.

## Exception vs Failure

The distinction that puts everything in order:

- An **Exception** is an implementation detail: `FirebaseException`, `SocketException`, `DioException`, `TimeoutException`.
- A **Failure** is a problem that means something to your app: `NetworkFailure`, `UnauthorizedFailure`, `NotFoundFailure`.

```dart
sealed class Failure {
  const Failure(this.message);
  final String message;

  /// Does it make sense to offer "Try again"?
  bool get isRetryable => false;
}

final class NetworkFailure extends Failure {
  const NetworkFailure() : super('No connection');
  @override
  bool get isRetryable => true;
}

final class UnauthorizedFailure extends Failure {
  const UnauthorizedFailure() : super('Invalid session');
}

final class NotFoundFailure extends Failure {
  const NotFoundFailure() : super('Not found');
}

final class UnexpectedFailure extends Failure {
  const UnexpectedFailure(super.message);
}
```

If a `FirebaseAuthException` reaches a widget, your presentation layer already knows about Firebase: the day you move to REST, you'll end up touching the UI.

## Mapping lives in the data layer

Today Firebase returns `permission-denied`; tomorrow a REST API returns a 403. Both have to become the same `UnauthorizedFailure`. The domain doesn't care where it came from.

```dart
Failure mapFirebase(FirebaseException e) => switch (e.code) {
      'permission-denied' || 'unauthenticated' => const UnauthorizedFailure(),
      'not-found' => const NotFoundFailure(),
      'unavailable' || 'deadline-exceeded' => const NetworkFailure(),
      _ => UnexpectedFailure(e.message ?? e.code),
    };

Failure mapDio(DioException e) {
  if (e.type == DioExceptionType.connectionError || e.type == DioExceptionType.connectionTimeout) {
    return const NetworkFailure();
  }
  return switch (e.response?.statusCode) {
    401 || 403 => const UnauthorizedFailure(),
    404 => const NotFoundFailure(),
    _ => UnexpectedFailure(e.message ?? 'HTTP error'),
  };
}
```

## Failure is part of the contract

Compare these two signatures:

```dart
Future<List<Expense>> getExpenses();          // what if it fails?
Future<Result<List<Expense>>> getExpenses();  // success → list · failure → Failure
```

The second one says in the type itself that the operation can fail, and the compiler forces the caller to handle both cases. With Dart 3 sealed classes you don't need any library:

```dart
sealed class Result<T> {
  const Result();
}

final class Ok<T> extends Result<T> {
  const Ok(this.value);
  final T value;
}

final class Err<T> extends Result<T> {
  const Err(this.failure);
  final Failure failure;
}
```

On the SCA project I use `fpdart` with `Future<Either<Failure, T>>`, which does the same thing. What matters isn't the library but applying **one single strategy across the whole repository**.

```dart
class ExpensesRepository {
  ExpensesRepository(this._source, this._log);
  final ExpensesSource _source;
  final Logger _log;

  Future<Result<List<Expense>>> getExpenses() async {
    try {
      final dtos = await _source.fetchExpenses();
      return Ok(dtos.map(Expense.fromDto).toList());
    } on FirebaseException catch (e, stackTrace) {
      _log.error('getExpenses', error: e, stackTrace: stackTrace);
      return Err(mapFirebase(e));
    }
  }
}
```

## A screen has more than three states

The detail almost nobody models: **data on screen plus a refresh that fails**. The user has 100 expenses loaded, pulls to refresh and the request fails. If your Cubit does `emit(ExpensesError(failure))`, you've just wiped 100 expenses off the screen because of a network error.

A data screen doesn't have three states (loading, data, error); it has at least six: initial, loading, loaded, **refreshing with data**, empty and error. And a failed refresh keeps what was already there:

```dart
Future<void> refresh() async {
  final current = state;
  if (current is! ExpensesLoaded) return load();
  emit(ExpensesLoaded(current.expenses, isRefreshing: true));
  final result = await _repository.getExpenses();
  emit(switch (result) {
    Ok(:final value) when value.isEmpty => const ExpensesEmpty(),
    Ok(:final value) => ExpensesLoaded(value),
    Err(:final failure) => ExpensesLoaded(current.expenses, refreshError: failure),
  });
}
```

The UI keeps showing the list plus a discreet notice with "Try again" if `refreshError?.isRetryable` is true. An `UnauthorizedFailure`, on the other hand, isn't retried: it triggers behavior (sign the user out and go back to the login screen).

## Logs aren't error messages

The user reads "We couldn't load your expenses". Your log keeps the original exception, the code, the operation and the full stack trace. They're two different audiences and they shouldn't share text.

## Three anti-patterns I still see in code reviews

- `catch (e) { rethrow; }`: it adds nothing; remove the try/catch.
- `catch (e) { throw Exception('error'); }`: you lose the original type and stack trace.
- `Text(exception.toString())`: you've just shown Firestore to your user.

Catch an exception only if you're going to **translate it, log it or turn it into a Failure**. Otherwise, let it through.

## In short

The goal isn't an app that never fails. It's that every failure knows exactly where to go:

```text
Exception → translation → Failure → state → experience
```
