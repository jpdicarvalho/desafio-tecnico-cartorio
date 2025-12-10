## Sobre o projeto
Este projeto é uma aplicação completa para controle de pagamentos e transferências, desenvolvida para o Cartório do 1º Ofício de Notas e Registro de Imóveis de Santarém - PA. A solução inclui backend em Node.js com TypeScript, frontend em Next.js, banco de dados MySQL e toda a orquestração via Docker Compose. O sistema permite cadastro, edição, listagem, exclusão de pagamentos, upload de comprovantes, além de filtros e relatórios por período. O foco foi aplicar boas práticas de desenvolvimento, organização em camadas, validação rigorosa e testes automatizados para garantir qualidade e confiabilidade.

## Requisitos Técnicos e Diferencias implementados

### Frontend
- **Tecnologias Utilizadas:** Next.js, React, TypeScript e CSS.
- **Descrição:** O frontend oferece uma interface simples e funcional para listagem, criação e edição de pagamentos, com filtros por tipo e intervalo de datas. Utiliza formulários validados e integra-se perfeitamente com a API backend. A organização do código prioriza componentes reutilizáveis e separação clara de responsabilidades. O principal objetivo foi garantir usabilidade básica e integração correta, atendendo aos requisitos mínimos e diferenciais do desafio.

### Backend
- **Tecnologias Utilizadas:** Node.js, Express, TypeScript, TypeORM, Celebrate/Joi para validação, Multer para upload de arquivos.
- **Descrição:** O backend implementa um CRUD completo para pagamentos e tipos de pagamento, com regras de negócio para evitar duplicidade e garantir integridade dos dados. O upload de comprovantes é feito via Multer, armazenando o caminho do arquivo no banco. As rotas são validadas com Celebrate/Joi para garantir dados consistentes. A arquitetura é modular, com separação clara entre controllers, serviços e repositórios. Também foi implementado endpoint para relatório por período, retornando lista e total pago. Testes automatizados de integração cobrem os principais fluxos da API.

### Banco de Dados
- **Tecnologias Utilizadas:** MySQL, TypeORM para ORM e migrations.
- **Descrição:** O banco relacional MySQL armazena as entidades Payment e PaymentType, com relacionamentos e constraints para garantir integridade. As migrations são usadas para versionamento do esquema, facilitando deploys e manutenção. Dados iniciais (seeds) são aplicados para popular tipos de pagamento básicos. O banco é orquestrado via Docker, garantindo ambiente isolado e replicável para desenvolvimento e testes.
  
### Dokerização do projeto
- **Tecnologias Utilizadas:** Docker, Docker Compose.
- **Descrição:** O projeto conta com um arquivo docker-compose.yml que orquestra os containers do backend, frontend e banco de dados MySQL. Com um único comando, todo o ambiente é construído e iniciado, facilitando a execução e avaliação. Os containers compartilham redes e volumes para persistência dos dados. Scripts npm facilitam subir, testar e resetar o ambiente, garantindo uma experiência simples e consistente para desenvolvedores e avaliadores.
  
### Testes automatizados
- **Tecnologias Utilizadas:** Jest, Supertest para testes de integração.
- **Descrição:** Foram implementados testes automatizados de integração para o backend, cobrindo criação, validação, prevenção de duplicatas, listagem, detalhes, atualização, remoção e upload de comprovantes. Os testes garantem que as regras de negócio estão corretas e que a API responde adequadamente a diferentes cenários, incluindo erros esperados. O ambiente de testes é configurado para rodar dentro do container Docker, garantindo isolamento e reprodutibilidade. Essa cobertura demonstra preocupação com qualidade e confiabilidade do sistema.
- **Cobertura**: Os testes de integração do backend cobrem os seguintes cenários essenciais:
    -   **Criação de Pagamentos (`POST /payments`):**
        -   Verifica a criação bem-sucedida de um pagamento.
        -   Testa a validação de payload incompleto (retornando `400 Bad Request`).
        -   Garante que pagamentos duplicados (mesma data, tipo, descrição e valor) não podem ser criados.
    -   **Listagem e Detalhes de Pagamentos (`GET /payments`, `GET /payments/:id`):**
        -   Confirma que a listagem de pagamentos funciona corretamente.
        -   Verifica a recuperação dos detalhes de um pagamento específico por ID.
    -   **Atualização de Pagamentos (`PUT /payments/:id`):**
        -   Assegura que um pagamento existente pode ser atualizado com sucesso.
    -   **Remoção de Pagamentos (`DELETE /payments/:id`):**
        -   Verifica a remoção de um pagamento e a impossibilidade de acessá-lo posteriormente.
    -   **Upload de Comprovantes (`POST /payments/:id/receipt`):**
        -   Testa o upload bem-sucedido de um arquivo de recibo para um pagamento.
        -   Verifica o tratamento de erro quando nenhum arquivo é enviado (retornando `400 Bad Request`).
  
## Como Rodar a Aplicação

Siga os passos abaixo para clonar o repositório e colocar a aplicação em funcionamento:

### 1. Clonar o Repositório

Primeiro, clone o projeto para sua máquina local:

```bash
git clone https://github.com/seu-usuario/desafio-tecnico-cartorio.git
cd desafio-tecnico-cartorio
```

### 2. Iniciar a Aplicação

A aplicação utiliza Docker Compose para gerenciar o ambiente de desenvolvimento (MySQL, Backend e Frontend).

Para subir todos os serviços (banco de dados, backend e frontend) e construir as imagens Docker, execute o seguinte comando no terminal, a partir da raiz do projeto:

```bash
npm run start
```

Este comando irá:
- Construir as imagens Docker para o backend e frontend.
- Iniciar o container do MySQL.
- Aplicar as migrations do TypeORM no banco de dados.
- Iniciar o servidor backend (na porta `4000`).
- Iniciar o servidor frontend (na porta `3000`).

Após a execução, você poderá acessar a aplicação frontend em seu navegador através do endereço: [http://localhost:3000](http://localhost:3000).

### 3. Executar os Testes Automatizados

**Atenção:**
Ao executar os testes, as tabelas do banco de dados são limpas e populadas com dados de teste para garantir um ambiente isolado e determinístico para cada execução. Isso significa que os dados iniciais (seeds) da aplicação serão temporariamente substituídos.

**Recomendação:**
Para uma avaliação completa da aplicação com os dados iniciais, sugiro que você acesse e explore a aplicação **antes** de rodar os testes.

Para rodar os testes, abra **um novo terminal** (mantendo o terminal onde a aplicação está rodando aberta) e execute o seguinte comando na raiz do projeto:

```bash
npm run test:docker
```

Este comando irá:
- Conectar-se ao container do backend.
- Executar a suíte de testes de integração.
- Exibir os resultados dos testes diretamente no seu terminal.

### 4. Reiniciar a Aplicação (Limpar e Reconstruir)

Se você precisar reiniciar a aplicação do zero, limpando todos os dados do banco de dados e reconstruindo as imagens Docker, use o seguinte comando:

```bash
npm run reset
```

Este comando irá:
- Derrubar todos os containers.
- Remover os volumes de dados do MySQL (apagando todos os dados do banco).
- Reconstruir as imagens Docker.
- Subir todos os serviços novamente, aplicando as migrations e seeds iniciais.

---
