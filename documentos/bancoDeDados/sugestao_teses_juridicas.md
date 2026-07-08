# 🧠 Módulo 05 - Sugestão de Teses Jurídicas e Motor de IA

## Visão Geral

O Módulo 05 utiliza Inteligência Artificial para sugerir teses jurídicas que fundamentam automaticamente peças administrativas e judiciais relacionadas à Lei nº 14.133/2021.

O processo foi projetado para gerar sugestões contextualizadas, utilizando precedentes jurídicos, documentos do edital e informações da licitação, reduzindo o tempo de elaboração das peças sem substituir a revisão humana.

---

# Arquitetura da IA

## Modelo utilizado

| Item | Tecnologia |
|-------|------------|
| Provedor | Google Gemini |
| SDK | `@google/genai` |
| Modelo principal | `gemini-2.5-flash` |
| Modelo de fallback | `gemini-2.5-flash-lite` |
| Execução | Server-side |

---

# Estratégia de Resiliência

Para reduzir falhas causadas pelos limites da API:

- até 2 tentativas por modelo;
- troca automática para o modelo de fallback em erros de limite (`429`);
- novo retry para erros temporários (`429`, `500` e `503`);
- utilização de teses mock quando toda a geração falha.

---

# Fluxo de Geração das Teses

## 1. Entrada do usuário

O usuário informa:

- tema da peça;
- tipo da peça;
- licitação selecionada;
- contrato (quando aplicável).

---

## 2. Recuperação de precedentes

Antes da geração das teses, o sistema consulta a base de precedentes no PostgreSQL.

A pesquisa busca até **5 precedentes** relacionados ao tema informado.

Caso a função RPC especializada esteja indisponível, é utilizado o mecanismo nativo de pesquisa textual do Supabase.

Essa estratégia implementa o conceito de **Retrieval-Augmented Generation (RAG)**, utilizando decisões reais para contextualizar a IA.

---

## 3. Construção do Prompt

O prompt enviado para a IA contém:

- persona de advogado especialista em licitações públicas;
- tipo da peça;
- informações da licitação;
- contrato (quando existir);
- tema informado pelo usuário;
- precedentes recuperados;
- documentos PDF do edital.

---

## 4. Geração das Teses

A IA retorna entre **5 e 7 teses**, contendo:

- título;
- objetivo;
- relevância.

A relevância pode ser:

- Alta
- Média
- Baixa

As sugestões são ordenadas automaticamente conforme sua relevância.

---

# Geração da Fundamentação

A fundamentação jurídica é gerada em uma segunda etapa.

Essa separação reduz:

- consumo de tokens;
- tempo de resposta;
- processamento desnecessário.

Para cada tese é produzido um texto jurídico contendo:

- dispositivos legais;
- princípios jurídicos;
- fundamentação argumentativa.

A primeira fundamentação é gerada automaticamente em segundo plano.

As demais são geradas sob demanda quando o usuário seleciona outra tese.

---

# Criação da Peça Jurídica

Após a escolha da tese:

1. a fundamentação é concluída (caso necessário);
2. a tese é registrada no banco de dados;
3. a peça jurídica é criada como rascunho;
4. o modelo DOCX correspondente é carregado;
5. a IA preenche automaticamente os campos do documento.

---

# Regras do Preenchimento

A IA segue algumas regras durante a geração do documento:

- produzir textos argumentativos apenas nos campos apropriados;
- evitar repetição entre campos;
- inserir cada informação somente em seu local correto;
- nunca inventar informações inexistentes;
- manter campos sem dados destacados para preenchimento manual.

---

# Chamadas de IA

| Endpoint | Objetivo | Resultado |
|----------|----------|-----------|
| `POST /api/pecas/gerar` | Gerar sugestões de teses | Lista de teses |
| `POST /api/pecas/fundamentar` | Gerar fundamentação jurídica | Texto argumentativo |
| `POST /api/pecas/[id]/preencher` | Preencher modelo DOCX | Campos preenchidos |

---

# Resumo do Processo

```text
Usuário informa o tema
        │
        ▼
Busca de precedentes
        │
        ▼
Construção do prompt
        │
        ▼
IA gera 5–7 teses
        │
        ▼
Geração da fundamentação
        │
        ▼
Usuário escolhe a tese
        │
        ▼
Criação da peça jurídica
        │
        ▼
Preenchimento automático do modelo DOCX
        │
        ▼
Revisão e edição pelo usuário
```
