# [cite_start]🗄️ Banco de Dados - Módulo 05 [cite: 1]

[cite_start]Este documento apresenta o schema estruturado do **Módulo 05**[cite: 3]. [cite_start]A fonte da verdade para esta estrutura é o script `supabase/mod5_schema.sql`, executado no projeto Supabase (PostgreSQL) compartilhado por todos os módulos[cite: 4]. [cite_start]Todas as tabelas deste módulo utilizam o prefixo `mod5_`[cite: 4].

---

## 📌 Convenções Gerais e Relacionamentos

* [cite_start]**Chaves Primárias (PK):** Utilizam o tipo `uuid` com o valor default `gen_random_uuid()` (extensão pgcrypto)[cite: 6].
* [cite_start]**Nomenclatura:** Padrão `snake_case` para tabelas e colunas[cite: 7].
* [cite_start]**Datas e Horas:** Tempo em `timestamptz` com `created_at` / `updated_at` definidos com default `now()`[cite: 7].
* [cite_start]**Segurança:** O controle de acesso em nível de linha (RLS) está habilitado em todas as tabelas deste módulo[cite: 8].
* [cite_start]**Independência de Dados:** A tabela `mod5_licitacoes_base` é propositalmente independente e não possui chaves estrangeiras (FKs), atuando como base de precedentes para a IA[cite: 13].
* [cite_start]**Cross-Módulo:** As referências a módulos externos apontam para tabelas como `auth.users`, `mod4` e `mod8_`[cite: 14]. [cite_start]Por serem referências entre módulos, colunas como `id_edital_m4` e `id_contrato_m8` não possuem constraint de FK[cite: 15].

---

## 🏗️ Estrutura das Tabelas

### 1. `mod5_fase_licitacao`
[cite_start]Define o domínio de fases da licitação[cite: 17, 19].

| Coluna | Tipo | Restrições |
| :--- | :--- | :--- |
| `id` | `uuid` | [cite_start]PK, default `gen_random_uuid()` [cite: 18] |
| `nome` | `varchar(50)` | [cite_start]`not null`, `unique` (Valores: Pré-licitação, Julgamento, Contratual) [cite: 18] |
| `descricao` | [cite_start]`text` | [cite: 18] |

### 2. `mod5_tipo_peca_juridica`
[cite_start]Define o domínio de tipos de peça[cite: 20].

| Coluna | Tipo | Restrições |
| :--- | :--- | :--- |
| `id` | `uuid` | [cite_start]PK [cite: 21] |
| `id_fase` | `uuid` | [cite_start]`not null`, FK `mod5_fase_licitacao(id)` [cite: 21] |
| `nome` | `varchar(80)` | [cite_start]`not null` (ex.: Impugnação ao Edital, Recurso) [cite: 21] |
| `codigo` | `varchar(10)` | [cite_start]Código curto usado na UI e modelo DOCX [cite: 21] |
| `descricao` | [cite_start]`text` | [cite: 21] |

### 3. `mod5_tese_juridica`
[cite_start]Armazena as teses escolhidas pelo usuário, gravada quando a IA sugere uma tese e a peça é criada[cite: 22, 23, 24].

| Coluna | Tipo | Restrições |
| :--- | :--- | :--- |
| `id` | `uuid` | [cite_start]PK [cite: 25] |
| `titulo` | `text` | [cite_start]`not null` [cite: 25] |
| `objetivo` | [cite_start]`varchar(50)` | [cite: 25] |
| `relevancia` | `varchar(10)` | [cite_start]`check in` ('Baixa', 'Média', 'Alta') [cite: 25] |
| `fundamentacao` | `text` | [cite_start]Texto jurídico gerado pela IA [cite: 25] |
| `created_at` | `timestamptz` | [cite_start]`not null`, default `now()` [cite: 25] |

### 4. `mod5_licitacoes_base`
Base de precedentes (RAG). [cite_start]Tabela consultada por *Full-Text Search* para ancorar as sugestões da IA em decisões reais e atualizada periodicamente[cite: 26, 27, 28, 29].

| Coluna | Tipo | Restrições |
| :--- | :--- | :--- |
| `id` | `uuid` | [cite_start]PK [cite: 30] |
| `titulo` | `text` | [cite_start]`not null` [cite: 30] |
| `orgao` | [cite_start]`varchar(120)` | ex.: TCU, TJ-SP [cite: 30] |
| `tipo_decisao` | `varchar(60)` | ex.: Acórdão, Súmula [cite: 30] |
| `numero` | `varchar(60)` | [cite_start]Número da decisão [cite: 30] |
| `lei_referencia` | `varchar(60)` | ex.: Lei 14.133/2021 [cite: 30] |
| `data_decisao` | [cite_start]`date` | [cite: 30] |
| `conteudo` | `text` | [cite_start]`not null` - Corpo da decisão (alvo do FTS) [cite: 30] |
| `fonte` | `text` | [cite_start]Origem/URL [cite: 30] |
| `created_at` / `updated_at`| `timestamptz` | [cite_start]`not null`, default `now()` (updated_at via trigger) [cite: 30] |

### 5. `mod5_peca_juridica`
[cite_start]Tabela central do módulo que concentra as FKs de contexto; as referências variam conforme a fase[cite: 31, 32, 33].

| Coluna | Tipo | Restrições |
| :--- | :--- | :--- |
| `id` | `uuid` | [cite_start]PK [cite: 34] |
| `id_usuario` | `uuid` | `not null`, FK `auth.users(id)` `on delete cascade` [cite: 34] |
| `id_fase` | `uuid` | [cite_start]`not null`, FK `mod5_fase_licitacao(id)` [cite: 34] |
| `id_tipo` | `uuid` | `not null`, FK `mod5_tipo_peca_juridica(id)` [cite: 34] |
| `id_tese` | `uuid` | FK `mod5_tese_juridica(id)` [cite: 34] |
| `id_edital_m4` | `uuid` | [cite_start]Referência ao Módulo 04 (sem FK) [cite: 34] |
| `id_sessao` | `uuid` | FK `mod5_sessao_julgamento(id)` - Fase Julgamento [cite: 34] |
| `id_contrato_m8` | `uuid` | [cite_start]Referência ao Módulo 08 (sem FK) - Fase Contratual [cite: 34] |
| `id_notificacao` | `uuid` | FK `mod5_notificacao_contratual(id)` - Fase Contratual [cite: 34] |
| `palavra_chave_tema` | `text` | [cite_start]Tema digitado pelo usuário [cite: 34] |
| `anexos` | [cite_start]`jsonb` | default `'[]'` apontando para Supabase Storage (bucket mod5) [cite: 34] |
| `conteudo_final` | `text` | [cite_start]Texto plano extraído do DOCX gerado [cite: 34] |
| `status` | `varchar(30)` | [cite_start]`not null`, default `'rascunho'`, `check in` ('rascunho', 'gerada', 'baixada', 'aguardando_julgamento', 'julgada') [cite: 34] |
| `created_at` / `updated_at`| `timestamptz` | [cite_start]`not null`, default `now()` (updated_at via trigger) [cite: 34] |

### 6. `mod5_historico_peca_juridica`
[cite_start]Armazena o histórico e as versões das peças jurídicas[cite: 35, 36].

| Coluna | Tipo | Restrições |
| :--- | :--- | :--- |
| `id` | `uuid` | [cite_start]PK [cite: 37] |
| `id_peca` | `uuid` | [cite_start]`not null`, FK `mod5_peca_juridica(id)` `on delete cascade` [cite: 37] |
| `versao` | `integer` | [cite_start]`not null`, `unique` (`id_peca`, `versao`) [cite: 37] |
| `conteudo` | `text` | [cite_start]`not null` [cite: 37] |
| `alterado_por` | `uuid` | FK `auth.users(id)` [cite: 37] |
| `created_at` | `timestamptz` | [cite_start]`not null`, default `now()` [cite: 37] |

### 7. `mod5_sessao_julgamento` *(Fase 2 - Julgamento)*
[cite_start]Dados da sessão de pregão, originados de API governamental ou importados via ata manual[cite: 38, 39, 40].

| Coluna | Tipo | Restrições |
| :--- | :--- | :--- |
| `id` | `uuid` | [cite_start]PK [cite: 41] |
| `id_edital_m4` | `uuid` | [cite_start]`not null` edital do Módulo 04 (sem FK) [cite: 41] |
| `data_sessao` | [cite_start]`timestamptz` | [cite: 41] |
| `pregoeiro` | [cite_start]`varchar(150)` | [cite: 41] |
| `vencedor_cnpj` | [cite_start]`varchar(18)` | [cite: 41] |
| `vencedor_razao_social`| [cite_start]`varchar(200)` | [cite: 41] |
| `valor_vencedor` | [cite_start]`numeric(15,2)`| [cite: 41] |
| `decisao` | [cite_start]`text` | [cite: 41] |
| `participantes` | `jsonb` | [cite_start]Lista de `{ cnpj, razao_social, status, motivo }` [cite: 41] |
| `fonte_dados` | `varchar(20)` | [cite_start]`not null`, `check in` ('api_gov', 'upload_manual') [cite: 41] |
| `arquivo_ata_url` | `text` | [cite_start]Ata no Storage [cite: 41] |
| `created_at` | `timestamptz` | [cite_start]`not null`, default `now()` [cite: 41] |

### 8. `mod5_notificacao_contratual` *(Fase 3 - Contratual)*
[cite_start]Notificações de descumprimento que originam Defesa Prévia ou Pedido de Reconsideração[cite: 42, 43, 44].

| Coluna | Tipo | Restrições |
| :--- | :--- | :--- |
| `id` | `uuid` | [cite_start]PK [cite: 45] |
| `id_contrato_m8` | `uuid` | [cite_start]`not null` contrato do Módulo 08 (sem FK) [cite: 45] |
| `id_usuario` | `uuid` | [cite_start]`not null`, FK `auth.users(id)` `on delete cascade` [cite: 45] |
| `tipo` | [cite_start]`varchar(80)` | [cite: 45] |
| `data_recebimento` | [cite_start]`date` | [cite: 45] |
| `prazo_defesa` | `date` | [cite: 45] |
| `descricao` | [cite_start]`text` | [cite: 45] |
| `arquivo_url` | `text` | [cite: 45] |
| `status` | `varchar(30)` | [cite_start]`not null`, default `'recebida'`, `check in` ('recebida', 'em_defesa', 'defesa_enviada', 'julgada') [cite: 45] |
| `created_at` | `timestamptz` | `not null`, default `now()` [cite: 45] |
