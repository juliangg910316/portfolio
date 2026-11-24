---
title: 'O padrão Repository no Flutter: a fronteira importa mais que a interface'
description: 'Services, repositories e modelos de domínio: como separar de verdade os dados da UI sem encher o projeto de interfaces que ninguém precisa.'
date: 2026-11-23
tags: [Flutter, Arquitetura, Clean Architecture]
translationKey: repository
---

Uma vez revisei um pull request com um repositório que devolvia um `Query<Item>` do Firestore direto para a UI. A interface parecia limpa. O acoplamento ao Firebase continuava intacto.

Esse é o erro mais comum ao aplicar o padrão Repository: confundir «ter uma classe chamada Repository» com «ter separado de verdade os dados da UI». E ele tem um irmão gêmeo, o erro oposto: abstrair tudo por precaução.

## O que é um repositório (e o que não é)

O guia oficial de arquitetura do Flutter divide a camada de dados em duas peças:

- **Services**: wrappers sem estado sobre uma API ou um SDK (Dio, SQLite, Firebase). Falam a língua da fonte de dados e devolvem DTOs do jeito que chegam.
- **Repositories**: coordenam um ou vários services, convertem os DTOs em **modelos de domínio imutáveis** e cuidam de cache, novas tentativas e erros. São a única fonte de verdade para um tipo de dado.

```dart
// Service: conhece HTTP e nada mais.
class WeatherService {
  WeatherService(this._dio);
  final Dio _dio;

  Future<WeatherDto> fetchWeather(String city) async {
    final response = await _dio.get<Map<String, dynamic>>('/weather', queryParameters: {'q': city});
    return WeatherDto.fromJson(response.data!);
  }
}

// Repository: fala a língua do app.
class WeatherRepository {
  WeatherRepository(this._service);
  final WeatherService _service; // privado: a UI nunca o vê

  Future<Weather> getWeather(String city) async {
    final dto = await _service.fetchWeather(city);
    return Weather(city: city, celsius: dto.main.temp, condition: Condition.fromCode(dto.weather.first.id));
  }
}
```

A UI e os Cubits só conhecem `Weather`. Se amanhã a API mudar o formato do JSON, a mudança fica no DTO e no mapeamento. Mais ninguém fica sabendo.

## Armadilha 1: a abstração com vazamentos

Voltemos ao `Query<Item>`. Se o repositório devolve tipos do SDK (`Query`, `DocumentSnapshot`, `Response`, `FirebaseException`), a fronteira não existe: a apresentação continua sabendo que embaixo há Firestore. No dia em que você migra para uma API REST, acaba mexendo em widgets.

A regra é simples: **nada que saia de um repositório pode importar o SDK**. Nem os modelos, nem os erros, nem os streams. Se você precisa de tempo real, o repositório expõe um `Stream<List<Item>>` do seu domínio, não o `Stream<QuerySnapshot>` do Firestore.

## Armadilha 2: o mínimo denominador comum

O extremo oposto também sai caro. Projetar um repositório genérico «para qualquer banco de dados» obriga você a ficar com o que todos têm em comum e a abrir mão do que torna cada um bom: a paginação por cursor do Firestore, as consultas em tempo real ou as transações do SQLite. Um repositório não precisa esconder todas as diferenças do mundo. Precisa esconder **as do seu app**.

## YAGNI: primeiro uma classe concreta

A prática que aplico em produção:

1. **Comece com uma classe concreta**, sem interface.
2. **Acrescente a abstração só diante de um cenário real**: várias implementações ao mesmo tempo (uma local e outra remota para o modo offline) ou uma necessidade de teste que a classe concreta não cobre.
3. **Se esses cenários não chegarem, a classe concreta fica como está.**

Criar `abstract class WeatherRepository` + `WeatherRepositoryImpl` para cada repositório duplica arquivos sem acrescentar nada quando só existe uma forma de buscar o clima.

Além disso, o Dart facilita: **toda classe define uma interface implícita**. Para um teste, você pode escrever um dublê sem mexer no código de produção:

```dart
class FakeWeatherRepository implements WeatherRepository {
  @override
  Future<Weather> getWeather(String city) async =>
      Weather(city: city, celsius: 21, condition: Condition.clear);
}
```

Com o `mocktail` acontece o mesmo: `class MockWeatherRepository extends Mock implements WeatherRepository {}` funciona com uma classe concreta.

## Quando a interface faz falta: duas fontes de dados

O caso clássico é o modo offline. Aí a abstração se paga, porque há duas implementações reais que o repositório coordena:

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

A UI escuta o banco local (que sempre responde, com ou sem rede) e o repositório decide quando atualizar a partir do servidor.

## SDKs que não podem ser simulados: composição

Alguns tipos dos SDKs não podem ser implementados nem estendidos nos seus testes, como o `User` do Firebase Auth. A solução não é brigar com eles, e sim **não deixá-los sair**: converta-os no seu próprio modelo na fronteira.

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

O resto do app trabalha com `AppUser`, que você cria em uma linha em qualquer teste.

## Resumindo

A abstração não é um dogma: é uma ferramenta com custos. O valor do padrão Repository está na **fronteira clara** que ele cria entre o seu app e o mundo externo, não em quantos arquivos você gera para justificá-la. Comece concreto, não deixe os tipos do SDK escaparem e abstraia quando aparecer a segunda implementação, não antes.
