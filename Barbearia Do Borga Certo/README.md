# BarberShop &mdash; Sistema de Gestao de Barbearia

Projeto da disciplina **Desenvolvimento Web I (DW1)** &mdash; 3&ordm; Bimestre 2026.
Aplicacao web Cliente/Servidor seguindo o padrao **MVC**, integrada ao **PostgreSQL**, com o tema **Barbearia** (baseada na arquitetura do projeto modelo `candyshop`).

**Aluno(a):** Irytzu (Nome Completo do Aluno)
**Turma:** preencher turma
**Colaborador adicionado:** rjhalmeman@gmail.com

---

## Funcionalidades

- **Servicos**: CRUD completo com upload/exibicao de imagem (cortes, barba, etc).
- **Clientes**: CRUD de clientes (dados pessoais + cadastro de cliente).
- **Funcionarios (Barbeiros)**: CRUD de funcionarios vinculados a um cargo.
- **Cargos**: CRUD simples de cargos da barbearia.
- **Agendamentos**: CRUD de agendamentos, vinculando cliente, barbeiro e os servicos escolhidos.

## Arquitetura

```
Irytzu_3bim_BarberShop/
├── backend/
│   ├── controllers/     # Logica de negocio (Model + parte do Controller)
│   ├── routes/           # Mapeamento dos endpoints (Router)
│   ├── database.js       # Conexao com o PostgreSQL (pg Pool)
│   ├── .env               # Variaveis de ambiente (NAO versionado)
│   └── server.js         # Ponto de entrada da aplicacao Express
├── frontend/
│   ├── common.css        # Estilos base compartilhados (header, nav, footer, formularios)
│   ├── menu/              # Pagina inicial (View)
│   ├── servico/           # CRUD de servicos (com imagem)
│   ├── cliente/           # CRUD de clientes
│   ├── funcionario/       # CRUD de funcionarios
│   ├── cargo/              # CRUD de cargos
│   └── agendamento/       # CRUD de agendamentos
├── imagens/               # Imagens dos servicos (upload)
├── documentacao/
│   ├── barbershop-dump.sql    # DDL + carga inicial (INSERTs)
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
cd Irytzu_3bim_BarberShop
npm install
```

### 3. Criar o banco de dados
Crie um banco chamado `barbershop` no PostgreSQL e execute o script:
```bash
psql -U postgres -d barbershop -f documentacao/barbershop-dump.sql
```
(ou rode o conteudo do arquivo `.sql` direto no pgAdmin / DBeaver)

### 4. Configurar variaveis de ambiente
Copie `backend/.env.example` para `backend/.env` e ajuste usuario/senha do seu PostgreSQL:
```bash
cp backend/.env.example backend/.env
```

### 5. Rodar o servidor
```bash
npm start
```
O servidor sobe em `http://localhost:3001`.

### 6. Abrir a aplicacao
Abra o arquivo `index.html` (recomenda-se usar a extensao Live Server do VS Code) ou acesse diretamente `frontend/menu/menu.html` no navegador.

## Ordem sugerida de testes
1. Cadastrar **Cargos**.
2. Cadastrar **Servicos** (com imagem).
3. Cadastrar **Clientes**.
4. Cadastrar **Funcionarios** (selecionando um cargo).
5. Criar **Agendamentos**, vinculando cliente, barbeiro e um ou mais servicos.

## Tecnologias utilizadas
- **Front-end**: HTML5 semantico, CSS3, JavaScript puro (fetch API)
- **Back-end**: Node.js, Express, Multer, Sharp
- **Banco de Dados**: PostgreSQL (via pacote `pg`)