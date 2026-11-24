---
title: 'El patrón Repository en Flutter: la frontera importa más que la interfaz'
description: 'Services, repositories y modelos de dominio: cómo separar de verdad los datos de la UI sin llenar el proyecto de interfaces que nadie necesita.'
date: 2026-11-23
tags: [Flutter, Arquitectura, Clean Architecture]
translationKey: repository
---

Una vez revisé un pull request con un repositorio que devolvía un `Query<Item>` de Firestore directamente a la UI. La interfaz se veía limpia. El acoplamiento a Firebase seguía intacto.

Ese es el error más común al aplicar el patrón Repository: confundir «tener una clase que se llama Repository» con «haber separado de verdad los datos de la UI». Y tiene un error gemelo, el contrario: abstraerlo todo por si acaso.

## Qué es un repositorio (y qué no)

La guía oficial de arquitectura de Flutter divide la capa de datos en dos piezas:

- **Services**: envoltorios sin estado sobre una API o un SDK (Dio, SQLite, Firebase). Hablan el idioma de la fuente de datos y devuelven DTOs tal cual llegan.
- **Repositories**: coordinan uno o varios services, convierten los DTOs en **modelos de dominio inmutables** y se ocupan de la caché, los reintentos y los errores. Son la única fuente de verdad para un tipo de dato.

```dart
// Service: conoce HTTP y nada más.
class WeatherService {
  WeatherService(this._dio);
  final Dio _dio;

  Future<WeatherDto> fetchWeather(String city) async {
    final response = await _dio.get<Map<String, dynamic>>('/weather', queryParameters: {'q': city});
    return WeatherDto.fromJson(response.data!);
  }
}

// Repository: habla el idioma de la app.
class WeatherRepository {
  WeatherRepository(this._service);
  final WeatherService _service; // privado: la UI nunca lo ve

  Future<Weather> getWeather(String city) async {
    final dto = await _service.fetchWeather(city);
    return Weather(city: city, celsius: dto.main.temp, condition: Condition.fromCode(dto.weather.first.id));
  }
}
```

La UI y los Cubits solo conocen `Weather`. Si mañana la API cambia el formato del JSON, el cambio se queda en el DTO y en el mapeo. Nada más se entera.

## Trampa 1: la abstracción con fugas

Volvamos al `Query<Item>`. Si el repositorio devuelve tipos del SDK (`Query`, `DocumentSnapshot`, `Response`, `FirebaseException`), la frontera no existe: la presentación sigue sabiendo que debajo hay Firestore. El día que migras a una API REST, terminas tocando widgets.

La regla es sencilla: **nada que salga de un repositorio puede importar el SDK**. Ni los modelos, ni los errores, ni los streams. Si necesitas tiempo real, el repositorio expone un `Stream<List<Item>>` de tu dominio, no el `Stream<QuerySnapshot>` de Firestore.

## Trampa 2: el mínimo común denominador

El extremo opuesto también sale caro. Diseñar un repositorio genérico «para cualquier base de datos» obliga a quedarte con lo que todas tienen en común y a renunciar a lo que hace buena a cada una: la paginación por cursor de Firestore, las consultas en tiempo real o las transacciones de SQLite. Un repositorio no tiene que ocultar todas las diferencias del mundo. Tiene que ocultar **las de tu app**.

## YAGNI: primero una clase concreta

La práctica que aplico en producción:

1. **Empieza con una clase concreta**, sin interfaz.
2. **Añade la abstracción solo ante un escenario real**: varias implementaciones a la vez (una local y otra remota para el modo sin conexión) o una necesidad de test que la clase concreta no cubre.
3. **Si esos escenarios no llegan, la clase concreta se queda como está.**

Crear `abstract class WeatherRepository` + `WeatherRepositoryImpl` para cada repositorio duplica archivos sin aportar nada cuando solo existe una forma de traer el clima.

Además, Dart te lo pone fácil: **toda clase define una interfaz implícita**. Para un test puedes escribir un doble sin tocar el código de producción:

```dart
class FakeWeatherRepository implements WeatherRepository {
  @override
  Future<Weather> getWeather(String city) async =>
      Weather(city: city, celsius: 21, condition: Condition.clear);
}
```

Con `mocktail` pasa lo mismo: `class MockWeatherRepository extends Mock implements WeatherRepository {}` funciona con una clase concreta.

## Cuando sí hace falta una interfaz: dos fuentes de datos

El caso clásico es el modo sin conexión. Ahí la abstracción paga su precio, porque hay dos implementaciones reales que el repositorio coordina:

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

La UI escucha la base de datos local (siempre responde, haya red o no) y el repositorio decide cuándo refrescar desde el servidor.

## SDKs que no se pueden simular: composición

Algunos tipos de los SDKs no se pueden implementar ni extender en tus tests, como el `User` de Firebase Auth. La solución no es pelearse con ellos, sino **no dejarlos salir**: conviértelos en tu propio modelo en la frontera.

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

El resto de la app trabaja con `AppUser`, que puedes crear en una línea en cualquier test.

## En resumen

La abstracción no es un dogma: es una herramienta con costes. El valor del patrón Repository está en la **frontera clara** que crea entre tu app y el mundo exterior, no en cuántos archivos generas para justificarla. Empieza concreto, no dejes escapar los tipos del SDK y abstrae cuando aparezca la segunda implementación, no antes.
