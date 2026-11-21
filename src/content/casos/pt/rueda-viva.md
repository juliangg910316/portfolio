---
---

## Contexto

As bicicletas ergométricas mostram o tempo, a distância, as calorias e a velocidade de cada sessão, mas esses dados se perdem ao desligá-las. Apps genéricos como Strava, Fitbit ou Google Fit permitem registros manuais, mas não têm campos próprios da bicicleta ergométrica, como o odômetro, nem sequências pensadas para o hábito diário.

Rueda Viva é um app para Android e iOS que guarda cada sessão e a transforma em **sequências, estatísticas e recordes**, para dar vontade de voltar a pedalar no dia seguinte.

## Meu papel

É um projeto pessoal do início ao fim: produto, design, arquitetura e código. Desenvolvi com **Spec-Driven Development** e agentes de IA: uma constituição de 6 princípios, requisitos no formato EARS e **6 specs com 43 tarefas**, todas implementadas em 25 commits.

## Stack e arquitetura

Segue a arquitetura oficial do Flutter, em camadas e com uma única direção:

```text
UI (um Cubit por tela) → domínio (modelos freezed e lógica pura) → dados (repositórios + drift)
```

- **Estado**: flutter_bloc, com um Cubit por tela.
- **Injeção de dependências**: get_it.
- **Persistência**: drift sobre SQLite, apenas no dispositivo. Não há servidor.
- **Modelos e estados imutáveis** com freezed, e erros com `Result<T>`.
- **Tema claro e escuro** conforme o celular, com cores próprias e as fontes incluídas no app.

## Decisões técnicas

- **Sem streams.** As leituras retornam `Future<Result<T>>` e cada Cubit recarrega os dados depois de cada ação e ao voltar de outra tela.
- **Sequência estritamente diária.** Só é possível registrar sessões do dia atual e a data é definida pelo app, então não dá para «preencher» sequências depois.
- **Identificadores mantidos.** Ao renomear o app de SpinStreak para Rueda Viva, o pacote e o banco de dados foram mantidos: mudá-los instalaria outro app e os dados seriam perdidos.
- **Contraste WCAG 2.1.** O texto sobre o laranja principal é quase preto, não branco, para chegar a 4,5:1.

## Desafios

- **Regras da sequência sem ambiguidades.** Várias sessões no mesmo dia contam como um só dia, a sequência continua viva até as 23:59 se você ainda não treinou e a melhor sequência é sempre guardada.
- **Migrar o banco de dados** para a versão 2 quando a velocidade máxima passou de decimal para inteiro, sem perder sessões.
- **Registrar uma sessão em menos de 30 segundos**, com seletor de tempo, teclado numérico e ajuda ⓘ em cada parâmetro da bicicleta.

## Resultado

O MVP ficou completo em 16 de outubro de 2026. Depois vieram o suporte a iOS, um design visual próprio (paleta «Fogo», modo claro e escuro) e um nome e um logo novos. É um app de uso pessoal, não publicado nas lojas, e o código é público no GitHub.
