# CLAUDE.md — Módulo 05: Assistente Jurídico

> Arquivo de contexto para o Claude Code. Mantenha na **raiz do projeto**.
> Última atualização: 2026.

---

## 1. Visão geral do projeto

Sistema dividido em **8 módulos** que automatizam o ciclo de licitações públicas. Este repositório implementa o **Módulo 05 — Assistente Jurídico**.

**Objetivo do módulo:** automatizar a criação de peças jurídicas para processos licitatórios. O fornecedor seleciona um edital/processo/contrato, escolhe o tipo de peça, descreve o tema, e uma **IA gera sugestões de teses** com base em uma base de decisões/precedentes. Ao final, o sistema monta o documento formatado e permite baixá-lo em PDF/DOCX.

O módulo atua em **3 fases** do ciclo licitatório:

1. **Pré-licitação** — Pedido de Esclarecimentos e Impugnação ao Edital.
2. **Julgamento** — Recurso Administrativo e Contrarrazão.
3. **Fase Contratual** — Pedido de Pagamento, Reajuste, Reequilíbrio Econômico-Financeiro, Defesa Prévia e Pedido de Reconsideração.

**Fluxo principal (resumido):**
```
Tela que seleciona edital/processo/contrato → Escolhe tipo de peça
→ Digita palavra-chave/tema → IA consulta base e sugere teses
→ Usuário escolhe a tese → Sistema monta o documento → Baixa PDF/DOCX
→ Registra a peça no histórico
```

---

## 2. Stack tecnológica

Decisões já fechadas pela equipe (não trocar sem combinar):

| Camada | Tecnologia |
|---|---|
| Framework / Frontend | **Next.js** (App Router) + **React** + **TypeScript** |
| Backend | **Next.js API Routes** (Node.js) |
| Banco de dados / Auth / Storage | **Supabase** (PostgreSQL) |
| IA (geração de teses/peças) | **API do Google Gemini** (tier gratuito) |
| Estilização | **Tailwind CSS** |
| Versionamento | **Git + GitHub** |

**Padrão arquitetural:** Cliente-Servidor com Backend-as-a-Service (BaaS). O Next.js serve a interface e as APIs intermediárias; o Supabase é o servidor de dados, e arquivos.

---

## 3. Pré-requisitos (o que instalar)

Antes de tudo, garanta que estes itens estão na máquina:

1. **Node.js** — versão LTS (20.x ou superior; mínimo exigido pelo Next.js 15 é 18.18+).
   - Verificar: `node --version` e `npm --version`
   - Download: https://nodejs.org
2. **Git** — controle de versão.
   - Verificar: `git --version`
   - Download: https://git-scm.com
3. **Conta no Supabase** (gratuita) — criar um projeto e pegar URL + chaves.
   - https://supabase.com
4. **Chave de API do Google Gemini** (gratuita) — para o motor de IA.
   - https://aistudio.google.com/apikey (gere a chave; não exige cartão de crédito)

> O grupo compartilha **um único projeto Supabase** entre todos os módulos.

---

## 4. Setup inicial (passo a passo)

### 4.1. Criar o projeto Next.js

```bash
npx create-next-app@latest assistente-juridico-m5
```

Responda às opções assim:
- **TypeScript:** Yes
- **ESLint:** Yes
- **Tailwind CSS:** Yes
- **`src/` directory:** Yes
- **App Router:** Yes
- **import alias (`@/*`):** Yes (padrão)

```bash
cd assistente-juridico-m5
```

### 4.2. Instalar as dependências do módulo

```bash
# Supabase (cliente + integração com Next.js/SSR)
npm install @supabase/supabase-js @supabase/ssr

# Motor de IA (SDK oficial do Google Gemini)
# Confirme o nome atual do pacote no quickstart antes de instalar (a Google unificou o SDK recentemente):
# https://ai.google.dev/gemini-api/docs/quickstart
npm install @google/genai

# Geração de documentos
npm install docx                 # gera arquivos .docx
npm install @react-pdf/renderer  # gera arquivos .pdf

# Formulários e validação (recomendado para os fluxos guiados)
npm install react-hook-form zod @hookform/resolvers
```

### 4.3. (Opcional) Componentes de UI

As telas de referência são limpas; o **shadcn/ui** acelera bastante:

```bash
npx shadcn@latest init
```

### 4.4. Variáveis de ambiente

Crie um arquivo **`.env.local`** na raiz (NÃO commitar — já está no `.gitignore`):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui   # use SOMENTE no servidor

# Google Gemini (IA)
GEMINI_API_KEY=sua_chave_gemini_aqui
GEMINI_MODEL=gemini-2.5-flash                        # confira o identificador atual no quickstart
```

> Modelo: um modelo **Gemini Flash** é rápido e cabe no tier gratuito, suficiente para gerar texto jurídico em português.

---

## 5. Estrutura de pastas sugerida

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                      # painel inicial
│   ├── editais/                      # listagem e seleção de editais (M4)
│   ├── pecas/
│   │   ├── nova/                     # fluxo guiado "Criar nova peça"
│   │   └── [id]/                     # visualização/edição da peça
│   └── api/
│       ├── pecas/
│       │   └── gerar/route.ts        # endpoint do motor de IA (gera teses/peça)
│       └── documentos/
│           └── [id]/route.ts         # geração e download de PDF/DOCX
├── components/                       # componentes de UI reutilizáveis
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # client para o browser
│   │   └── server.ts                 # client para Server Components / API Routes
│   └── gemini.ts                   # configuração do SDK do Google Gemini
├── types/                            # tipos TypeScript (tabelas, DTOs)
└── utils/                            # helpers (ex.: formatação de datas, manipulação de texto)
```

> O script do banco fica em **`supabase/mod5_schema.sql`** (na raiz do repo, fora de `src/`).

---

## 6. Banco de dados (Supabase / PostgreSQL)

As **8 tabelas já foram criadas no Supabase**. O script de criação é o **`mod5_schema.sql`** (fonte da verdade do schema; manter na pasta `supabase/` do repo). Todas as tabelas usam o prefixo **`mod5_`**, porque o banco é compartilhado entre os módulos. A especificação detalhada das colunas está no documento *"Especificação do Banco de Dados — Módulo 05"*. Resumo das tabelas:

### 6.1. `mod5_fase_licitacao` (comum — domínio)
Fases do ciclo: Pré-licitação, Julgamento e Contratual. Usada para classificar a peça.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | uuid | PK, default `gen_random_uuid()` | Identificador da fase. |
| `nome` | varchar(50) | NOT NULL, UNIQUE | Pré-licitação, Julgamento ou Contratual. |
| `descricao` | text | — | Descrição opcional da fase. |

### 6.2. `mod5_tipo_peca_juridica` (comum — domínio)
Tipos de peça, vinculados à fase em que se aplicam.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | uuid | PK, default `gen_random_uuid()` | Identificador do tipo. |
| `id_fase` | uuid | FK → `mod5_fase_licitacao(id)`, NOT NULL | Fase em que o tipo é aplicável. |
| `nome` | varchar(80) | NOT NULL | Nome do tipo de peça. |
| `codigo` | varchar(10) | — | Código curto opcional (ex.: B, G, H). |
| `descricao` | text | — | Texto explicativo exibido ao usuário. |

### 6.3. `mod5_tese_juridica` (comum)
Teses geradas pela IA e gravadas ao salvar a peça.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | uuid | PK, default `gen_random_uuid()` | Identificador da tese. |
| `titulo` | text | NOT NULL | Título da tese, conforme gerado pela IA. |
| `objetivo` | varchar(50) | — | Ex.: Requer Habilitação / Requer Inabilitação. |
| `relevancia` | varchar(10) | CHECK in ('Baixa','Média','Alta') | Nível de relevância sugerido. |
| `fundamentacao` | text | — | Corpo/argumentação da tese. |
| `created_at` | timestamptz | NOT NULL, default `now()` | Data de criação do registro. |

### 6.4. `mod5_licitacoes_base` (comum)
Base de decisões/precedentes consultada pela IA. **Tabela independente** (sem FKs). Alvo de Full-Text Search (índice GIN em português sobre `titulo` + `conteudo`); atualizar periodicamente.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | uuid | PK, default `gen_random_uuid()` | Identificador do registro. |
| `titulo` | text | NOT NULL | Título ou ementa da decisão/precedente. |
| `orgao` | varchar(120) | — | Órgão de origem (ex.: TCU, TCE-RS). |
| `tipo_decisao` | varchar(60) | — | Acórdão, Decisão Administrativa, Parecer, Súmula. |
| `numero` | varchar(60) | — | Número do processo/decisão. |
| `lei_referencia` | varchar(60) | — | Lei aplicável (ex.: Lei 14.133/2021). |
| `data_decisao` | date | — | Data da decisão. |
| `conteudo` | text | NOT NULL | Texto integral consultado pela IA / alvo de busca textual. |
| `fonte` | text | — | URL ou origem do documento. |
| `created_at` | timestamptz | NOT NULL, default `now()` | Data de inclusão. |
| `updated_at` | timestamptz | NOT NULL, default `now()` | Última atualização (via trigger). |

### 6.5. `mod5_sessao_julgamento` (Fase 2 — Julgamento)
Fatos da sessão de pregão (API do governo ou ata importada). Uma sessão pode originar várias peças.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | uuid | PK, default `gen_random_uuid()` | Identificador da sessão. |
| `id_edital_m4` | uuid | NOT NULL (sem FK rígido) | Processo/edital da sessão (Módulo 04). |
| `data_sessao` | timestamptz | — | Data e hora da sessão. |
| `pregoeiro` | varchar(150) | — | Identificação do pregoeiro. |
| `vencedor_cnpj` | varchar(18) | — | CNPJ do fornecedor vencedor. |
| `vencedor_razao_social` | varchar(200) | — | Razão social do vencedor. |
| `valor_vencedor` | numeric(15,2) | — | Valor da proposta vencedora. |
| `decisao` | text | — | Texto da decisão do pregoeiro. |
| `participantes` | jsonb | — | Lista: `{cnpj, razao_social, status, motivo}`. |
| `fonte_dados` | varchar(20) | NOT NULL, CHECK in ('api_gov','upload_manual') | Origem dos dados consolidados. |
| `arquivo_ata_url` | text | — | Referência à ata importada (Storage). |
| `created_at` | timestamptz | NOT NULL, default `now()` | Data de criação do registro. |

### 6.6. `mod5_notificacao_contratual` (Fase 3 — Contratual)
Notificações de descumprimento que originam Defesa Prévia / Pedido de Reconsideração.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | uuid | PK, default `gen_random_uuid()` | Identificador da notificação. |
| `id_contrato_m8` | uuid | NOT NULL (sem FK rígido) | Contrato relacionado (Módulo 08). |
| `id_usuario` | uuid | FK → `auth.users(id)` ON DELETE CASCADE, NOT NULL | Fornecedor notificado. |
| `tipo` | varchar(80) | — | Motivo (atraso, descumprimento de cláusula, etc.). |
| `data_recebimento` | date | — | Data de recebimento da notificação. |
| `prazo_defesa` | date | — | Prazo final para apresentar defesa. |
| `descricao` | text | — | Resumo do que o órgão alegou. |
| `arquivo_url` | text | — | Referência ao PDF da notificação (Storage). |
| `status` | varchar(30) | NOT NULL, default 'recebida', CHECK in ('recebida','em_defesa','defesa_enviada','julgada') | Situação da notificação. |
| `created_at` | timestamptz | NOT NULL, default `now()` | Data de criação do registro. |

### 6.7. `mod5_peca_juridica` (comum — tabela central)
Representa cada peça gerada e concentra os relacionamentos. As FKs de contexto (`id_edital_m4`, `id_sessao`, `id_contrato_m8`, `id_notificacao`) são opcionais e preenchidas conforme a fase.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | uuid | PK, default `gen_random_uuid()` | Identificador da peça. |
| `id_usuario` | uuid | FK → `auth.users(id)` ON DELETE CASCADE, NOT NULL | Licitante/fornecedor dono da peça. |
| `id_fase` | uuid | FK → `mod5_fase_licitacao(id)`, NOT NULL | Fase da peça. |
| `id_tipo` | uuid | FK → `mod5_tipo_peca_juridica(id)`, NOT NULL | Tipo de peça. |
| `id_tese` | uuid | FK → `mod5_tese_juridica(id)` | Tese escolhida (nula até a seleção). |
| `id_edital_m4` | uuid | — (sem FK rígido) | Edital relacionado (Fases 1 e 2 — Módulo 04). |
| `id_sessao` | uuid | FK → `mod5_sessao_julgamento(id)` | Sessão de julgamento (Fase 2). |
| `id_contrato_m8` | uuid | — (sem FK rígido) | Contrato relacionado (Fase 3 — Módulo 08). |
| `id_notificacao` | uuid | FK → `mod5_notificacao_contratual(id)` | Notificação que originou a defesa (Fase 3). |
| `palavra_chave_tema` | text | — | Tema/palavra-chave digitada livremente pelo usuário. |
| `anexos` | jsonb | default `'[]'` | Lista de anexos: `{nome, tipo, url, uploaded_at}`. |
| `conteudo_final` | text | — | Conteúdo do documento gerado. |
| `status` | varchar(30) | NOT NULL, default 'rascunho', CHECK in ('rascunho','gerada','baixada','aguardando_julgamento','julgada') | Estado da peça. |
| `created_at` | timestamptz | NOT NULL, default `now()` | Data de criação. |
| `updated_at` | timestamptz | NOT NULL, default `now()` | Última atualização (via trigger). |

### 6.8. `mod5_historico_peca_juridica` (comum)
Versões anteriores de cada peça (RF15). Cada versão é única pela combinação `(id_peca, versao)`.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | uuid | PK, default `gen_random_uuid()` | Identificador do registro de versão. |
| `id_peca` | uuid | FK → `mod5_peca_juridica(id)` ON DELETE CASCADE, NOT NULL | Peça à qual a versão pertence. |
| `versao` | integer | NOT NULL, UNIQUE `(id_peca, versao)` | Número incremental da versão. |
| `conteudo` | text | NOT NULL | Conteúdo da peça naquela versão. |
| `alterado_por` | uuid | FK → `auth.users(id)` | Usuário que realizou a alteração. |
| `created_at` | timestamptz | NOT NULL, default `now()` | Momento em que a versão foi salva. |

### Convenções do banco
- PK: `id uuid` com default `gen_random_uuid()`.
- Nomes em `snake_case`.
- Tempo: `timestamptz`; `created_at`/`updated_at` com default `now()`.
- Domínios restritos (ex.: `status`) via `CHECK` ou `ENUM`.

### Referências a OUTROS módulos (não recriar essas tabelas!)
Estas FKs apontam para tabelas mantidas por outros módulos no **mesmo** banco:
- `id_usuario` → usuário do **Supabase Auth / Módulo 01**.
- `id_edital_m4` → editais do **Módulo 04**.
- `id_contrato_m8` → contratos do **Módulo 08**.

> Como o banco é único, o M5 apenas guarda o ID e consulta os dados dos outros módulos quando necessário — **sem duplicar** (sem cache local).

### Índices criados
- `idx_mod5_tipo_fase` em `mod5_tipo_peca_juridica(id_fase)`
- `idx_mod5_peca_usuario` em `mod5_peca_juridica(id_usuario)`
- `idx_mod5_peca_fase` em `mod5_peca_juridica(id_fase)`
- `idx_mod5_peca_edital` em `mod5_peca_juridica(id_edital_m4)`
- `idx_mod5_peca_contrato` em `mod5_peca_juridica(id_contrato_m8)`
- `idx_mod5_hist_peca` em `mod5_historico_peca_juridica(id_peca)`
- `idx_mod5_notif_usuario` em `mod5_notificacao_contratual(id_usuario)`
- `idx_mod5_sessao_edital` em `mod5_sessao_julgamento(id_edital_m4)`
- `idx_mod5_licitacoes_fts` — índice GIN de Full-Text Search (português) sobre `titulo` + `conteudo` de `mod5_licitacoes_base`.

### Trigger
- Função `mod5_set_updated_at()` atualiza `updated_at = now()` em cada UPDATE.
- Aplicada em: `mod5_peca_juridica` (trigger `trg_mod5_peca_updated_at`) e `mod5_licitacoes_base` (trigger `trg_mod5_licitacoes_updated_at`).

### Segurança (LGPD) — RLS e Policies
**RLS habilitada** em todas as 8 tabelas. Isolamento a nível de banco: cada fornecedor só acessa os próprios dados. Chamadas no servidor com a `SERVICE_ROLE_KEY` ignoram a RLS (usado para popular a base, seeds e geração via IA).

Policies por tabela:

- **`mod5_peca_juridica`** — acesso restrito ao dono (`auth.uid() = id_usuario`), com policy separada por operação:
  - `mod5_peca_select_own` (SELECT)
  - `mod5_peca_insert_own` (INSERT, `WITH CHECK`)
  - `mod5_peca_update_own` (UPDATE, `USING` + `WITH CHECK`)
  - `mod5_peca_delete_own` (DELETE)
- **`mod5_historico_peca_juridica`** — `mod5_hist_all_own` (FOR ALL): acessível se a peça pai pertencer ao usuário (subconsulta em `mod5_peca_juridica`).
- **`mod5_notificacao_contratual`** — `mod5_notif_all_own` (FOR ALL): restrito ao dono (`auth.uid() = id_usuario`).
- **Tabelas de referência/conhecimento** — leitura (SELECT) para qualquer usuário autenticado (`auth.role() = 'authenticated'`):
  - `mod5_fase_read` em `mod5_fase_licitacao`
  - `mod5_tipo_read` em `mod5_tipo_peca_juridica`
  - `mod5_tese_read` em `mod5_tese_juridica`
  - `mod5_licitacoes_read` em `mod5_licitacoes_base`
  - `mod5_sessao_read` em `mod5_sessao_julgamento`

> Escritas em `mod5_licitacoes_base`, `mod5_tese_juridica` e `mod5_sessao_julgamento` não têm policy de INSERT/UPDATE para usuários comuns: devem ser feitas no servidor com a `SERVICE_ROLE_KEY`.

---

## 7. Funcionalidades-chave a implementar (prioridade MVP)

Da lista priorizada (MoSCoW) do grupo — *Must Have*:
- Seleção de edital/processo licitatório.
- Identificação da fase (pré / julgamento / contratual).
- Geração de peças com sugestão de teses por IA.
- Categorias de peça por fase.
- Sugestão de teses padronizadas conforme o tema.
- Base de decisões/precedentes (`mod5_licitacoes_base`).
- Anexar documentos do processo (campo `anexos` jsonb + Supabase Storage).
- Geração do arquivo final formatado (PDF/DOCX).

---

## 8. Como funciona o motor de IA

1. O usuário digita um **tema em texto livre** (não há catálogo fixo de temas).
2. A API Route (`/api/pecas/gerar`) monta um prompt com: o tema, dados do contexto (edital/sessão/contrato) e trechos relevantes da **`mod5_licitacoes_base`**.
3. A IA retorna **opções de teses sugeridas** (título, objetivo, relevância, fundamentação).
4. O usuário escolhe uma tese.
5. A tese escolhida é gravada em `mod5_tese_juridica` (opcionalmente, comparando pelo título para evitar duplicatas).
6. A IA monta o **conteúdo final** da peça, salvo em `mod5_peca_juridica.conteudo_final`.

---

## 9. Convenções de código

- **Linguagem:** TypeScript em todo o projeto.
- **Componentes:** Server Components por padrão; use `"use client"` só quando precisar de interatividade.
- **Supabase:** use `lib/supabase/server.ts` em Server Components/API Routes e `lib/supabase/client.ts` no browser. **Nunca** exponha a `SERVICE_ROLE_KEY` no client.
- **textos de UI:** em português.

---

## 10. Comandos úteis

```bash
npm run dev      # ambiente de desenvolvimento (http://localhost:3000)
npm run build    # build de produção
npm run start    # roda o build localmente
npm run lint     # checagem de lint
```

---

## 11. Links

- Next.js: https://nextjs.org/docs
- Supabase (Next.js): https://supabase.com/docs/guides/auth/server-side/nextjs
- SDK Google Gemini (quickstart): https://ai.google.dev/gemini-api/docs/quickstart
- Modelos Gemini disponíveis: https://ai.google.dev/gemini-api/docs/models
- docx (npm): https://www.npmjs.com/package/docx
- @react-pdf/renderer: https://react-pdf.org

## 12. Não coloque nenhum comentário dentro do código, nas linhas do código!!!!!
