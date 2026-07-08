# Módulo 05 — Assistente Jurídico da Licitação

🔗 **Link de Acesso à Aplicação do Assistente Jurídico:** https://modulo05-assistente-juridico.vercel.app/

---

## Documentação Técnica

Toda a documentação técnica desenvolvida durante o projeto encontra-se organizada e disponível na pasta **documentos** do repositório.

| Documento | Descrição |
|-----------|-----------|
| [Integração com outros módulos](documentos/bancoDeDados/integracoes_mod05.md) | Como o Módulo 05 busca editais (Módulo 04), contratos (Módulo 08) e dados da empresa para compor automaticamente a peça jurídica. |
| [Sugestão de teses jurídicas e IA](documentos/bancoDeDados/sugestao_teses_juridicas.md) | Funcionamento do motor de IA (Google Gemini), recuperação de precedentes jurídicos e geração das teses e do conteúdo da peça. |
| [Banco de Dados](documentos/bancoDeDados/tabelas_relacionamentos.md) | Estrutura das tabelas, relacionamentos e composição dos elementos do banco de dados do Módulo 05. |
| [Casos de Uso Detalhados](documentos/planoDeTestes/casosDeTeste.md) | Registro dos principais casos de usos utilizados para validar o funcionamento correto da aplicação. |
| [Arquitetura e Fluxo Completo](documentos/arquitetura/documentacao_arquitetura.md) | Organização da arquitetura da aplicação e fluxo completo, desde a criação da peça jurídica até a geração do documento final. |
| [Registro das Decisões](documentos/adr) | Registro e documentação das estratégias e decisões de infraestrutura decididas pela equipe visando o correto funcionamento e escalamento do sistema. |
| [Entregas Realizadas](documentos/entregas) | Diretório exclusivamente destinado para armazenar os documentos escritos durante as etapas do projeto integrador. |

---

# Descrição Geral do Módulo 05

O **Módulo 05 — Assistente Jurídico da Licitação** tem como objetivo automatizar e otimizar a criação de manifestações jurídicas relacionadas a processos licitatórios públicos, reduzindo o tempo gasto na elaboração manual de documentos administrativos e aumentando a eficiência operacional dos licitantes e fornecedores.

A proposta do módulo surge a partir da necessidade de agilizar atividades que atualmente demandam longos períodos de análise documental, organização de informações e construção manual de peças jurídicas. Processos como elaboração de impugnações, pedidos de esclarecimentos, recursos administrativos e requerimentos contratuais frequentemente exigem a leitura detalhada de editais, atas, contratos e decisões administrativas, tornando o fluxo operacional lento, repetitivo e suscetível a falhas.

Além do tempo elevado necessário para produção dessas manifestações, existe também a complexidade técnica envolvida na interpretação das regras licitatórias, legislação aplicável e definição das teses jurídicas adequadas para cada situação.

Nesse contexto, o sistema atua como um **assistente jurídico inteligente**, auxiliando o usuário na construção das peças jurídicas por meio de fluxos guiados, categorização de teses jurídicas e geração estruturada de documentos administrativos, buscando reduzir retrabalho, acelerar a tomada de decisão e otimizar todo o processo jurídico licitatório.

---

# Objetivos Principais do Módulo 05

- Automatizar a geração de peças jurídicas;
- Auxiliar fornecedores e licitantes durante as fases diversas da licitação;
- Organizar informações jurídicas e documentais de forma centralizada;
- Sugerir temas e teses jurídicas padronizadas;
- Garantir maior padronização estrutural das peças jurídicas geradas.

---

# Principais Funcionalidades

Entre as funcionalidades previstas para o módulo estão:

- Geração automatizada de peças jurídicas;
- Sugestão de teses jurídicas com base em precedentes administrativos;
- Busca por palavras-chave e temas jurídicos;
- Geração de arquivos formatados em PDF ou DOCX;
- Armazenamento do histórico de peças jurídicas;
- Fluxo guiado passo a passo para construção documental;
- Pré-visualização e edição manual das peças geradas;
- Integração com módulos auxiliares.

---

# Atuação nas Fases da Licitação

O módulo foi estruturado para atuar em três momentos principais do ciclo licitatório.

## 1. Pré-Licitação

Fase destinada à análise do edital antes da abertura da licitação.

### Funcionalidades:
- Pedido de esclarecimentos;
- Impugnação ao edital;
- Sugestão de teses relacionadas ao edital;
- Geração automatizada da petição administrativa.

---

## 2. Julgamento da Licitação

Fase relacionada à contestação de decisões administrativas durante o perído lictatório.

### Funcionalidades:
- Razões de recurso administrativo;
- Contrarrazões;
- Importação de atas de julgamento;
- Integração com APIs governamentais;
- Cruzamento entre decisão do órgão e regras do edital;
- Sugestão automática de fundamentações jurídicas.

---

## 3. Fase Contratual

Etapa voltada ao acompanhamento da execução contratual após o encerramento da licitação.

### Funcionalidades:
- Pedido de pagamento;
- Pedido de reajuste;
- Pedido de reequilíbrio econômico-financeiro;
- Defesa prévia;
- Pedido de reconsideração;
- Integração com o módulo de gestão contratual.

---

# Integrações Previstas

O Assistente Jurídico irá compartilhar e integrar informações com outros módulos do sistema.

## Integrações previstas:
- **Módulo 04:** análise e resumo automatizado de editais;
- **Módulo 06:** calendário e monitoramento de prazos;
- **Módulo 08:** gestão contratual e acompanhamento de contratos.

---

🔗 **Link do Drive de Organização da Documentação:** https://drive.google.com/drive/folders/1mQsMgl-jr3q9zYiVqMLZbQXK4S2OVXAQ?usp=drive_link
