# ADR 003: Hospedagem, Integração Contínua e Versionamento (Decisão Local)

## Contexto
Com 6 desenvolvedores trabalhando simultaneamente em funcionalidades diferentes (busca, interface, gerador de PDF), precisamos de uma forma segura de integrar os códigos e disponibilizar o sistema em ambiente de produção automaticamente.
Para garantir o versionamento correto das atualizações desenvolvidas no módulo 05, como busca, interface, geração de PDF, entre outras, será necessário uma forma segura de integrar os códigos e disponibilizar o sistema de forma ágil.

## Decisão
Adotaremos o **Git/GitHub** para o versionamento de código e a plataforma **Vercel** para a hospedagem da aplicação Next.js.

## Consequências

### Positivas
* **Integração Nativa:** A Vercel é otimizada para o Next.js e possui conexão direta com o GitHub.
* **Automatização:** Cada *Push* ou *Merge* na ramificação principal resulta em um deploy automático, garantindo agilidade.
* **Code Review:** O uso do GitHub permite que membros mais experientes revisem o código dos iniciantes via *Pull Requests*, garantindo a qualidade.

### Negativas/Trade-offs
* **Limites de Tempo (Serverless):** Funções executadas no servidor na Vercel (plano gratuito) possuem limites de tempo (geralmente entre 10 e 60 segundos). Isso exigirá otimização extrema caso a geração de PDFs complexos exceda esse tempo.
