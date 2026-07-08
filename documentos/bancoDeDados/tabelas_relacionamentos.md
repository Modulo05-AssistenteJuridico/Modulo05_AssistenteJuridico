# 🗄️ Banco de Dados - Módulo 05[cite: 1]

Resumo da estrutura de banco de dados (PostgreSQL/Supabase) baseada no script de origem `mod5_schema.sql`. Todas as tabelas utilizam o prefixo `mod5_`.

## 📌 Padrões e Relacionamentos

* **Padrão de Chaves (PK):** Utilização de `uuid` com geração automática `gen_random_uuid()`.
* **Segurança:** Políticas de RLS habilitadas em todas as tabelas.
* **Tabela Central:** A tabela `mod5_peca_juridica` concentra as chaves estrangeiras de contexto.
* **Tabelas Independentes:** A tabela `mod5_licitacoes_base` não possui FKs, atuando como base isolada de precedentes (RAG).
* **Cross-Módulo:** Colunas que referenciam outros módulos (ex: `id_edital_m4`) não possuem constraint de FK.

---

## 🏗️ Estrutura das Tabelas

### 1. `mod5_fase_licitacao`
Define as fases principais da licitação.

| Coluna | Tipo | Restrições |
|---|---|---|
| `id` | uuid | PK, default gen_random_uuid() |
| `nome` | varchar(50) | not null, unique (Pré-licitação, Julgamento, Contratual) |
| `descricao` | text | |

### 2. `mod5_tipo_peca_juridica`
Define os tipos de peças disponíveis e sua fase.

| Coluna | Tipo | Restrições |
|---|---|---|
| `id` | uuid | PK |
| `id_fase` | uuid | not null, FK mod5_fase_licitacao(id) |
| `nome` | varchar(80) | not null |
| `codigo` | varchar(10) | Usado na UI e modelo DOCX |
| `descricao` | text | |

### 3. `mod5_tese_juridica`
Teses sugeridas pela IA e escolhidas pelo usuário.

| Coluna | Tipo | Restrições |
|---|---|---|
| `id` | uuid | PK |
| `titulo` | text | not null |
| `objetivo` | varchar(50) | |
| `relevancia` | varchar(10) | check in ('Baixa', 'Média', 'Alta') |
| `fundamentacao` | text | Texto gerado pela IA |
| `created_at` | timestamptz | not null, default now() |

### 4. `mod5_licitacoes_base`
Base de precedentes para Full-Text Search.

| Coluna | Tipo | Restrições |
|---|---|---|
| `id` | uuid | PK |
| `titulo` | text | not null |
| `orgao` | varchar(120) | ex: TCU, TJ-SP |
| `tipo_decisao` | varchar(60) | ex: Acórdão, Súmula |
| `numero` | varchar(60) | |
| `lei_referencia` | varchar(60) | |
| `data_decisao` | date | |
| `conteudo` | text | not null (alvo do FTS) |
| `fonte` | text | URL/Origem |
| `created_at` / `updated_at`| timestamptz | not null, default now() |

### 5. `mod5_peca_juridica`
Tabela principal que armazena as peças geradas.

| Coluna | Tipo | Restrições |
|---|---|---|
| `id` | uuid | PK |
| `id_usuario` | uuid | not null, FK auth.users(id) |
| `id_fase` | uuid | not null, FK mod5_fase_licitacao(id) |
| `id_tipo` | uuid | not null, FK mod5_tipo_peca_juridica(id) |
| `id_tese` | uuid | FK mod5_tese_juridica(id) |
| `id_edital_m4` | uuid | Ref. Módulo 04 (sem FK) |
| `id_sessao` | uuid | FK mod5_sessao_julgamento(id) |
| `id_contrato_m8` | uuid | Ref. Módulo 08 (sem FK) |
| `id_notificacao` | uuid | FK mod5_notificacao_contratual(id) |
| `palavra_chave_tema` | text | |
| `anexos` | jsonb | default '[]' (Supabase Storage) |
| `conteudo_final` | text | Texto extraído do DOCX |
| `status` | varchar(30) | not null, default 'rascunho' |
| `created_at` / `updated_at`| timestamptz | not null, default now() |

### 6. `mod5_historico_peca_juridica`
Controle de versões e histórico das peças.

| Coluna | Tipo | Restrições |
|---|---|---|
| `id` | uuid | PK |
| `id_peca` | uuid | not null, FK mod5_peca_juridica(id) |
| `versao` | integer | not null, unique (id_peca, versao) |
| `conteudo` | text | not null |
| `alterado_por` | uuid | FK auth.users(id) |
| `created_at` | timestamptz | not null, default now() |

### 7. `mod5_sessao_julgamento`
Dados da sessão de pregão (Fase 2).

| Coluna | Tipo | Restrições |
|---|---|---|
| `id` | uuid | PK |
| `id_edital_m4` | uuid | not null (sem FK) |
| `data_sessao` | timestamptz | |
| `pregoeiro` | varchar(150) | |
| `vencedor_cnpj` | varchar(18) | |
| `vencedor_razao_social`| varchar(200) | |
| `valor_vencedor` | numeric(15,2) | |
| `decisao` | text | |
| `participantes` | jsonb | Lista de CNPJs e status |
| `fonte_dados` | varchar(20) | not null, check in ('api_gov', 'upload_manual') |
| `arquivo_ata_url` | text | Ata no Storage |
| `created_at` | timestamptz | not null, default now() |

### 8. `mod5_notificacao_contratual`
Notificações de descumprimento de contratos (Fase 3).

| Coluna | Tipo | Restrições |
|---|---|---|
| `id` | uuid | PK |
| `id_contrato_m8` | uuid | not null (sem FK) |
| `id_usuario` | uuid | not null, FK auth.users(id) |
| `tipo` | varchar(80) | |
| `data_recebimento` | date | |
| `prazo_defesa` | date | |
| `descricao` | text | |
| `arquivo_url` | text | |
| `status` | varchar(30) | not null, default 'recebida' |
| `created_at` | timestamptz | not null, default now() |
