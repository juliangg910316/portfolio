---
title: 'Manejo de errores en Flutter: una decisión de arquitectura, no un try/catch'
description: 'Exceptions frente a Failures, el mapeo en la capa de datos, un Result como contrato y la pantalla que no debería borrar tus datos al fallar.'
date: 2026-11-23
tags: [Flutter, Arquitectura, Errores]
translationKey: errores
---

«Algo salió mal.»

Eso es lo que ve tu usuario. En tu consola, al mismo tiempo: `FirebaseAuthException: The password is invalid`.

Uno de los dos mensajes sirve. Ninguno está en la capa correcta.

El manejo de errores no es un detalle de implementación. Es una decisión de arquitectura. La pregunta no es «¿dónde pongo el try/catch?», sino **en qué punto de esta cadena se maneja cada fallo**:

```text
Firebase → DataSource → Repository → Cubit / Notifier → UI
```

## Cada capa sabe una cosa distinta

La regla que ordena todo: **maneja el error en la capa que tenga contexto suficiente para decidir algo con sentido**.

- La **capa de datos** sabe que HTTP devolvió un 401, que hubo un timeout o que Firestore respondió `permission-denied`.
- El **dominio** sabe que el usuario no está autorizado o que el gasto que busca no existe.
- La **UI** sabe si eso va en un snackbar, en un diálogo o si toca volver a la pantalla de inicio de sesión.

## Exception frente a Failure

La distinción que lo ordena todo:

- Una **Exception** es un detalle de implementación: `FirebaseException`, `SocketException`, `DioException`, `TimeoutException`.
- Un **Failure** es un problema con significado para tu app: `NetworkFailure`, `UnauthorizedFailure`, `NotFoundFailure`.

```dart
sealed class Failure {
  const Failure(this.message);
  final String message;

  /// ¿Tiene sentido ofrecer «Reintentar»?
  bool get isRetryable => false;
}

final class NetworkFailure extends Failure {
  const NetworkFailure() : super('Sin conexión');
  @override
  bool get isRetryable => true;
}

final class UnauthorizedFailure extends Failure {
  const UnauthorizedFailure() : super('Sesión no válida');
}

final class NotFoundFailure extends Failure {
  const NotFoundFailure() : super('No encontrado');
}

final class UnexpectedFailure extends Failure {
  const UnexpectedFailure(super.message);
}
```

Si una `FirebaseAuthException` llega al widget, tu presentación ya conoce Firebase: el día que migres a REST terminarás tocando la UI.

## El mapeo vive en la capa de datos

Hoy Firebase devuelve `permission-denied`; mañana una API REST devuelve un 403. Los dos tienen que convertirse en el mismo `UnauthorizedFailure`. Al dominio le da igual de dónde vino.

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
    _ => UnexpectedFailure(e.message ?? 'Error HTTP'),
  };
}
```

## El fallo forma parte del contrato

Compara estas dos firmas:

```dart
Future<List<Expense>> getExpenses();          // ¿y si falla?
Future<Result<List<Expense>>> getExpenses();  // éxito → lista · fallo → Failure
```

La segunda dice en el propio tipo que la operación puede fallar, y el compilador obliga a quien la llama a tratar los dos casos. Con las clases selladas de Dart 3 no necesitas ninguna librería:

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

En el proyecto SCA uso `fpdart` con `Future<Either<Failure, T>>`, que hace lo mismo. Lo importante no es la librería, sino aplicar **una sola estrategia en todo el repositorio**.

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

## La pantalla tiene más de tres estados

El detalle que casi nadie modela: **datos en pantalla y un refresco que falla**. El usuario tiene 100 gastos cargados, desliza para refrescar y la petición falla. Si tu Cubit hace `emit(ExpensesError(failure))`, acabas de borrar los 100 gastos de la pantalla por un error de red.

Una pantalla de datos no tiene tres estados (cargando, datos, error), tiene al menos seis: inicial, cargando, con datos, **refrescando con datos**, vacía y error. Y un refresco fallido conserva lo que ya había:

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

La UI muestra la lista de siempre y un aviso discreto con «Reintentar» si `refreshError?.isRetryable` es verdadero. Un `UnauthorizedFailure`, en cambio, no se reintenta: dispara un comportamiento (cerrar la sesión y volver al inicio de sesión).

## Logs no son mensajes de error

El usuario lee «No se pudieron cargar los gastos». Tu log guarda la excepción original, el código, la operación y el stack trace completo. Son dos audiencias distintas y no deben compartir texto.

## Tres antipatrones que sigo viendo en code review

- `catch (e) { rethrow; }`: no aportas nada; quita el try/catch.
- `catch (e) { throw Exception('error'); }`: pierdes el tipo y el stack trace originales.
- `Text(exception.toString())`: le acabas de enseñar Firestore a tu usuario.

Captura una excepción solo si vas a **traducirla, registrarla o convertirla en un Failure**. Si no, déjala pasar.

## En resumen

El objetivo no es que la app nunca falle. Es que cada fallo sepa exactamente a dónde ir:

```text
Exception → traducción → Failure → estado → experiencia
```
