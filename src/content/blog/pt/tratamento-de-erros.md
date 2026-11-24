---
title: 'Tratamento de erros no Flutter: uma decisão de arquitetura, não um try/catch'
description: 'Exceptions versus Failures, o mapeamento na camada de dados, um Result como contrato e a tela que não deveria apagar seus dados ao falhar.'
date: 2026-11-23
tags: [Flutter, Arquitetura, Erros]
translationKey: errores
---

«Algo deu errado.»

É isso que o seu usuário vê. No seu console, ao mesmo tempo: `FirebaseAuthException: The password is invalid`.

Uma das duas mensagens serve. Nenhuma está na camada certa.

O tratamento de erros não é um detalhe de implementação. É uma decisão de arquitetura. A pergunta não é «onde coloco o try/catch?», e sim **em que ponto desta cadeia cada falha é tratada**:

```text
Firebase → DataSource → Repository → Cubit / Notifier → UI
```

## Cada camada sabe uma coisa diferente

A regra que organiza tudo: **trate o erro na camada que tem contexto suficiente para decidir algo com sentido**.

- A **camada de dados** sabe que o HTTP devolveu um 401, que houve timeout ou que o Firestore respondeu `permission-denied`.
- O **domínio** sabe que o usuário não está autorizado ou que a despesa que ele procura não existe.
- A **UI** sabe se isso vai num snackbar, num diálogo ou se é hora de voltar para a tela de login.

## Exception versus Failure

A distinção que organiza tudo:

- Uma **Exception** é um detalhe de implementação: `FirebaseException`, `SocketException`, `DioException`, `TimeoutException`.
- Um **Failure** é um problema com significado para o seu app: `NetworkFailure`, `UnauthorizedFailure`, `NotFoundFailure`.

```dart
sealed class Failure {
  const Failure(this.message);
  final String message;

  /// Faz sentido oferecer «Tentar de novo»?
  bool get isRetryable => false;
}

final class NetworkFailure extends Failure {
  const NetworkFailure() : super('Sem conexão');
  @override
  bool get isRetryable => true;
}

final class UnauthorizedFailure extends Failure {
  const UnauthorizedFailure() : super('Sessão inválida');
}

final class NotFoundFailure extends Failure {
  const NotFoundFailure() : super('Não encontrado');
}

final class UnexpectedFailure extends Failure {
  const UnexpectedFailure(super.message);
}
```

Se uma `FirebaseAuthException` chega ao widget, a sua apresentação já conhece o Firebase: no dia em que você migrar para REST, vai acabar mexendo na UI.

## O mapeamento vive na camada de dados

Hoje o Firebase devolve `permission-denied`; amanhã uma API REST devolve um 403. Os dois precisam virar o mesmo `UnauthorizedFailure`. Para o domínio, tanto faz de onde veio.

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
    _ => UnexpectedFailure(e.message ?? 'Erro HTTP'),
  };
}
```

## A falha faz parte do contrato

Compare estas duas assinaturas:

```dart
Future<List<Expense>> getExpenses();          // e se falhar?
Future<Result<List<Expense>>> getExpenses();  // sucesso → lista · falha → Failure
```

A segunda diz no próprio tipo que a operação pode falhar, e o compilador obriga quem chama a tratar os dois casos. Com as classes seladas do Dart 3 você não precisa de nenhuma biblioteca:

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

No projeto SCA uso o `fpdart` com `Future<Either<Failure, T>>`, que faz o mesmo. O importante não é a biblioteca, e sim aplicar **uma única estratégia em todo o repositório**.

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

## A tela tem mais de três estados

O detalhe que quase ninguém modela: **dados na tela e uma atualização que falha**. O usuário tem 100 despesas carregadas, puxa para atualizar e a requisição falha. Se o seu Cubit faz `emit(ExpensesError(failure))`, você acabou de apagar as 100 despesas da tela por causa de um erro de rede.

Uma tela de dados não tem três estados (carregando, dados, erro), tem pelo menos seis: inicial, carregando, com dados, **atualizando com dados**, vazia e erro. E uma atualização que falha preserva o que já havia:

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

A UI mostra a lista de sempre e um aviso discreto com «Tentar de novo» se `refreshError?.isRetryable` for verdadeiro. Já um `UnauthorizedFailure` não se tenta de novo: ele dispara um comportamento (encerrar a sessão e voltar para o login).

## Logs não são mensagens de erro

O usuário lê «Não foi possível carregar as despesas». O seu log guarda a exceção original, o código, a operação e o stack trace completo. São dois públicos diferentes e não devem compartilhar texto.

## Três antipadrões que ainda vejo em code review

- `catch (e) { rethrow; }`: não acrescenta nada; tire o try/catch.
- `catch (e) { throw Exception('error'); }`: você perde o tipo e o stack trace originais.
- `Text(exception.toString())`: você acabou de mostrar o Firestore para o seu usuário.

Capture uma exceção só se você for **traduzi-la, registrá-la ou convertê-la num Failure**. Se não, deixe-a passar.

## Resumindo

O objetivo não é que o app nunca falhe. É que cada falha saiba exatamente para onde ir:

```text
Exception → tradução → Failure → estado → experiência
```
