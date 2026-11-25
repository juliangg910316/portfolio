---
---

## Contexto

Uma empresa de segurança privada de Houston (EUA) precisava controlar a presença dos seus vigilantes. O sistema completo tem um backend, um painel web para a empresa e um **app móvel** para os vigilantes: eles entram com o telefone, veem seus turnos e **registram a entrada e a saída com foto e localização GPS**.

## Meu papel

É um projeto freelance. Desenvolvo **o app móvel completo** para Android e iOS e **colaboro no backend** NestJS, com mais de 100 commits, principalmente nas APIs usadas pelo app: trabalhadores, turnos, registros de presença, anomalias, rastreamento e autenticação. O painel web é feito por outra equipe.

## Stack e arquitetura

Segue a arquitetura oficial do Flutter em camadas:

```text
UI → Cubit → repositório (interface no domínio) → implementação em dados → cliente Retrofit → API
```

- **Estado**: Cubits do flutter_bloc com estados freezed.
- **Injeção de dependências**: get_it.
- **HTTP**: Retrofit + Dio, com token Bearer e renovação da sessão.
- **Erros**: fpdart, com `Future<Either<Failure, T>>`.
- **Navegação**: go_router com barra inferior.
- **Nativo**: câmera, geolocalização, serviço em segundo plano e notificações locais.
- **Backend**: NestJS + Prisma + PostgreSQL.
- **Idiomas**: espanhol e inglês.

## Decisões técnicas

- **Erros como valores.** Cada chamada à API retorna um sucesso ou uma falha tipada (`Either`), então a interface precisa tratar os dois casos e não há exceções sem controle.
- **Mappers entre camadas.** Os modelos da API são convertidos em modelos de domínio, e a interface nunca depende do formato do backend.
- **Rastreamento GPS em lotes.** Um serviço em segundo plano envia os pontos do trabalhador ao backend em lotes, em vez de um por um.
- **Contrato da API combinado.** Como colaboro nos dois lados, ajustamos o contrato entre o app e o backend (registro de ponto, sessão, erros e pontos GPS) e o documentamos no repositório do backend.

## Desafios

- **Um registro de ponto confiável**: permissões, câmera, localização e envio da foto para um endpoint próprio, tudo no mesmo fluxo.
- **Rastreamento com o app em segundo plano**, com seu serviço e suas notificações.

## Resultado

O app está na fase final de testes, com o Android no teste interno do Google Play. Depois será publicado na App Store e no Google Play com as contas do cliente. O código é privado.
