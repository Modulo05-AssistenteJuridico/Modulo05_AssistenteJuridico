# 🏗️ Arquitetura e Fluxo do Módulo 05

## Visão Geral

O Módulo 05 é desenvolvido utilizando arquitetura cliente-servidor com **Next.js**, **React**, **TypeScript**, **Supabase** e **Google Gemini**. O fluxo da aplicação abrange desde a criação da peça jurídica até a geração e download do documento final.

---

## Responsabilidades das Camadas

- **Cliente:** interface e interação com o usuário.
- **API Routes:** processamento das regras de negócio.
- **IA:** geração de teses, fundamentações e preenchimento do documento.
- **Supabase:** persistência, autenticação e armazenamento dos arquivos.

# Atributos de Qualidade

A arquitetura foi projetada priorizando:

- desempenho na geração de documentos e buscas textuais;
- manutenibilidade através da separação entre interface, APIs e acesso aos dados;
- integridade dos dados utilizando transações do PostgreSQL;
- disponibilidade por meio da infraestrutura em nuvem (Vercel + Supabase);
- segurança utilizando HTTPS, autenticação e isolamento dos dados.

---

# Stack Tecnológica

| Camada | Tecnologia |
|---------|------------|
| Frontend | Next.js (App Router), React e TypeScript |
| Backend | Next.js API Routes |
| Banco de Dados | Supabase (PostgreSQL) |
| Autenticação | Supabase Auth |
| Armazenamento | Supabase Storage |
| Inteligência Artificial | Google Gemini |
| Manipulação de Documentos | JSZip |
| Geração de PDF | @react-pdf/renderer |
| Estilização | Tailwind CSS |
| Repositório | GitHub (Organização) |
| Versionamento | Vercel |

---

# Arquitetura

A aplicação é organizada nas seguintes camadas:

```text
Páginas e Componentes
        ↓
API Routes
        ↓
lib/data e lib/ai
        ↓
Supabase e Google Gemini
```

Os componentes nunca acessam diretamente o banco de dados ou a IA, realizando todas as operações por meio das API Routes ou Server Components.

---

# Estrutura do Projeto

```text
src/
├── app/
├── components/
├── lib/
├── types/
└── utils/

supabase/
└── mod5_schema.sql
```

## Principais diretórios

| Diretório | Responsabilidade |
|-----------|------------------|
| `app/` | Páginas, rotas e APIs da aplicação |
| `components/` | Componentes da interface |
| `lib/ai/` | Integração com o Google Gemini |
| `lib/data/` | Acesso aos dados e integrações com Supabase |
| `mock/` | Dados utilizados como fallback |
| `supabase/` | Clientes de acesso ao banco |
| `types/` | Tipagens da aplicação |
| `utils/` | Funções auxiliares |

---

# Modelos DOCX

Cada tipo de peça jurídica possui um modelo DOCX armazenado no Supabase Storage (Bucket).

Durante o processamento, o sistema:

- abre o arquivo DOCX;
- identifica os campos editáveis;
- identifica as seções argumentativas;
- preserva toda a formatação original;
- reescreve apenas os conteúdos preenchidos.

Os modelos DOCX e os PDFs do edital permanecem em cache por até 10 minutos.

---

# Fluxo Completo

## 1. Criação da peça

O usuário:

- seleciona o edital;
- seleciona o tipo de peça;
- seleciona o contrato (quando necessário);
- informa o tema da peça.

---

## 2. Sugestão de teses

O sistema:

- busca precedentes jurídicos;
- obtém os PDFs do edital;
- envia o contexto para a IA;
- recebe entre 5 e 7 sugestões de teses ordenadas por relevância.

---

## 3. Criação do registro da peça

Após a escolha da tese:

- a tese é salva no banco;
- a peça jurídica é criada com status **rascunho**;
- o usuário é redirecionado ao editor.

---

## 4. Preenchimento do documento

O editor:

- carrega o modelo DOCX;
- solicita à IA o preenchimento automático dos campos;
- apresenta os campos preenchidos para revisão.

Caso a IA não consiga preencher algum conteúdo, o usuário poderá completá-lo manualmente.

---

## 5. Registro do Documento

Ao salvar o documento, o sistema:

- aplica os valores ao modelo DOCX;
- gera um novo documento;
- realiza o upload para o Storage;
- grava o conteúdo final da peça;
- altera o status para **gerada**.

---

## 6. Consulta e Downloads

Após a geração da peça, o usuário pode:

- visualizar o documento;
- realizar download em DOCX;
- realizar download em PDF;
- excluir a peça.

---

# Endpoints Principais

| Endpoint | Função |
|----------|---------|
| `POST /api/pecas/gerar` | Gerar sugestões de teses |
| `POST /api/pecas/fundamentar` | Gerar fundamentação jurídica |
| `POST /api/pecas` | Criar a peça jurídica |
| `POST /api/pecas/[id]/preencher` | Preencher o modelo DOCX |
| `POST /api/pecas/[id]/documento` | Salvar o documento |
| `GET /api/pecas/[id]/documento/docx` | Download do DOCX |
| `GET /api/pecas/[id]/documento/pdf` | Download do PDF |
| `DELETE /api/pecas/[id]` | Excluir a peça |

---

# Ciclo de Vida da Peça

```text
rascunho
     │
     ▼
gerada
     │
     ├── baixada
     ├── aguardando_julgamento
     └── julgada
```

Atualmente o fluxo implementado utiliza os estados:

- `rascunho`
- `gerada`

Os demais estados permanecem definidos para futuras evoluções.

---

# Tratamento de Falhas

| Situação | Comportamento |
|----------|---------------|
| Dados de outros módulos indisponíveis | Utilização de dados mock |
| Limite ou erro da IA | Retry e modelo de fallback |
| Falha na geração das teses | Retorno de teses mock |
| Falha no preenchimento pela IA | Preenchimento manual pelo usuário |
| Falha na fundamentação | Fluxo continua normalmente |
| Falha ao criar a peça | Remoção da tese criada para evitar registros órfãos |

---

# Resumo do Fluxo

```text
Usuário cria uma nova peça
        │
        ▼
Seleção do edital e tipo
        │
        ▼
Sugestão de teses pela IA
        │
        ▼
Escolha da tese
        │
        ▼
Criação da peça (rascunho)
        │
        ▼
Preenchimento automático do modelo DOCX
        │
        ▼
Revisão pelo usuário
        │
        ▼
Salvamento do documento
        │
        ▼
Download em DOCX ou PDF
```
