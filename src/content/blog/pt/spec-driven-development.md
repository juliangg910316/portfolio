---
title: 'Spec-Driven Development no Flutter: a IA não escreve melhor, ela para de adivinhar'
description: 'Por que escrevo uma especificação antes de pedir código a um agente de IA, o que ela deve cobrir no Flutter e como apliquei isso no Rueda Viva.'
date: 2026-11-23
tags: [Flutter, IA, Spec-Driven Development]
translationKey: sdd
---

Antes, o gargalo era escrever código. Hoje um agente de IA escreve 500 linhas em segundos. O gargalo é **saber o que você pediu**.

Peça a um agente «faça a tela de pedidos» e ele provavelmente vai devolver:

- um widget de 400 linhas,
- `setState` misturado com Riverpod,
- um `fromJson()` dentro da entidade de domínio.

Não é culpa do modelo. É *vibe coding*: um prompt ambíguo, regras que se diluem numa conversa longa e features geradas separadamente que não se encaixam. Funciona até a terceira feature. Depois, cada prompt quebra algo que já estava bom.

## Inverter a ordem

O **Spec-Driven Development (SDD)** inverte a ordem: primeiro você especifica o comportamento e depois gera o código. A especificação é a fonte de verdade para a sua equipe e para o agente. Se o código e a spec não batem, quem está errado é o código.

Não é voltar aos documentos de requisitos de cem páginas. Uma boa spec de feature ocupa meia página e se escreve em minutos.

## O que uma spec deve cobrir no Flutter

No Flutter, uma spec útil responde a três perguntas.

### 1. UI: o que o usuário vê em cada estado?

`loading`, `success`, `empty` e `error`, no mínimo, e o que aparece em cada um. Se você não escrever, o agente inventa uma tela de erro genérica e esquece o estado vazio.

### 2. Estado: qual é o contrato?

Quais eventos entram e quais estados saem (Bloc), ou quais métodos o Cubit ou o Notifier (Riverpod) expõem. Sem esse contrato, a IA inventa o próprio fluxo em cada feature e nenhuma se parece com a anterior.

### 3. Camadas: onde vai cada coisa?

DTO e data source em `data/`, entidade e repositório em `domain/`, widgets em `presentation/`. E as proibições explícitas: nada de Dio em `presentation/`.

É assim uma spec mínima que passo a um agente antes de pedir uma feature:

```markdown
# orders_list.spec.md

## UI
- loading → esqueleto de 5 itens
- empty   → ilustração + «Você ainda não tem pedidos»
- error   → mensagem + botão Tentar de novo
- success → lista paginada (20 por página)

## Estado (OrdersCubit)
- load() → loading → success | empty | error
- refresh() mantém a lista enquanto recarrega

## Camadas
- OrderDto (data/) → Order (domain/) com toEntity()
- OrdersRepository: interface em domain/, implementação em data/
- presentation/ não importa dio nem data/
```

Meia página. E economiza três rodadas de «não, assim não».

## A spec não trabalha sozinha: Context Engineering

Uma spec descreve uma feature. As regras que valem para **todo** o projeto ficam em outro lugar, para não repeti-las em cada prompt:

- **Regras do projeto** (`CLAUDE.md`, `AGENTS.md`, `.cursor/rules`): arquitetura, gerenciamento de estado, injeção de dependências, convenções de nomes e de commits.
- **Skills do agente**: instruções reutilizáveis que ensinam ao assistente os padrões e antipadrões de cada pacote (como usar o `go_router`, como escrever um teste com `bloc_test`…).

A IA não começa a escrever melhor. **Ela para de adivinhar.**

## Meu fluxo, passo a passo

Nos meus projetos pessoais sigo este ciclo com agentes de IA:

1. **Constituição**: os princípios do projeto (arquitetura, testes primeiro, o que é proibido).
2. **Especificação** de cada feature, com critérios de aceite verificáveis.
3. **Plano técnico**: quais arquivos são tocados e em quais camadas.
4. **Tarefas** pequenas e ordenadas, cada uma com o seu teste.
5. **Implementação com agentes**, tarefa por tarefa.
6. **Testes e revisão**: leio cada diff como se fosse o pull request de um colega.

No [Rueda Viva](/pt/proyectos/rueda-viva/), um app de bicicleta ergométrica com sequências e recordes, esse fluxo resultou em **6 specs e 43 tarefas**. O que mais notei não foi a velocidade, e sim a coerência: a sexta feature se parecia com a primeira, porque as duas saíam do mesmo contrato.

## O que o SDD não faz

O SDD não substitui o critério técnico: alguém precisa decidir que a lista é paginada ou que a atualização mantém os dados. Também não substitui a revisão de código. O que muda é **onde** você coloca o esforço: em definir bem o problema e em revisar, não em corrigir depois o que o agente imaginou.

## Resumindo

Escrever código já é barato. Definir bem o problema, não. Antes de pedir uma feature a um agente, escreva meia página dizendo o que o usuário vê, qual é o contrato do estado e onde vai cada coisa. É o melhor investimento de tempo que faço hoje num projeto com IA.
