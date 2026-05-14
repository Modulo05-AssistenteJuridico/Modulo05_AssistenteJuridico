# ADR 002: Stack Tecnológica de Aplicação (Decisão Local do Módulo 05)


## Contexto
Nossa equipe de 6 pessoas (com níveis variados de experiência) precisa construir a interface do Assistente Jurídico, processar regras de negócio e gerar documentos PDF/DOCX pesados. O prazo de entrega e a necessidade de colaboração exigem uma stack ágil e unificada.

## Alternativas Consideradas
* **Frontend em React isolado com Backend em Python:** Descartado pois exigiria manter e conectar dois repositórios e servidores diferentes, aumentando a complexidade de integração e o grau de aprendizado para os iniciantes.

## Decisão
Adotaremos o **Next.js** (JavaScript/TypeScript). Usaremos os *Client Components* (React) para as telas de interface e as *API Routes/Server Actions* (Node.js) para a comunicação com as APIs do Governo e geração dos PDFs no lado do servidor.

## Consequências

### Positivas
* **Linguagem Unificada:** Uso de JavaScript/TypeScript em todo o ciclo de desenvolvimento (Fullstack).
* **Gestão Simplificada:** Apenas um repositório para gerenciar, facilitando o deploy e a colaboração.
* **Performance:** Geração de documentos pesados executada no servidor (Node.js), evitando travamentos na interface do usuário.

### Negativas/Trade-offs
* **Curva de Aprendizado:** A equipe precisará compreender a distinção entre o código que roda no cliente (Client Components) e no servidor (Server Components/Actions) dentro do mesmo framework.
