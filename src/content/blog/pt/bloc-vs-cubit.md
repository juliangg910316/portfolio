---
title: 'Bloc vs Cubit: a diferença não é a verbosidade, é a rastreabilidade'
description: 'Quando uso Cubit, quando uso Bloc e por que a decisão é tomada por feature: BlocObserver, transformadores de eventos e uma regra prática.'
date: 2026-11-23
tags: [Flutter, Bloc, Gerenciamento de estado]
translationKey: bloc-cubit
---

Durante anos defendi que o Bloc era a única opção «séria» de gerenciamento de estado no Flutter. Hoje a maioria das minhas features em produção começa com um Cubit.

Não mudei de biblioteca. Mudei de critério.

A discussão habitual entre Bloc e Cubit gira em torno de quanto código é preciso escrever. Mas essa não é a diferença importante. A diferença real é **o que você consegue observar quando algo falha** e **quanto controle você tem sobre o que entra**.

## Mesmo pacote, outra porta de entrada

Bloc e Cubit vivem no mesmo pacote (`package:bloc`), emitem estados imutáveis da mesma forma e funcionam com os mesmos widgets: `BlocBuilder`, `BlocListener`, `BlocConsumer`. A única coisa que muda é como a intenção do usuário chega:

- Num **Cubit**, a UI chama um método e o método emite um estado.
- Num **Bloc**, a UI adiciona um **evento** e um handler o transforma em um ou vários estados.

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

Num toggle de tema, a versão com eventos só acrescenta arquivos. Mas essa camada de eventos é justamente o que se ganha ou se perde ao escolher.

## O que um BlocObserver mostra

Conecte um `BlocObserver` e a diferença aparece em duas linhas:

```dart
class AppBlocObserver extends BlocObserver {
  @override
  void onEvent(Bloc<dynamic, dynamic> bloc, Object? event) {
    super.onEvent(bloc, event);
    log('${bloc.runtimeType} ← $event'); // só Bloc
  }

  @override
  void onTransition(Bloc<dynamic, dynamic> bloc, Transition<dynamic, dynamic> transition) {
    super.onTransition(bloc, transition);
    log('$transition'); // só Bloc: evento + estado anterior + estado novo
  }

  @override
  void onChange(BlocBase<dynamic> bloc, Change<dynamic> change) {
    super.onChange(bloc, change);
    log('${bloc.runtimeType} $change'); // Bloc e Cubit
  }

  @override
  void onError(BlocBase<dynamic> bloc, Object error, StackTrace stackTrace) {
    log('${bloc.runtimeType}', error: error, stackTrace: stackTrace); // Bloc e Cubit
    super.onError(bloc, error, stackTrace);
  }
}

void main() {
  Bloc.observer = AppBlocObserver();
  runApp(const App());
}
```

`onChange()` e `onError()` disparam igual nos dois. `onEvent()` e `onTransition()` existem **só no Bloc**.

Traduzido para um log: com Bloc você vê `SacarDinheiro → Processando → Concluído`. Com Cubit vê `Processando → Concluído`, e ninguém sabe o que causou isso. Num toggle de tema tanto faz. Num fluxo de pagamento, não: quando um usuário diz que foi cobrado duas vezes, você quer saber exatamente quais eventos chegaram e em que ordem.

## Os transformadores que um Cubit não tem

O outro diferencial são os **transformadores de eventos** do `bloc_concurrency`. Eles decidem o que acontece quando um evento chega enquanto o anterior ainda está sendo processado. Um Cubit não tem eventos, então não tem onde aplicá-los.

**`restartable()`: busca enquanto se digita.** Cancela o handler em andamento quando chega um evento novo. Com um `debounce` na frente, você deixa de pagar por requisições que ninguém vai ler:

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

Com um Cubit, oito teclas são oito requisições, e o `Timer` do debounce acaba morando dentro do widget. Se você já escondeu um `Timer` num widget porque o Cubit não oferecia onde colocá-lo, essa feature pedia Bloc.

**`droppable()`: o botão «Pagar».** O usuário toca cinco vezes e os quatro eventos seguintes são descartados até o primeiro terminar:

```dart
on<PayPressed>(_onPay, transformer: droppable());
```

**`sequential()`: filas.** Sincronização offline ou envio em lote, processados um a um e na ordem exata de chegada:

```dart
on<UploadQueued>(_onUpload, transformer: sequential());
```

## A regra que aplico

- **Cubit por padrão**: toggles, formulários, CRUD, um carregamento de dados e pouco mais. Menos arquivos, a mesma imutabilidade e os mesmos testes com `bloc_test`.
- **Bloc cirúrgico**: só onde você precisa controlar o fluxo de entrada (buscas, pagamentos, filas) ou auditar o que disparou cada transição (fintech, equipes grandes que depuram em produção).

A decisão é **por feature, não por app**. `BlocBuilder` e `BlocListener` funcionam com os dois, então se casar com um deles para o projeto inteiro é o que sai caro.

## Passar de Cubit para Bloc quando a feature cresce

Se uma feature começou com Cubit e passa a precisar de controle de concorrência, a migração é local: os métodos públicos do Cubit viram eventos, o corpo de cada método passa para um handler e os estados não mudam. A UI só troca `cubit.search(q)` por `bloc.add(QueryChanged(q))`. Os widgets que desenham o estado nem percebem.

Por isso não vale a pena começar com Bloc «por precaução». Comece simples e pague pela camada de eventos quando a feature pedir.

## Resumindo

Cubit não é «Bloc para iniciantes». É Bloc sem a camada de eventos, e essa camada é exatamente o que você paga ou economiza ao escolher. Pergunte-se em cada feature: preciso saber o que causou cada mudança, ou controlar o que acontece quando duas ações chegam ao mesmo tempo? Se a resposta for não, Cubit. Se for sim, Bloc.
