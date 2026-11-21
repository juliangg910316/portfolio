---
---

## Contexto

Centro de Distribuição é um **app interno de logística** da Treew (Canadá): recebimento de mercadorias, entradas e saídas de estoque, atribuição de locais no armazém, fornecedores e categorias, expedição de pedidos e **impressão de etiquetas**. Por ser um app interno, não há links nem capturas de tela.

## Meu papel

Desenvolvedor Flutter do app na Treew, entre 2024 e 2025. [PENDENTE: quais partes você fez e quais a equipe]

## Stack e arquitetura

**DDD com Clean Architecture.**

- **Flutter**. **Estado**: BLoC e GetX. **Injeção de dependências**: GetIt.
- **Leitura de códigos** de barras e QR com Scandit, e **OCR** com Tesseract.
- **Armazenamento local** com Hive, SQLite e SharedPreferences.
- **API REST** com Dio, **Firebase** Analytics e Crashlytics, e geolocalização.

## Decisões técnicas

- **Modo offline.** Os dados são guardados no dispositivo (Hive e SQLite) para continuar trabalhando no armazém mesmo sem rede.
- [PENDENTE: outras decisões técnicas explicadas, p. ex. por que Scandit e Tesseract]

## Desafios

[PENDENTE: os principais desafios e como você os resolveu]

## Resultado

[PENDENTE: status do app e resultado]
