## Justificativa da Arquitetura

A adoção da arquitetura **Cliente-Servidor** com **Backend as a Service (BaaS)** foi motivada pelos seguintes fatores:

- **Separação de responsabilidades:** a interface concentra apenas a interação com o usuário, enquanto as regras de negócio permanecem nas API Routes e a persistência dos dados fica centralizada no Supabase. Essa divisão reduz o acoplamento entre as camadas e facilita a manutenção do sistema.

- **Centralização da infraestrutura:** o Supabase reúne serviços de banco de dados, autenticação e armazenamento de arquivos em uma única plataforma, eliminando a necessidade de implementar e manter esses serviços separadamente.

- **Integração entre módulos:** como os módulos compartilham a mesma infraestrutura de dados, o Módulo 05 consegue consumir editais, contratos e demais informações diretamente do banco integrado, simplificando a comunicação entre os componentes do sistema.

- **Redução da complexidade de desenvolvimento:** ao utilizar serviços gerenciados, a equipe pode concentrar esforços na implementação das regras de negócio do Assistente Jurídico, reduzindo o tempo gasto com configuração e administração da infraestrutura.

- **Escalabilidade e evolução:** a separação entre interface, APIs e camada de dados permite que novas funcionalidades, integrações e módulos sejam incorporados com menor impacto na arquitetura existente.

- ## Decisões Arquiteturais

A solução prioriza uma arquitetura monolítica baseada em Next.js com serviços gerenciados pelo Supabase, evitando a complexidade de microsserviços para um projeto cujo foco é integração rápida entre módulos e desenvolvimento de um MVP.
