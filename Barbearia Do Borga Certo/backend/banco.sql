-- ============================================
-- BarberShop - Script de Criacao e Carga Inicial
-- Projeto DW1 - 3o Bimestre 2026
-- ============================================

-- ============================================
-- 1. CRIACAO DAS TABELAS (ORDEM CORRETA)
-- ============================================

-- Tabela sem dependencias (independente)
CREATE TABLE public.pessoa (
    cpf_pessoa character varying(20) NOT NULL,
    nome_pessoa character varying(60),
    data_nascimento_pessoa date,
    endereco_pessoa character varying(150),
    senha_pessoa character varying(50),
    email_pessoa character varying(75)
);

-- Tabela sem dependencias (independente)
CREATE TABLE public.cargo (
    id_cargo integer NOT NULL,
    nome_cargo character varying(45)
);

-- Tabela sem dependencias (independente) - CRUD com imagem
CREATE TABLE public.servico (
    id_servico integer NOT NULL,
    nome_servico character varying(60),
    descricao_servico character varying(255),
    duracao_minutos_servico integer,
    preco_servico double precision,
    imagem_servico character varying(100)
);

-- Tabela com relacionamento 1:1 com pessoa
CREATE TABLE public.cliente (
    pessoa_cpf_pessoa character varying(20) NOT NULL,
    data_cadastro_cliente date
);

-- Tabela com relacionamento 1:1 com pessoa e N:1 com cargo
CREATE TABLE public.funcionario (
    pessoa_cpf_pessoa character varying(20) NOT NULL,
    salario_funcionario double precision,
    cargo_id_cargo integer,
    especialidade_funcionario character varying(80),
    foto_funcionario character varying(100)
);

-- Tabela com relacionamento 1:N com cliente e 1:N com funcionario
CREATE TABLE public.agendamento (
    id_agendamento integer NOT NULL,
    data_agendamento date,
    hora_agendamento time without time zone,
    cliente_cpf_pessoa character varying(20),
    funcionario_cpf_pessoa character varying(20),
    status_agendamento character varying(20)
);

-- Tabela associativa N:N entre agendamento e servico
CREATE TABLE public.agendamento_has_servico (
    agendamento_id_agendamento integer NOT NULL,
    servico_id_servico integer NOT NULL,
    preco_cobrado double precision
);

-- ============================================
-- 2. SEQUENCES
-- ============================================

CREATE SEQUENCE public.cargo_id_cargo_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE public.servico_id_servico_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE public.agendamento_id_agendamento_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

ALTER SEQUENCE public.cargo_id_cargo_seq OWNED BY public.cargo.id_cargo;
ALTER SEQUENCE public.servico_id_servico_seq OWNED BY public.servico.id_servico;
ALTER SEQUENCE public.agendamento_id_agendamento_seq OWNED BY public.agendamento.id_agendamento;

ALTER TABLE ONLY public.cargo ALTER COLUMN id_cargo SET DEFAULT nextval('public.cargo_id_cargo_seq'::regclass);
ALTER TABLE ONLY public.servico ALTER COLUMN id_servico SET DEFAULT nextval('public.servico_id_servico_seq'::regclass);
ALTER TABLE ONLY public.agendamento ALTER COLUMN id_agendamento SET DEFAULT nextval('public.agendamento_id_agendamento_seq'::regclass);

-- ============================================
-- 3. CHAVES PRIMARIAS
-- ============================================

ALTER TABLE ONLY public.pessoa ADD CONSTRAINT pessoa_pkey PRIMARY KEY (cpf_pessoa);
ALTER TABLE ONLY public.cargo ADD CONSTRAINT cargo_pkey PRIMARY KEY (id_cargo);
ALTER TABLE ONLY public.servico ADD CONSTRAINT servico_pkey PRIMARY KEY (id_servico);
ALTER TABLE ONLY public.cliente ADD CONSTRAINT cliente_pkey PRIMARY KEY (pessoa_cpf_pessoa);
ALTER TABLE ONLY public.funcionario ADD CONSTRAINT funcionario_pkey PRIMARY KEY (pessoa_cpf_pessoa);
ALTER TABLE ONLY public.agendamento ADD CONSTRAINT agendamento_pkey PRIMARY KEY (id_agendamento);
ALTER TABLE ONLY public.agendamento_has_servico ADD CONSTRAINT agendamento_has_servico_pkey PRIMARY KEY (agendamento_id_agendamento, servico_id_servico);

-- ============================================
-- 4. CHAVES ESTRANGEIRAS
-- ============================================

-- cliente 1:1 pessoa
ALTER TABLE ONLY public.cliente ADD CONSTRAINT fk_cliente_pessoa FOREIGN KEY (pessoa_cpf_pessoa) REFERENCES public.pessoa (cpf_pessoa);

-- funcionario 1:1 pessoa e N:1 cargo
ALTER TABLE ONLY public.funcionario ADD CONSTRAINT fk_funcionario_pessoa FOREIGN KEY (pessoa_cpf_pessoa) REFERENCES public.pessoa (cpf_pessoa);
ALTER TABLE ONLY public.funcionario ADD CONSTRAINT fk_funcionario_cargo FOREIGN KEY (cargo_id_cargo) REFERENCES public.cargo (id_cargo);

-- agendamento 1:N cliente e 1:N funcionario
ALTER TABLE ONLY public.agendamento ADD CONSTRAINT fk_agendamento_cliente FOREIGN KEY (cliente_cpf_pessoa) REFERENCES public.cliente (pessoa_cpf_pessoa);
ALTER TABLE ONLY public.agendamento ADD CONSTRAINT fk_agendamento_funcionario FOREIGN KEY (funcionario_cpf_pessoa) REFERENCES public.funcionario (pessoa_cpf_pessoa);

-- agendamento_has_servico N:N
ALTER TABLE ONLY public.agendamento_has_servico ADD CONSTRAINT fk_ahs_agendamento FOREIGN KEY (agendamento_id_agendamento) REFERENCES public.agendamento (id_agendamento);
ALTER TABLE ONLY public.agendamento_has_servico ADD CONSTRAINT fk_ahs_servico FOREIGN KEY (servico_id_servico) REFERENCES public.servico (id_servico);

-- ============================================
-- 5. CARGA INICIAL (INSERTS)
-- ============================================

-- CARGO (10 registros)
INSERT INTO public.cargo (id_cargo, nome_cargo) VALUES
(1, 'Barbeiro'),
(2, 'Barbeiro Master'),
(3, 'Recepcionista'),
(4, 'Gerente'),
(5, 'Cabeleireiro'),
(6, 'Manicure'),
(7, 'Esteticista'),
(8, 'Auxiliar de Limpeza'),
(9, 'Estagiario'),
(10, 'Assistente Administrativo');

-- SERVICO (10 registros)
-- imagem_servico guarda apenas o NOME do arquivo (ex: 'corte1.png'), que deve
-- estar salvo dentro da pasta imagens/ do projeto
INSERT INTO public.servico (id_servico, nome_servico, descricao_servico, duracao_minutos_servico, preco_servico, imagem_servico) VALUES
(1, 'Corte Social', 'Corte classico com maquina e tesoura', 30, 35.00, 'corte1.png'),
(2, 'Corte Degrade', 'Corte moderno com degrade nas laterais', 40, 45.00, 'corte2.png'),
(3, 'Barba Completa', 'Aparar, desenhar e finalizar com toalha quente', 30, 30.00, 'barba1.png'),
(4, 'Corte + Barba', 'Combo corte e barba completos', 60, 65.00, 'combo1.png'),
(5, 'Sobrancelha', 'Design de sobrancelha na navalha', 15, 15.00, NULL),
(6, 'Pezinho', 'Acabamento de nuca e contorno', 10, 10.00, NULL),
(7, 'Hidratacao Capilar', 'Tratamento de hidratacao profunda', 30, 40.00, NULL),
(8, 'Coloracao', 'Pintura e tratamento de cor', 60, 80.00, NULL),
(9, 'Relaxamento', 'Relaxamento capilar', 50, 70.00, NULL),
(10, 'Platinado', 'Descoloracao e tonalizacao', 90, 120.00, NULL);

-- PESSOA (10 registros: 5 clientes + 5 funcionarios)
INSERT INTO public.pessoa (cpf_pessoa, nome_pessoa, data_nascimento_pessoa, endereco_pessoa, senha_pessoa, email_pessoa) VALUES
('11111111111', 'Joao Silva', '1995-03-12', 'Rua das Flores, 100', 'senha123', 'joao.silva@email.com'),
('22222222222', 'Pedro Santos', '1998-07-25', 'Av. Brasil, 200', 'senha123', 'pedro.santos@email.com'),
('33333333333', 'Lucas Oliveira', '1990-01-15', 'Rua Sao Paulo, 300', 'senha123', 'lucas.oliveira@email.com'),
('44444444444', 'Marcos Souza', '1988-11-30', 'Av. Central, 400', 'senha123', 'marcos.souza@email.com'),
('55555555555', 'Rafael Costa', '2000-05-20', 'Rua Nova, 500', 'senha123', 'rafael.costa@email.com'),
('66666666666', 'Carlos Pereira', '1985-09-10', 'Rua das Palmeiras, 600', 'barber123', 'carlos.pereira@barbershop.com'),
('77777777777', 'Bruno Almeida', '1992-02-18', 'Av. dos Barbeiros, 700', 'barber123', 'bruno.almeida@barbershop.com'),
('88888888888', 'Diego Ferreira', '1997-06-05', 'Rua do Corte, 800', 'barber123', 'diego.ferreira@barbershop.com'),
('99999999999', 'Felipe Rocha', '1993-12-22', 'Av. Principal, 900', 'barber123', 'felipe.rocha@barbershop.com'),
('10101010101', 'Vitor Lima', '1991-04-08', 'Rua da Navalha, 1000', 'barber123', 'vitor.lima@barbershop.com');

-- CLIENTE (10 registros, 1:1 com pessoa)
INSERT INTO public.cliente (pessoa_cpf_pessoa, data_cadastro_cliente) VALUES
('11111111111', '2025-01-10'),
('22222222222', '2025-02-15'),
('33333333333', '2025-03-05'),
('44444444444', '2025-04-20'),
('55555555555', '2025-05-11'),
('66666666666', '2025-06-01'),
('77777777777', '2025-06-15'),
('88888888888', '2025-07-02'),
('99999999999', '2025-07-20'),
('10101010101', '2025-08-01');

-- FUNCIONARIO (10 registros, 1:1 com pessoa, N:1 com cargo)
-- A foto e exibida automaticamente via imagens/funcionario_<CPF>.png (arquivo colocado manualmente)
-- foto_funcionario guarda apenas o NOME do arquivo (ex: 'joao.png'), que deve
-- estar salvo dentro da pasta imagens/ do projeto
INSERT INTO public.funcionario (pessoa_cpf_pessoa, salario_funcionario, cargo_id_cargo, especialidade_funcionario, foto_funcionario) VALUES
('11111111111', 2200.00, 1, 'Cortes classicos', NULL),
('22222222222', 2500.00, 1, 'Degrade', NULL),
('33333333333', 3200.00, 2, 'Barba e navalha', NULL),
('44444444444', 2100.00, 3, 'Atendimento', NULL),
('55555555555', 4500.00, 4, 'Gestao', NULL),
('66666666666', 2300.00, 1, 'Corte infantil', NULL),
('77777777777', 2800.00, 2, 'Coloracao', NULL),
('88888888888', 2000.00, 9, 'Aprendiz geral', NULL),
('99999999999', 2600.00, 5, 'Penteados', NULL),
('10101010101', 1900.00, 10, 'Agenda e financeiro', NULL);

-- AGENDAMENTO (10 registros, 1:N com cliente e funcionario)
INSERT INTO public.agendamento (id_agendamento, data_agendamento, hora_agendamento, cliente_cpf_pessoa, funcionario_cpf_pessoa, status_agendamento) VALUES
(1, '2026-09-10', '09:00', '11111111111', '66666666666', 'concluido'),
(2, '2026-09-10', '10:00', '22222222222', '77777777777', 'concluido'),
(3, '2026-09-11', '11:00', '33333333333', '88888888888', 'concluido'),
(4, '2026-09-12', '14:00', '44444444444', '99999999999', 'concluido'),
(5, '2026-09-15', '15:00', '55555555555', '10101010101', 'concluido'),
(6, '2026-09-20', '09:30', '11111111111', '77777777777', 'agendado'),
(7, '2026-09-21', '10:30', '22222222222', '66666666666', 'agendado'),
(8, '2026-09-22', '13:00', '33333333333', '99999999999', 'agendado'),
(9, '2026-09-23', '16:00', '44444444444', '88888888888', 'cancelado'),
(10, '2026-09-25', '17:00', '55555555555', '10101010101', 'agendado');

-- AGENDAMENTO_HAS_SERVICO (11 registros, N:N)
INSERT INTO public.agendamento_has_servico (agendamento_id_agendamento, servico_id_servico, preco_cobrado) VALUES
(1, 1, 35.00),
(2, 2, 45.00),
(3, 3, 30.00),
(4, 4, 65.00),
(5, 5, 15.00),
(6, 1, 35.00),
(6, 3, 30.00),
(7, 8, 80.00),
(8, 2, 45.00),
(9, 9, 70.00),
(10, 10, 120.00);