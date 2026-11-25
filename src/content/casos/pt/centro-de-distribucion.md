---
---

## Contexto

Centro de Distribuição é um **app interno de logística** da Treew (Canadá): recebimento de mercadorias, entradas e saídas de estoque, atribuição de locais no armazém, fornecedores e categorias, expedição de pedidos e **impressão de etiquetas**. Por ser um app interno, não há links nem capturas de tela.

## Meu papel

Desenvolvedor Flutter na Treew, entre 2024 e 2025. Entrei quando o app já existia para acrescentar uma funcionalidade completa: **ler o QR dos produtos do armazém**, mostrá-los numa lista no app e **despachá-los**.

## Stack e arquitetura

**DDD com Clean Architecture.**

- **Flutter**. **Estado**: BLoC e GetX. **Injeção de dependências**: GetIt.
- **Leitura de códigos** de barras e QR com Scandit, e **OCR** com Tesseract.
- **Armazenamento local** com Hive, SQLite e SharedPreferences.
- **API REST** com Dio, **Firebase** Analytics e Crashlytics, e geolocalização.

## Decisões técnicas

- **Modo offline.** Os dados são guardados no dispositivo (Hive e SQLite) para continuar trabalhando no armazém mesmo sem rede.
- **Uma lição sobre o estado.** As decisões de arquitetura são anteriores à minha chegada. O app mistura BLoC e GetX porque, ao longo do desenvolvimento, diferentes desenvolvedores foram acrescentando cada um o seu gerenciador de estado. Essa mistura complica a manutenção, e por isso nos meus projetos o gerenciador de estado fica definido nas regras desde o primeiro dia.

## Desafios

[PENDENTE: os principais desafios e como você os resolveu]

## Resultado

O app foi testado e distribuído para todos os armazéns da empresa.
