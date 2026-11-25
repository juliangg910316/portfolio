---
---

## Contexto

SuperPay23 é um **app financeiro interno** da Treew (Canadá) para pessoas e empresas: contas, transferências e pagamentos, **cartões Visa** (emissão, troca de PIN, saldo e aviso de perda), verificação **KYC**, **autenticação em dois fatores**, relatórios financeiros e **pagamentos por QR**. Por ser um app interno, não há links nem capturas de tela.

## Meu papel

**Comecei o app do zero** como desenvolvedor Flutter de uma equipe de produto canadense, em remoto, entre 2024 e 2025. Participei de todo o ciclo: design e implementação de funcionalidades, testes e publicação.

## Stack e arquitetura

**Clean Architecture** em três camadas: apresentação, domínio e infraestrutura.

- **Flutter** para Android e iOS.
- **Estado**: Bloc e Cubit. **Injeção de dependências**: GetIt. **Navegação**: GoRouter.
- **Idiomas**: Easy Localization.
- **Firebase** Analytics e Crashlytics.
- **Criptografia dos dados sensíveis** e integração com APIs bancárias.

## Decisões técnicas

- **Bloc e Cubit, cada um onde se encaixa.** Os dois oferecem um estado único e imutável, rastreabilidade das mudanças e widgets próprios para reagir a elas. Os Cubits exigem menos código, então eram a opção padrão. Nas telas de pagamento e nas que disparam ações que devem ser executadas uma única vez, usava-se Bloc, que permite controlar cada evento que entra.
- **Dados sensíveis com `flutter_secure_storage`**, que os guarda criptografados no Keychain do iOS e no Keystore do Android, nunca em texto puro.
- **Autenticação em dois fatores com app autenticador** (códigos de uso único gerados no celular do usuário).
- **Clean Architecture** em todo o app, para separar as regras de negócio do Flutter e das APIs bancárias.

## Desafios

[PENDENTE: os principais desafios e como você os resolveu]

## Resultado

O app ficou funcionando em uso interno: com ele são pagos os salários dos funcionários e as compras no Supermarket23, a loja virtual da empresa.
