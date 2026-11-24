---
title: 'Bloc vs Cubit: la diferencia no es la verbosidad, es la trazabilidad'
description: 'Cuándo uso Cubit, cuándo Bloc y por qué la decisión se toma por feature: BlocObserver, transformadores de eventos y una regla práctica.'
date: 2026-11-23
tags: [Flutter, Bloc, Gestión de estado]
translationKey: bloc-cubit
---

Durante años defendí que Bloc era la única opción «seria» de gestión de estado en Flutter. Hoy la mayoría de mis features en producción empiezan con un Cubit.

No cambié de librería. Cambié de criterio.

La discusión habitual entre Bloc y Cubit gira en torno a cuánto código hay que escribir. Pero esa no es la diferencia importante. La diferencia real es **qué puedes observar cuando algo falla** y **cuánto control tienes sobre lo que entra**.

## Mismo paquete, otra puerta de entrada

Bloc y Cubit viven en el mismo paquete (`package:bloc`), emiten estados inmutables de la misma forma y funcionan con los mismos widgets: `BlocBuilder`, `BlocListener`, `BlocConsumer`. Lo único que cambia es cómo llega la intención del usuario:

- En un **Cubit**, la UI llama a un método y el método emite un estado.
- En un **Bloc**, la UI añade un **evento** y un manejador lo convierte en uno o varios estados.

```dart
// Cubit: método → estado
class ThemeCubit extends Cubit<ThemeMode> {
  ThemeCubit() : super(ThemeMode.dark);

  void toggle() => emit(state == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark);
}

// Bloc: evento → estado
sealed class CounterEvent {}

final class Incremented extends CounterEvent {}

class CounterBloc extends Bloc<CounterEvent, int> {
  CounterBloc() : super(0) {
    on<Incremented>((event, emit) => emit(state + 1));
  }
}
```

Con un toggle de tema, la versión con eventos solo añade archivos. Pero esa capa de eventos es justo lo que se gana o se pierde al elegir.

## Lo que te enseña un BlocObserver

Conecta un `BlocObserver` y la diferencia se ve en dos líneas:

```dart
class AppBlocObserver extends BlocObserver {
  @override
  void onEvent(Bloc<dynamic, dynamic> bloc, Object? event) {
    super.onEvent(bloc, event);
    log('${bloc.runtimeType} ← $event'); // solo Bloc
  }

  @override
  void onTransition(Bloc<dynamic, dynamic> bloc, Transition<dynamic, dynamic> transition) {
    super.onTransition(bloc, transition);
    log('$transition'); // solo Bloc: evento + estado anterior + estado nuevo
  }

  @override
  void onChange(BlocBase<dynamic> bloc, Change<dynamic> change) {
    super.onChange(bloc, change);
    log('${bloc.runtimeType} $change'); // Bloc y Cubit
  }

  @override
  void onError(BlocBase<dynamic> bloc, Object error, StackTrace stackTrace) {
    log('${bloc.runtimeType}', error: error, stackTrace: stackTrace); // Bloc y Cubit
    super.onError(bloc, error, stackTrace);
  }
}

void main() {
  Bloc.observer = AppBlocObserver();
  runApp(const App());
}
```

`onChange()` y `onError()` se disparan igual en los dos. `onEvent()` y `onTransition()` existen **solo en Bloc**.

Traducido a un log: con Bloc ves `RetirarDinero → Procesando → Completado`. Con Cubit ves `Procesando → Completado`, y nadie sabe qué lo provocó. En un toggle de tema da igual. En un flujo de pago, no: cuando un usuario dice que le cobraron dos veces, quieres saber exactamente qué eventos llegaron y en qué orden.

## Los transformadores que un Cubit no tiene

El otro diferencial son los **transformadores de eventos** de `bloc_concurrency`. Deciden qué pasa cuando llega un evento mientras el anterior todavía se está procesando. Un Cubit no tiene eventos, así que no tiene dónde aplicarlos.

**`restartable()`: búsqueda mientras se escribe.** Cancela el manejador en curso cuando llega un evento nuevo. Con un `debounce` delante, dejas de pagar peticiones que nadie va a leer:

```dart
import 'package:bloc_concurrency/bloc_concurrency.dart';
import 'package:stream_transform/stream_transform.dart';

EventTransformer<E> debounceRestartable<E>(Duration duration) {
  return (events, mapper) => restartable<E>().call(events.debounce(duration), mapper);
}

class SearchBloc extends Bloc<SearchEvent, SearchState> {
  SearchBloc(this._repository) : super(const SearchInitial()) {
    on<QueryChanged>(
      _onQueryChanged,
      transformer: debounceRestartable(const Duration(milliseconds: 300)),
    );
  }

  final SearchRepository _repository;

  Future<void> _onQueryChanged(QueryChanged event, Emitter<SearchState> emit) async {
    emit(const SearchLoading());
    emit(SearchLoaded(await _repository.find(event.query)));
  }
}
```

Con un Cubit, ocho pulsaciones son ocho peticiones, y el `Timer` del debounce termina viviendo dentro del widget. Si alguna vez escondiste un `Timer` en un widget porque el Cubit no te daba dónde ponerlo, esa feature pedía Bloc.

**`droppable()`: el botón «Pagar».** El usuario toca cinco veces y los cuatro eventos siguientes se descartan hasta que termine el primero:

```dart
on<PayPressed>(_onPay, transformer: droppable());
```

**`sequential()`: colas.** Sincronización sin conexión o subida por lotes, procesada de uno en uno y en el orden exacto de llegada:

```dart
on<UploadQueued>(_onUpload, transformer: sequential());
```

## La regla que aplico

- **Cubit por defecto**: toggles, formularios, CRUD, una carga de datos y poco más. Menos archivos, la misma inmutabilidad y los mismos tests con `bloc_test`.
- **Bloc quirúrgico**: solo donde necesitas controlar el flujo de entrada (búsquedas, pagos, colas) o auditar qué disparó cada transición (fintech, equipos grandes que depuran en producción).

La decisión es **por feature, no por app**. `BlocBuilder` y `BlocListener` funcionan con los dos, así que casarte con uno para todo el proyecto es lo que sale caro.

## Pasar de Cubit a Bloc cuando la feature crece

Si una feature empezó con Cubit y empieza a necesitar control de concurrencia, la migración es local: los métodos públicos del Cubit se convierten en eventos, el cuerpo de cada método pasa a un manejador y los estados no cambian. La UI solo cambia `cubit.search(q)` por `bloc.add(QueryChanged(q))`. Los widgets que dibujan el estado ni se enteran.

Por eso no merece la pena empezar con Bloc «por si acaso». Empieza simple y paga la capa de eventos cuando la feature te la pida.

## En resumen

Cubit no es «Bloc para principiantes». Es Bloc sin la capa de eventos, y esa capa es exactamente lo que pagas o te ahorras al elegir. Pregúntate en cada feature: ¿necesito saber qué provocó cada cambio, o controlar qué pasa cuando llegan dos acciones a la vez? Si la respuesta es no, Cubit. Si es sí, Bloc.
