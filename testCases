# 🧪 Suíte de Testes - Módulo 05

## Visão Geral

Esta suíte de testes foi desenvolvida para validar o funcionamento do **Módulo 05 – Assistente Jurídico para Processos Licitatórios**, garantindo que todas as funcionalidades implementadas atendam aos requisitos funcionais e não funcionais definidos durante a especificação do sistema.

O objetivo da estratégia de testes é identificar falhas antes da disponibilização da aplicação aos usuários, assegurando maior confiabilidade, estabilidade e qualidade dos documentos jurídicos gerados pelo sistema.

---

# Metodologia de Testes

A estratégia adotada contempla diferentes níveis de teste para validar o sistema de forma abrangente.

## Testes de Unidade

Validam funções isoladas da aplicação, garantindo que componentes individuais funcionem corretamente de forma independente.

Exemplos:

- validação de tamanho máximo de arquivos;
- validação de extensões permitidas;
- validação de e-mails;
- regras de negócio específicas.

---

## Testes de Integração

Validam a comunicação entre os módulos internos e serviços externos.

Principais integrações avaliadas:

- Frontend ↔ Backend (Supabase);
- Módulo 04;
- Módulo 08;
- APIs Governamentais.

---

## Testes End-to-End (E2E)

Simulam toda a jornada do usuário dentro da aplicação.

O fluxo validado contempla:

- seleção do edital;
- escolha da categoria jurídica;
- busca por teses;
- geração da peça jurídica;
- edição;
- exportação do documento.

---

# Tipos de Teste

## Testes Funcionais

Verificam se todas as regras de negócio funcionam conforme especificado.

São avaliados:

- fluxo principal;
- fluxos alternativos;
- cenários de exceção;
- validações de entrada;
- geração dos documentos.

---

## Testes Não Funcionais

Avaliam características relacionadas à qualidade do sistema.

### Segurança

- isolamento dos dados;
- controle de acesso;
- conformidade com a LGPD.

### Performance

- tempo de resposta da IA;
- tempo de integração entre módulos;
- processamento de documentos.

### Usabilidade

- clareza da interface;
- responsividade;
- facilidade de utilização.

---

# Técnicas de Teste Utilizadas

## Particionamento de Equivalência

Utilizado nos testes positivos para reduzir a quantidade de cenários mantendo a cobertura funcional.

A técnica considera que entradas pertencentes à mesma classe produzem o mesmo comportamento esperado.

---

## Análise de Valor Limite

Aplicada principalmente nos testes negativos.

São avaliadas situações como:

- tamanho máximo permitido de arquivos;
- formatos aceitos;
- valores imediatamente acima ou abaixo dos limites definidos.


---

# Casos de Teste

---

# CT-01 — Cadastro de Peça Jurídica

### Scenario: Test Case - Gerar uma nova peça jurídica

**Dado que** o usuário selecionou um edital válido.

**Quando** informar uma palavra-chave, selecionar um tema jurídico e escolher uma tese jurídica.

**Então** o sistema deverá gerar uma pré-visualização da peça jurídica e permitir sua exportação em PDF ou DOCX.

---

# CT-02 — Geração de Peça com Múltiplas Palavras-chave

### Scenario: Test Case - Buscar teses utilizando múltiplas palavras-chave

**Dado que** o usuário esteja na tela de cadastro da peça jurídica e tenha selecionado uma categoria jurídica.

**Quando** informar múltiplas palavras-chave relacionadas ao tema e solicitar a busca.

**Então** o sistema deverá consultar a IA, apresentar as teses jurídicas compatíveis e permitir a seleção para geração da peça.

---

# CT-03 — Edição da Pré-visualização

### Scenario: Test Case - Editar informações da peça jurídica

**Dado que** uma peça jurídica já tenha sido gerada.

**Quando** o usuário editar seu conteúdo e salvar as alterações.

**Então** o sistema deverá persistir as alterações e gerar o documento atualizado para exportação.

---

# CT-04 — Exportação do Documento

### Scenario: Test Case - Exportar documento em PDF

**Dado que** o usuário esteja visualizando uma peça jurídica finalizada.

**Quando** selecionar a opção de gerar pdf.

**Então** o sistema deverá gerar e realizar o download do arquivo PDF corretamente.

---

# CT-05 — Upload de Arquivo Acima do Limite

### Scenario: Test Case - Bloquear upload acima do tamanho permitido

**Dado que** o usuário esteja anexando um documento complementar.

**Quando** selecionar um arquivo com tamanho superior a 25 MB.

**Então** o sistema deverá cancelar o upload, exibir uma mensagem de erro e impedir o armazenamento do arquivo.

---

# CT-06 — Upload com Extensão Inválida

### Scenario: Test Case - Rejeitar formatos de arquivo não permitidos

**Dado que** o sistema solicite o envio de um documento.

**Quando** o usuário selecionar um arquivo com extensão diferente de PDF, DOC ou DOCX.

**Então** o sistema deverá rejeitar o arquivo, limpar o campo de upload e informar o motivo da rejeição.

---

# CT-07 — Falha de Integração com API Governamental

### Scenario: Test Case - Tratar timeout da API do Governo

**Dado que** o sistema esteja realizando a integração com a API do Governo.

**Quando** ocorrer um timeout durante a comunicação.

**Então** o sistema deverá informar a indisponibilidade do serviço e disponibilizar o envio manual da documentação.

---

# CT-08 — Falha na Importação do Módulo 04

### Scenario: Test Case - Tratar falha na leitura das regras do edital

**Dado que** o usuário tenha selecionado um edital.

**Quando** ocorrer uma falha durante a importação realizada pelo Módulo 04.

**Então** o sistema deverá interromper o processamento e oferecer a opção de realizar uma nova tentativa.

---

# CT-09 — Integração com o Módulo 04

### Scenario: Test Case - Recuperar resumo das regras do edital

**Dado que** exista um edital válido processado pelo Módulo 04.

**Quando** o usuário solicitar a geração de uma manifestação jurídica.

**Então** o sistema deverá recuperar corretamente o resumo das regras do edital e utilizá-lo na geração do documento.

---

# CT-10 — Integração com o Módulo 08

### Scenario: Test Case - Consultar contratos vigentes

**Dado que** existam contratos vigentes disponíveis no Módulo 08.

**Quando** o usuário solicitar um documento que dependa dessas informações.

**Então** o sistema deverá consultar os contratos, processar os dados recebidos e utilizá-los corretamente na elaboração do documento jurídico.

---
