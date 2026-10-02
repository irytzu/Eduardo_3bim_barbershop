# BarberShop &mdash; Sistema de Gestao de Barbearia

Projeto da disciplina **Desenvolvimento Web I (DW1)** &mdash; 3&ordm; Bimestre 2026.
Aplicacao web Cliente/Servidor seguindo o padrao **MVC**, integrada ao **PostgreSQL**, com o tema **Barbearia** (baseada na arquitetura do projeto modelo `candyshop`).

**Aluno(a):** >>> Eduardo Barzotto Iritsu <<<
**Turma:** >>> M32 <<<
**Colaborador adicionado:** rjhalmeman@gmail.com

---

## Funcionalidades

- **Servicos**: CRUD completo, com imagem fixa (arquivo `servico_ID.png` salvo manualmente em `imagens/`).
- **Clientes**: CRUD de clientes (dados pessoais + cadastro de cliente).
- **Funcionarios (Barbeiros)**: CRUD de funcionarios vinculados a um cargo, com foto fixa (arquivo `funcionario_CPF.png` em `imagens/`).
- **Cargos**: CRUD simples de cargos da barbearia.
- **Agendamentos**: CRUD de agendamentos, vinculando cliente, barbeiro e os servicos escolhidos.

## Arquitetura

```
Barbearia Do Borga Certo/
├── backend/
│   ├── controllers/     # Logica de negocio (Model + parte do Controller)
│   ├── routes/           # Mapeamento dos endpoints (Router)
│   ├── database.js       # Conexao com o PostgreSQL (pg Pool)
│   ├── banco.sql           # DDL + carga inicial (INSERTs)
│   ├── .env               # Variaveis de ambiente (NAO versionado)
│   └── server.js         # Ponto de entrada da aplicacao Express
├── frontend/
│   ├── common.css        # Estilos base compartilhados (header, nav, footer, formularios)
│   ├── menu/              # Pagina inicial (View)
│   ├── servico/           # CRUD de servicos (com imagem)
│   ├── cliente/           # CRUD de clientes
│   ├── funcionario/       # CRUD de funcionarios (com foto)
│   ├── cargo/              # CRUD de cargos
│   └── agendamento/       # CRUD de agendamentos
├── imagens/               # Imagens fixas de servicos e funcionarios
├── documentacao/
│   └── der-barbershop.png     # Diagrama Entidade-Relacionamento
├── index.html             # Redireciona para o menu
├── package.json
└── .gitignore
```

## Modelagem de Dados

- **pessoa**: tabela base (CPF como chave primaria).
- **cargo**: tabela independente (cargos da barbearia).
- **servico**: tabela independente (servicos oferecidos, com imagem).
- **cliente**: relacionamento **1:1** com `pessoa`.
- **funcionario**: relacionamento **1:1** com `pessoa` e **N:1** com `cargo`.
- **agendamento**: relacionamento **1:N** com `cliente` e **1:N** com `funcionario`.
- **agendamento_has_servico**: tabela associativa **N:N** entre `agendamento` e `servico`.

Veja o diagrama completo em [`documentacao/der-barbershop.png`](./documentacao/der-barbershop.png).

## Como executar

### 1. Pre-requisitos
- Node.js instalado
- PostgreSQL instalado e em execucao

### 2. Clonar e instalar dependencias
```bash
git clone <URL_DO_SEU_REPOSITORIO>
cd "Barbearia Do Borga Certo"
npm install
```

### 3. Criar o banco de dados
Crie um banco chamado `barbershop` no PostgreSQL e execute o script:
```bash
psql -U postgres -d barbershop -f backend/banco.sql
```
(ou rode o conteudo do arquivo `.sql` direto no pgAdmin / DBeaver)

### 4. Configurar variaveis de ambiente
Crie o arquivo `backend/.env` com o seguinte conteudo, ajustando usuario/senha do seu PostgreSQL:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=barbershop
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui
PORT=3001
```

### 5. Rodar o servidor
```bash
npm start
```
O servidor sobe em `http://localhost:3001`.

### 6. Abrir a aplicacao
Abra o arquivo `index.html` (recomenda-se usar a extensao Live Server do VS Code) ou acesse diretamente `frontend/menu/menu.html` no navegador.

## Como adicionar fotos (servicos e funcionarios)
As imagens sao fixas, sem upload pela interface. Para aparecerem no site, basta salvar o arquivo com o nome certo dentro da pasta `imagens/`:
- Servico de ID 1 &rarr; `imagens/servico_1.png`
- Funcionario de CPF 11111111111 &rarr; `imagens/funcionario_11111111111.png`

Se o arquivo nao existir, a pagina mostra uma silhueta padrao no lugar.

## Ordem sugerida de testes
1. Cadastrar **Cargos**.
2. Cadastrar **Servicos** (e colocar a imagem na pasta `imagens/`).
3. Cadastrar **Clientes**.
4. Cadastrar **Funcionarios** (selecionando um cargo, e colocando a foto na pasta `imagens/`).
5. Criar **Agendamentos**, vinculando cliente, barbeiro e um ou mais servicos.

## Tecnologias utilizadas
- **Front-end**: HTML5 semantico, CSS3, JavaScript puro (fetch API)
- **Back-end**: Node.js, Express, pg (driver PostgreSQL), dotenv, cors
- **Banco de Dados**: PostgreSQL