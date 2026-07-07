# Estrutura do Banco de Dados - Módulo 05

[cite_start]Este documento apresenta o resumo da estrutura e dos relacionamentos do banco de dados do Módulo 05[cite: 3]. [cite_start]A fonte da verdade para esta estrutura é o script executado no projeto Supabase (PostgreSQL), sendo que todas as tabelas utilizam o prefixo `mod5_`[cite: 4].

## Convenções Gerais e Relacionamentos

* [cite_start]O padrão para chaves primárias (PK) é o tipo `uuid` com o valor default `gen_random_uuid()`[cite: 6].
* [cite_start]A nomenclatura de tabelas e colunas segue o padrão `snake_case`[cite: 7].
* [cite_start]O controle de acesso em nível de linha (RLS) está habilitado em todas as tabelas deste módulo[cite: 8].
* [cite_start]A tabela `mod5_licitacoes_base` é propositalmente independente e não possui chaves estrangeiras (FKs)[cite: 13].
* [cite_start]As referências a módulos externos (como `auth.users`, `mod4` e `mod8_`) apontam para tabelas no mesmo banco de dados[cite: 14].
* [cite_start]Por serem referências cross-módulo, as colunas `id_edital_m4` e `id_contrato_m8` não possuem restrição de chave estrangeira (constraint de FK)[cite: 15].
* [cite_start]A tabela `mod5_peca_juridica` atua como a tabela central do módulo, concentrando as chaves estrangeiras de contexto[cite: 32, 33].

---

## Estrutura das Tabelas

### 1. `mod5_fase_licitacao`
[cite_start]Tabela que define o domínio de fases da licitação[cite: 19]. [cite_start]Estrutura das colunas[cite: 18]:

| Coluna | Tipo | Restrições |
| :--- | :--- | :--- |
| `id` | uuid | PK, default gen_random_uuid() |
| `nome` | varchar(50) | not null, unique valores: Pré-licitação, Julgamento, Contratual |
| `descricao` | text | |

### 2. `mod5_tipo_peca_juridica`
[cite_start]Tabela que define o domínio de tipos de peça[cite: 20]. [cite_start]Estrutura das colunas[cite: 21]:

| Coluna | Tipo | Restrições |
| :--- | :--- | :--- |
| `id` | uuid | PK |
| `id_fase` | uuid | not null, FK mod5_fase_licitacao(id) |
| `nome` | varchar(80) | not null (ex.: Impugnação ao Edital, Recurso Administrativo) |
| `codigo` | varchar(10) | código curto usado na UI e na escolha do modelo DOCX |
| `descricao` | text | |

### 3. `mod5_tese_juridica`
[cite_start]Armazena as teses escolhidas pelo usuário, sendo gravada no momento em que a IA sugere uma tese e o usuário cria a peça[cite: 23, 24]. [cite_start]Estrutura das colunas[cite: 25]:

| Coluna | Tipo | Restrições |
| :--- | :--- | :--- |
| `id` | uuid | PK |
| `titulo` | text | not null |
| `objetivo` | varchar(50) | |
| `relevancia` | varchar(10) | check in ('Baixa', 'Média', 'Alta') |
| `fundamentacao` | text | texto jurídico gerado pela IA |
| `created_at` | timestamptz | not null, default now() |

### 4. `mod5_licitacoes_base`
[cite_start]Atua como base de precedentes (RAG), sendo uma tabela independente consultada por Full-Text Search para ancorar as sugestões da IA[cite: 27, 28]. [cite_start]É atualizada periodicamente[cite: 29]. [cite_start]Estrutura das colunas[cite: 30]:

| Coluna | Tipo | Restrições |
| :--- | :--- | :--- |
| `id` | uuid | PK |
| `titulo` | text | not null |
| `orgao` | varchar(120) | ex.: TCU, TJ-SP |
| `tipo_decisao` | varchar(60) | ex.: Acórdão, Súmula |
| `numero` | varchar(60) | número da decisão |
| `lei_referencia` | varchar(60) | ex.: Lei 14.133/2021 |
| `data_decisao` | date | |
| `conteudo` | text | corpo da decisão (alvo do FTS) not null |
| `fonte` | text | origem/URL |
| `created_at` / `updated_at` | timestamptz | not null, default now() (updated_at via trigger) |

### 5. `mod5_peca_juridica`
[cite_start]Tabela central do módulo que concentra as FKs de contexto[cite: 31, 32, 33]. [cite_start]Estrutura das colunas[cite: 34]:

| Coluna | Tipo | Restrições |
| :--- | :--- | :--- |
| `id` | uuid | PK |
| `id_usuario` | uuid | not null, FK auth.users(id) on delete cascade |
| `id_fase` | uuid | not null, FK mod5_fase_licitacao(id) |
| `id_tipo` | uuid | not null, FK mod5_tipo_peca_juridica(id) |
| `id_tese` | uuid | FK mod5_tese_juridica(id) |
| `id_edital_m4` | uuid | referência ao edital do Módulo 04 (sem FK) |
| `id_sessao` | uuid | FK mod5_sessao_julgamento(id) fase Julgamento |
| `id_contrato_m8` | uuid | referência ao contrato do Módulo 08 (sem FK) fase Contratual |
| `id_notificacao` | uuid | FK mod5_notificacao_contratual(id) fase Contratual |
| `palavra_chave_tema` | text | tema digitado pelo usuário |
| `anexos` | jsonb | default '[]' apontando para o Supabase Storage |
| `conteudo_final` | text | texto plano extraído do DOCX gerado |
| `status` | varchar(30) | not null, default 'rascunho', check in ('rascunho', 'gerada', 'baixada', 'aguardando_julgamento', 'julgada') |
| `created_at` / `updated_at`| timestamptz | not null, default now() (updated_at via trigger) |

### 6. `mod5_historico_peca_juridica`
[cite_start]Armazena o histórico de versões das peças jurídicas[cite: 35, 36]. [cite_start]Estrutura das colunas[cite: 37]:

| Coluna | Tipo | Restrições |
| :--- | :--- | :--- |
| `id` | uuid | PK |
| `id_peca` | uuid | not null, FK mod5_peca_juridica(id) on delete cascade |
| `versao` | integer | not null, unique (id_peca, versao) |
| `conteudo` | text | not null |
| `alterado_por` | uuid | FK auth.users(id) |
| `created_at` | timestamptz | not null, default now() |

### 7. `mod5_sessao_julgamento`
[cite_start]Tabela específica da Fase 2 (Julgamento) contendo dados da sessão de pregão, vindos de API governamental ou inseridos manualmente[cite: 38, 39, 40]. [cite_start]Estrutura das colunas[cite: 41]:

| Coluna | Tipo | Restrições |
| :--- | :--- | :--- |
| `id` | uuid | PK |
| `id_edital_m4` | uuid | not null edital do Módulo 04 (sem FK) |
| `data_sessao` | timestamptz | |
| `pregoeiro` | varchar(150) | |
| `vencedor_cnpj` | varchar(18) | |
| `vencedor_razao_social`| varchar(200) | |
| `valor_vencedor` | numeric(15,2) | |
| `decisao` | text | |
| `participantes` | jsonb | lista de { cnpj, razao_social, status, motivo } |
| `fonte_dados` | varchar(20) | not null, check in ('api_gov', 'upload_manual') |
| `arquivo_ata_url` | text | ata no Storage |
| `created_at` | timestamptz | not null, default now() |

### 8. `mod5_notificacao_contratual`
[cite_start]Tabela específica da Fase 3 (Contratual) contendo as notificações de descumprimento que originam as defesas e pedidos de reconsideração[cite: 42, 43, 44]. [cite_start]Estrutura das colunas[cite: 45]:

| Coluna | Tipo | Restrições |
| :--- | :--- | :--- |
| `id` | uuid | PK |
| `id_contrato_m8` | uuid | not null contrato do Módulo 08 (sem FK) |
| `id_usuario` | uuid | not null, FK auth.users(id) on delete cascade |
| `tipo` | varchar(80) | not null, default 'recebida', check in ('recebida', 'em_defesa', 'defesa_enviada', 'julgada') |
| `data_recebimento` | date | |
| `prazo_defesa` | date | |
| `descricao` | text | |
| `arquivo_url` | text | |
| `status` | varchar(30) | |
| `created_at` | timestamptz | not null, default now() |
