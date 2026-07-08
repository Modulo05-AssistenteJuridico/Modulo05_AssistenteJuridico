# 🔗 Integração do Módulo 05 (Assistente Jurídico)

Este documento detalha como o Módulo 05 se comunica com os demais módulos da plataforma, focado na leitura de dados para alimentar a inteligência artificial (Gemini) e preencher os documentos jurídicos.

## 🏛️ Modelo de Integração

A integração não ocorre via chamadas HTTP (API), mas sim pelo **compartilhamento de um único projeto Supabase** (PostgreSQL + Auth + Storage) entre todos os módulos.

### Decisões Arquiteturais
* **Armazenamento Mínimo:** O Módulo 05 guarda apenas os IDs dos registros de outros módulos (ex.: `id_edital_m4`, `id_contrato_m8`). Ele consulta os dados no momento do uso, evitando duplicação e desuso de cache local em banco.
* **Soft Links (Sem FK):** As colunas que referenciam outros módulos não possuem *constraints* de Chave Estrangeira (FK), pois as tabelas pertencem a contextos diferentes. A validação é feita via código (regex) antes da gravação.
* **Execução Segura:** Toda a leitura de dados externos ocorre exclusivamente no lado do servidor (*Server Components* e *API Routes*) usando o *client administrativo* (service role key), contornando o RLS de outros módulos de forma controlada.

---

## 🗺️ Mapa de Dependências

O Módulo 05 consome informações de dois módulos principais:

| Módulo de Origem | Informação Fornecida | Tabela Consultada |
| :--- | :--- | :--- |
| **M04 - Editais** | Dados e documentos (PDFs) das licitações. | `mod4_tempmod1` |
| **M04 - Editais** | Dados da empresa fornecedora. | `mod4_tempmod2` |
| **M08 - Contratos** | Dados de contratos administrativos. | `mod8_contrato` |

---

## ⚙️ Fluxo de Funcionamento e IA

### 1. Processamento de Editais (Módulo 04)
* A listagem de editais é feita mapeando o `órgão licitante` e o `objeto`].
* **Download Estratégico:** Os documentos atrelados ao edital são baixados do *Supabase Storage* com um limite de 1 arquivo e 10 MB para respeitar a cota gratuita da API do Gemini.
* **Cache em Memória:** Para evitar downloads repetitivos e economizar recursos, o sistema mantém um cache em memória (*TTL de 10 minutos*, máximo de 4 entradas) dos documentos em Base64.

### 2. Processamento de Contratos (Módulo 08)
* Contratos são exigidos apenas para peças da fase contratual (ex.: Pedido de Pagamento, Defesa Prévia).
* Os dados do contrato são resumidos e injetados no contexto da IA.

### 3. Integração com a IA (Gemini)
Os dados externos alimentam o documento em duas etapas:
1. **Geração e Fundamentação:** O texto resumo do edital/contrato e os arquivos PDF são enviados no *prompt* para que a IA use os fatos reais (prazos, cláusulas, itens) na fundamentação das teses jurídicas.
2. **Preenchimento Documento:** A IA cruza os dados do Edital, Contrato e Empresa para preencher exatamente os campos corretos no modelo DOCX (ex.: "Razão Social" no campo da licitante), com instrução rigorosa para **não inventar** informações ausentes.

---

## 🛡️ Resiliência e Segurança

* **Dados Mockados no Desenvolvimento::** Para não travar o desenvolvimento, caso as tabelas de outros módulos estejam indisponíveis ou vazias, o sistema automaticamente provê dados falsos (*mocks*), mantendo a interface navegável.
* **Proteção de Chaves:** Nenhuma chave sensível (como `SUPABASE_SERVICE_ROLE_KEY` ou API do Gemini) é exposta ao navegador do usuário.
* **Isolamento de Informações:** Enquanto o Módulo 05 usa credenciais administrativas para *ler* outros módulos, suas próprias tabelas possuem *Row Level Security* (RLS) habilitado para que cada fornecedor acesse apenas suas próprias peças jurídicas.
