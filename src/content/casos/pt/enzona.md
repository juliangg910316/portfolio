---
---

## Contexto

ENZONA é a **plataforma nacional de pagamentos digitais de Cuba**: um app bancário para Android com pagamentos e transferências, mensagens em tempo real e serviços de localização em mapas. É um sistema crítico de segurança usado em todo o país.

## Meu papel

Fui **membro fundador** do projeto e seu **desenvolvedor mobile principal por quase 8 anos** na Xetid. Projetei e implementei toda a arquitetura Android e mantive a estabilidade em produção de uma plataforma de escala nacional.

## Stack e arquitetura

- **Java nativo** com arquitetura **MVVM**.
- **SQLCipher** para o banco de dados local criptografado.
- **MQTT e XMPP (Smack)** para mensagens e transações em tempo real.
- **Retrofit** para a API, **Lottie** para as animações e **Sentry** para os erros em produção.
- **WorkManager** para tarefas em segundo plano e **OpenStreetMap** para os mapas.
- **Segurança**: autenticação biométrica, dois fatores e criptografia RSA.
- **Testes** com JUnit e Mockito.

## Decisões técnicas

- **Armazenamento local criptografado.** Num app de pagamentos, os dados guardados no celular também precisam estar criptografados. Integrei o SQLCipher com o apoio da minha formação em criptografia.
- **Mensagens em tempo real com MQTT e XMPP.** [PENDENTE: por que esses protocolos foram escolhidos]
- [PENDENTE: outra decisão técnica explicada]

## Desafios

[PENDENTE: os principais desafios e como você os resolveu]

## Resultado

O app esteve em produção em escala nacional por anos e é distribuído no Apklis, a loja cubana de apps. [PENDENTE: números de uso, se puderem ser publicados]
