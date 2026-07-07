# 🗄️ Banco de Dados - Módulo 05

Este documento apresenta o schema estruturado do **Módulo 05**. A fonte da verdade para esta estrutura é o script `supabase/mod5_schema.sql`, executado no projeto Supabase (PostgreSQL) compartilhado por todos os módulos. Todas as tabelas deste módulo utilizam o prefixo `mod5_`.

---

## 📌 Convenções Gerais e Relacionamentos

* **Chaves Primárias (PK):** Utilizam o tipo `uuid` com o valor default `gen_random_uuid()` (extensão pgcrypto).
* **Nomenclatura:** Padrão `snake_case` para tabelas e colunas.
* **Datas e Horas:** Tempo em `timestamptz` com `created_at` / `updated_at` definidos com default `now()`.
* **Segurança:** O controle de acesso em nível de linha (RLS) está habilitado em todas as tabelas deste módulo.
* **Independência de Dados:** A tabela `mod5_licitacoes_base` é propositalmente independente e não possui chaves estrangeiras (FKs), atuando como base de precedentes para a IA.
* **Cross-Módulo:** As referências a módulos externos apontam para tabelas como `auth.users`, `mod4` e `mod8_`. Por serem referências entre módulos, colunas como `id_edital_m4` e `id_contrato_m8` não possuem constraint de FK.

---

## 🏗️ Estrutura das Tabelas

### 1. `mod5_fase_licitacao`
Define o domínio de fases da licitação.

| Coluna | Tipo | Restrições |
| :--- | :--- | :--- |
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `nome` | `varchar(50)` | `not null`, `unique` (Valores: Pré-licitação, Julgamento, Contratual) |
| `descricao` | `text` | |

### 2. `mod5_tipo_peca_juridica`
Define o domínio de tipos de peça.

| Coluna | Tipo | Restrições |
| :--- | :--- | :--- |
| `id` | `uuid` | PK |
| `id_fase` | `uuid` | `not null`, FK `mod5_fase_licitacao(id)` |
| `nome` | `varchar(80)` | `not null` (ex.: Impugnação ao Edital, Recurso) |
| `codigo` | `varchar(10)` | Código curto usado na UI e modelo DOCX |
| `descricao` | `text` | |

### 3. `mod5_tese_juridica`
Armazena as teses escolhidas pelo usuário, gravada quando a IA sugere uma tese e a peça é criada.

| Coluna | Tipo | Restrições |
| :--- | :--- | :--- |
| `id` | `uuid` | PK |
| `titulo` | `text` | `not null` |
| `objetivo` | `varchar(50)` | |
| `relevancia` | `varchar(10)` | `check in` ('Baixa', 'Média', 'Alta') |
| `fundamentacao` | `text` | Texto jurídico gerado pela IA |
| `created_at` | `timestamptz` | `not null`, default `now()` |

### 4. `mod5_licitacoes_base`
Base de precedentes (RAG). Tabela consultada por *Full-Text Search* para ancorar as sugestões da IA em decisões reais e atualizada periodicamente.

| Coluna | Tipo | Restrições |
| :--- | :--- | :--- |
| `id` | `uuid` | PK |
| `titulo` | `text` | `not null` |
| `orgao` | `varchar(120)` | ex.: TCU, TJ-SP |
| `tipo_decisao` | `varchar(60)` | ex.: Acórdão, Súmula |
| `numero` | `varchar(60)` | Número da decisão |
| `lei_referencia` | `varchar(60)` | ex.: Lei 14.133/2021 |
| `data_decisao` | `date` | |
| `conteudo` | `text` | `not null` - Corpo da decisão (alvo do FTS) |
| `fonte` | `text` | Origem/URL |
| `created_at` / `updated_at`| `timestamptz` | `not null`, default `now()` (updated_at via trigger) |

### 5. `mod5_peca_juridica`
Tabela central do módulo que concentra as FKs de contexto; as referências variam conforme a fase.

| Coluna | Tipo | Restrições |
| :--- | :--- | :--- |
| `id` | `uuid` | PK |
| `id_usuario` | `uuid` | `not null`, FK `auth.users(id)` `on delete cascade` |
| `id_fase` | `uuid` | `not null`, FK `mod5_fase_
