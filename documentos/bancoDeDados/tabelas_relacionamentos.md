# 🗄️ Banco de Dados — Módulo 05

> **Versão:** Schema do Módulo 05  
> **Fonte da Verdade:** `supabase/mod5_schema.sql`  
> **Banco:** PostgreSQL (Supabase)

Este documento descreve a estrutura do banco de dados do **Módulo 05**, utilizada pelo projeto Supabase compartilhado entre todos os módulos do sistema.

---

# 📋 Convenções Gerais

| Item | Descrição |
|------|-----------|
| **Prefixo das tabelas** | `mod5_` |
| **Chaves Primárias** | `uuid` com `gen_random_uuid()` |
| **Padrão de nomenclatura** | `snake_case` |
| **Datas** | `timestamptz` com `created_at` e `updated_at` |
| **Segurança** | RLS (Row Level Security) habilitado em todas as as tabelas |
| **Banco** | PostgreSQL (Supabase) |

---

# 🔗 Relacionamentos Importantes

## Independência da Base de Conhecimento

A tabela:

- `mod5_licitacoes_base`

foi projetada para **não possuir nenhuma chave estrangeira**, funcionando como uma base independente de precedentes utilizada pelo mecanismo de IA (RAG).

---

## Integração com outros módulos

O módulo realiza integração com componentes externos.

| Coluna | Origem |
|---------|---------|
| `id_usuario` | `auth.users` |
| `id_edital_m4` | Módulo 04 |
| `id_contrato_m8` | Módulo 08 |

> **Observação**
>
> As referências para os módulos **04** e **08** **não possuem Foreign Key**, justamente para manter baixo acoplamento entre módulos.

---

# 🏗️ Estrutura das Tabelas

---

# 1. `mod5_fase_licitacao`

Define as fases existentes do processo licitatório.

## Estrutura

| Coluna | Tipo | Restrições |
|---------|------|------------|
| `id` | `uuid` | PK • `gen_random_uuid()` |
| `nome` | `varchar(50)` | NOT NULL • UNIQUE |
| `descricao` | `text` | Opcional |

### Valores esperados

- Pré-licitação
- Julgamento
- Contratual

---

# 2. `mod5_tipo_peca_juridica`

Tabela responsável pelo catálogo de peças jurídicas disponíveis.

## Estrutura

| Coluna | Tipo | Restrições |
|---------|------|------------|
| `id` | `uuid` | PK |
| `id_fase` | `uuid` | FK → `mod5_fase_licitacao(id)` |
| `nome` | `varchar(80)` | NOT NULL |
| `codigo` | `varchar(10)` | Código utilizado na UI e geração DOCX |
| `descricao` | `text` | Opcional |

### Exemplos

- Impugnação ao Edital
- Recurso
- Defesa Prévia
- Pedido de Reconsideração

---

# 3. `mod5_tese_juridica`

Armazena as teses jurídicas sugeridas pela IA e efetivamente utilizadas pelo usuário.

## Estrutura

| Coluna | Tipo | Restrições |
|---------|------|------------|
| `id` | `uuid` | PK |
| `titulo` | `text` | NOT NULL |
| `objetivo` | `varchar(50)` | |
| `relevancia` | `varchar(10)` | CHECK (`Baixa`, `Média`, `Alta`) |
| `fundamentacao` | `text` | Texto jurídico gerado pela IA |
| `created_at` | `timestamptz` | Default `now()` |

---

# 4. `mod5_licitacoes_base`

Base de precedentes jurídicos utilizada pelo mecanismo **RAG (Retrieval Augmented Generation)**.

A tabela é consultada através de **Full Text Search (FTS)** para fundamentar as respostas da IA utilizando decisões reais.

## Estrutura

| Coluna | Tipo |
|---------|------|
| `id` | `uuid` |
| `titulo` | `text` |
| `orgao` | `varchar(120)` |
| `tipo_decisao` | `varchar(60)` |
| `numero` | `varchar(60)` |
| `lei_referencia` | `varchar(60)` |
| `data_decisao` | `date` |
| `conteudo` | `text` |
| `fonte` | `text` |
| `created_at` | `timestamptz` |
| `updated_at` | `timestamptz` |

### Exemplos de órgãos

- TCU
- TJ-SP
- TCE-RS
- CGU

---

# 5. `mod5_peca_juridica`

> **Tabela central do módulo.**

Concentra todas as peças jurídicas produzidas pelo sistema e conecta os diferentes contextos (Pré-Licitação, Julgamento e Contratual).

## Estrutura

| Coluna | Tipo | Observação |
|---------|------|------------|
| `id` | `uuid` | PK |
| `id_usuario` | `uuid` | FK → `auth.users` |
| `id_fase` | `uuid` | FK → `mod5_fase_licitacao(id)` |
| `id_tipo` | `uuid` | FK → `mod5_tipo_peca_juridica(id)` |
| `id_tese` | `uuid` | FK → `mod5_tese_juridica(id)` |
| `id_edital_m4` | `uuid` | Referência ao Módulo 04 (sem FK) |
| `id_sessao` | `uuid` | FK → `mod5_sessao_julgamento(id)` |
| `id_contrato_m8` | `uuid` | Referência ao Módulo 08 (sem FK) |
| `id_notificacao` | `uuid` | FK → `mod5_notificacao_contratual(id)` |
| `palavra_chave_tema` | `text` | Tema informado pelo usuário |
| `anexos` | `jsonb` | Lista de arquivos armazenados no Supabase Storage |
| `conteudo_final` | `text` | Texto extraído do DOCX gerado |
| `status` | `varchar(30)` | Situação da peça |
| `created_at` | `timestamptz` | Default `now()` |
| `updated_at` | `timestamptz` | Atualizado por trigger |

### Valores permitidos para `status`

- `rascunho`
- `gerada`
- `baixada`
- `aguardando_julgamento`
- `julgada`

---

# 6. `mod5_historico_peca_juridica`

Responsável pelo versionamento das peças jurídicas.

## Estrutura

| Coluna | Tipo | Restrições |
|---------|------|------------|
| `id` | `uuid` | PK |
| `id_peca` | `uuid` | FK → `mod5_peca_juridica(id)` |
| `versao` | `integer` | NOT NULL |
| `conteudo` | `text` | NOT NULL |
| `alterado_por` | `uuid` | FK → `auth.users(id)` |
| `created_at` | `timestamptz` | Default `now()` |

> Existe uma restrição **UNIQUE (`id_peca`, `versao`)**, impedindo versões duplicadas da mesma peça.

---

# 7. `mod5_sessao_julgamento`

> **Fase 2 — Julgamento**

Armazena informações da sessão pública do pregão.

Os dados podem ser provenientes de:

- API Governamental
- Upload manual da ata

## Estrutura

| Coluna | Tipo |
|---------|------|
| `id` | `uuid` |
| `id_edital_m4` | `uuid` |
| `data_sessao` | `timestamptz` |
| `pregoeiro` | `varchar(150)` |
| `vencedor_cnpj` | `varchar(18)` |
| `vencedor_razao_social` | `varchar(200)` |
| `valor_vencedor` | `numeric(15,2)` |
| `decisao` | `text` |
| `participantes` | `jsonb` |
| `fonte_dados` | `varchar(20)` |
| `arquivo_ata_url` | `text` |
| `created_at` | `timestamptz` |

### Estrutura do campo `participantes`

```json
[
  {
    "cnpj": "",
    "razao_social": "",
    "status": "",
    "motivo": ""
  }
]
```

### Valores permitidos para `fonte_dados`

- `api_gov`
- `upload_manual`

---

# 8. `mod5_notificacao_contratual`

> **Fase 3 — Contratual**

Representa notificações de descumprimento contratual que podem originar novas peças jurídicas.

### Exemplos

- Defesa Prévia
- Pedido de Reconsideração

## Estrutura

| Coluna | Tipo |
|---------|------|
| `id` | `uuid` |
| `id_contrato_m8` | `uuid` |
| `id_usuario` | `uuid` |
| `tipo` | `varchar(80)` |
| `data_recebimento` | `date` |
| `prazo_defesa` | `date` |
| `descricao` | `text` |
| `arquivo_url` | `text` |
| `status` | `varchar(30)` |
| `created_at` | `timestamptz` |

### Valores permitidos para `status`

- `recebida`
- `em_defesa`
- `defesa_enviada`
- `julgada`

---

# 📚 Resumo das Responsabilidades

| Tabela | Responsabilidade |
|---------|------------------|
| `mod5_fase_licitacao` | Domínio das fases da licitação |
| `mod5_tipo_peca_juridica` | Catálogo de tipos de peças jurídicas |
| `mod5_tese_juridica` | Teses jurídicas sugeridas pela IA |
| `mod5_licitacoes_base` | Base de precedentes utilizada pelo RAG |
| `mod5_peca_juridica` | Entidade principal do módulo |
| `mod5_historico_peca_juridica` | Histórico e versionamento das peças |
| `mod5_sessao_julgamento` | Informações da fase de julgamento |
| `mod5_notificacao_contratual` | Notificações da fase contratual |
