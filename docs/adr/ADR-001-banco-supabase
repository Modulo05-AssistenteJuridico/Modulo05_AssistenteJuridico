# ADR 001: Banco de Dados e BaaS (Decisão Global da Turma)

## Status
Proposto

## Contexto
O projeto final é composto por múltiplos módulos desenvolvidos por equipes diferentes. Por isso, será necessário uma base de dados centralizada para que todos os grupos consigam acessar facilmente para trocar informações (como contratos e editais), além de um local para armazenar os PDFs gerados.

## Decisão
Adotaremos o **Supabase** como base central para toda a turma, utilizando seu banco PostgreSQL, sistema de Autenticação e Storage.

## Consequências

### Positivas
* **Padronização:** Padronização total entre a comunicação dos módulos.
* **Agilidade:** APIs RESTful prontos para acessar o banco de dados imediatamente.
* **Armazenamento:** Facilidade nativa no armazenamento e recuperação de arquivos (PDFs).

### Negativas/Trade-offs
* **Limitações do Plano:** Restrições de processamento e armazenamento no plano gratuito.
* **Dependência** Forte acoplamento a um fornecedor específico.
