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

O backend possui testes de integração para garantir a funcionalidade das APIs.

**Atenção:**
Ao executar os testes, as tabelas do banco de dados são limpas e populadas com dados de teste para garantir um ambiente isolado e determinístico para cada execução. Isso significa que os dados iniciais (seeds) da aplicação serão temporariamente substituídos.

**Recomendação:**
Para uma avaliação completa da aplicação com os dados iniciais, sugerimos que você acesse e explore a aplicação **antes** de rodar os testes.

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

## Testes Automatizados - Cobertura

Os testes de integração do backend cobrem os seguintes cenários essenciais:

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
