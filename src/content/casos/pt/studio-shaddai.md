---
---

## Contexto

Studio Shaddai é um salão de unhas de Curitiba. As clientes precisavam ver os serviços e **agendar horários** conforme a disponibilidade do salão, e a dona, gerenciar a agenda. No início, o código estava dividido em dois repositórios: um app com Firebase e agendamentos, e um site com o design definitivo.

## Meu papel

É um projeto para uma cliente. Sou responsável pelo desenvolvimento completo do app para **Android, iOS e Web**: arquitetura, unificação dos dois repositórios, conexão com o Firebase e publicação do site em dshaddai.com.

## Stack e arquitetura

Arquitetura **por funcionalidades** (`core`, `data`, `features`), com uma única direção:

```text
features → data → Firebase
```

- **Flutter** para Android, iOS e Web com um único código.
- **Estado**: Riverpod. **Navegação**: go_router.
- **Backend 100 % Firebase**: Auth com Google Sign-In, Firestore, Cloud Messaging e Cloud Functions.
- **Tema claro e escuro** (escuro por padrão) e a interface em espanhol e português, com seletor manual.

## Decisões técnicas

- **Um único repositório.** A base é o app (conexão com o Firebase e agendamentos) e do site vêm o tema, a tipografia, o seletor de idioma e a landing.
- **As mesmas funções, uma interface por plataforma.** Na web, uma landing de uma página em que o scroll é a estrutura; no Android e no iOS, navegação com barra inferior. Os dados e a lógica são compartilhados.
- **Só a camada de dados fala com o Firebase.** Os repositórios recebem Firestore e Auth como parâmetros opcionais para poder usar dublês nos testes.
- **Serviços e preços no Firestore**, em vez de ficarem escritos no código e nos arquivos de tradução.

## Desafios

- **Calcular os horários livres** da agenda conforme a disponibilidade configurada pela administradora.
- **Painel administrativo**: confirmar ou cancelar horários, falar pelo WhatsApp, configurar o calendário e bloquear clientes.
- **Unir dois projetos** com arquiteturas diferentes sem perder a conexão com o Firebase.

## Resultado

O site está publicado em dshaddai.com. Faltam as notificações push, as Cloud Functions e as regras de segurança do Firestore, e a meta é publicar o app no Google Play e na App Store. [PENDENTE: status e data da publicação nas lojas]
