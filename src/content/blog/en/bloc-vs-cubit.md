---
title: "Bloc vs Cubit: the difference isn't verbosity, it's traceability"
description: 'When I use Cubit, when I use Bloc, and why the decision is made per feature: BlocObserver, event transformers and a practical rule.'
date: 2026-11-23
tags: [Flutter, Bloc, State management]
translationKey: bloc-cubit
---

For years I argued that Bloc was the only "serious" state management option in Flutter. Today most of my features in production start with a Cubit.

I didn't switch libraries. I switched criteria.

The usual Bloc vs Cubit debate is about how much code you have to write. But that isn't the difference that matters. The real difference is **what you can observe when something breaks** and **how much control you have over what comes in**.

## Same package, a different front door

Bloc and Cubit live in the same package (`package:bloc`), emit immutable states the same way and work with the same widgets: `BlocBuilder`, `BlocListener`, `BlocConsumer`. The only thing that changes is how the user's intent arrives:

- In a **Cubit**, the UI calls a method and the method emits a state.
- In a **Bloc**, the UI adds an **event** and a handler turns it into one or more states.

```dart
// Cubit: method → state
class ThemeCubit extends Cubit<ThemeMode> {
  ThemeCubit() : super(ThemeMode.dark);

  void toggle() => emit(state == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark);
}

// Bloc: event → state
sealed class CounterEvent {}

final class Incremented extends CounterEvent {}

class CounterBloc extends Bloc<CounterEvent, int> {
  CounterBloc() : super(0) {
    on<Incremented>((event, emit) => emit(state + 1));
  }
}
```

For a theme toggle, the event-based version only adds files. But that event layer is exactly what you gain or give up when you choose.

## What a BlocObserver shows you

Plug in a `BlocObserver` and the difference shows up in two lines:

```dart
class AppBlocObserver extends BlocObserver {
  @override
  void onEvent(Bloc<dynamic, dynamic> bloc, Object? event) {
    super.onEvent(bloc, event);
    log('${bloc.runtimeType} ← $event'); // Bloc only
  }

  @override
  void onTransition(Bloc<dynamic, dynamic> bloc, Transition<dynamic, dynamic> transition) {
    super.onTransition(bloc, transition);
    log('$transition'); // Bloc only: event + previous state + next state
  }

  @override
  void onChange(BlocBase<dynamic> bloc, Change<dynamic> change) {
    super.onChange(bloc, change);
    log('${bloc.runtimeType} $change'); // Bloc and Cubit
  }

  @override
  void onError(BlocBase<dynamic> bloc, Object error, StackTrace stackTrace) {
    log('${bloc.runtimeType}', error: error, stackTrace: stackTrace); // Bloc and Cubit
    super.onError(bloc, error, stackTrace);
  }
}

void main() {
  Bloc.observer = AppBlocObserver();
  runApp(const App());
}
```

`onChange()` and `onError()` fire the same way in both. `onEvent()` and `onTransition()` exist **only in Bloc**.

In a log, that means: with Bloc you see `WithdrawMoney → Processing → Completed`. With Cubit you see `Processing → Completed`, and nobody knows what caused it. For a theme toggle it doesn't matter. For a payment flow it does: when a user says they were charged twice, you want to know exactly which events arrived and in what order.

## The transformers a Cubit doesn't have

The other difference is the **event transformers** from `bloc_concurrency`. They decide what happens when an event arrives while the previous one is still being processed. A Cubit has no events, so it has nowhere to apply them.

**`restartable()`: search as you type.** It cancels the running handler when a new event arrives. Put a `debounce` in front and you stop paying for requests nobody will read:

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

With a Cubit, eight keystrokes are eight requests, and the debounce `Timer` ends up living inside the widget. If you've ever hidden a `Timer` in a widget because the Cubit gave you nowhere to put it, that feature was asking for Bloc.

**`droppable()`: the "Pay" button.** The user taps five times and the next four events are dropped until the first one finishes:

```dart
on<PayPressed>(_onPay, transformer: droppable());
```

**`sequential()`: queues.** Offline sync or batch uploads, processed one at a time in the exact order they arrived:

```dart
on<UploadQueued>(_onUpload, transformer: sequential());
```

## The rule I follow

- **Cubit by default**: toggles, forms, CRUD, a single data fetch and little more. Fewer files, the same immutability and the same tests with `bloc_test`.
- **Bloc where it counts**: only where you need to control the input flow (search, payments, queues) or audit what triggered each transition (fintech, large teams debugging in production).

The decision is **per feature, not per app**. `BlocBuilder` and `BlocListener` work with both, so committing to one for the whole project is what gets expensive.

## Moving from Cubit to Bloc as a feature grows

If a feature started with a Cubit and now needs concurrency control, the migration stays local: the Cubit's public methods become events, each method body moves into a handler and the states don't change. The UI just swaps `cubit.search(q)` for `bloc.add(QueryChanged(q))`. The widgets that render the state don't even notice.

That's why it isn't worth starting with Bloc "just in case". Start simple and pay for the event layer when the feature asks for it.

## In short

Cubit isn't "Bloc for beginners". It's Bloc without the event layer, and that layer is exactly what you pay for or save when you choose. Ask yourself for each feature: do I need to know what caused each change, or to control what happens when two actions arrive at once? If the answer is no, Cubit. If it's yes, Bloc.
