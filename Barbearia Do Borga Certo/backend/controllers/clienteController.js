const { query } = require('../database');

// Lista clientes trazendo o nome da pessoa (join 1:1)
exports.listarClientes = async (req, res) => {
    try {
        const result = await query(
            `SELECT c.pessoa_cpf_pessoa, p.nome_pessoa, p.email_pessoa, c.data_cadastro_cliente
             FROM public.cliente c
             JOIN public.pessoa p ON c.pessoa_cpf_pessoa = p.cpf_pessoa
             ORDER BY c.pessoa_cpf_pessoa`
        );
        res.json({ sucesso: true, clientes: result.rows });
    } catch (error) {
        console.error('Erro ao listar clientes:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor.' });
    }
};

exports.obterCliente = async (req, res) => {
    try {
        const cpf = req.params.id;
        const result = await query(
            `SELECT c.pessoa_cpf_pessoa, p.nome_pessoa, p.data_nascimento_pessoa, p.endereco_pessoa, p.senha_pessoa, p.email_pessoa, c.data_cadastro_cliente
             FROM public.cliente c
             JOIN public.pessoa p ON c.pessoa_cpf_pessoa = p.cpf_pessoa
             WHERE c.pessoa_cpf_pessoa = $1`,
            [cpf]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ sucesso: false, mensagem: 'Cliente nao encontrado.' });
        }

        res.json({ sucesso: true, cliente: result.rows[0] });
    } catch (error) {
        console.error('Erro ao obter cliente:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor.' });
    }
};

// Cria a pessoa e o cliente juntos (1:1), numa transacao
exports.criarCliente = async (req, res) => {
    const { pool } = require('../database');
    const client = await pool.connect();
    try {
        const { pessoa_cpf_pessoa, nome_pessoa, data_nascimento_pessoa, endereco_pessoa, senha_pessoa, email_pessoa, data_cadastro_cliente } = req.body;

        if (!pessoa_cpf_pessoa || !nome_pessoa) {
            return res.status(400).json({ sucesso: false, mensagem: 'CPF e nome sao obrigatorios.' });
        }

        await client.query('BEGIN');

        await client.query(
            `INSERT INTO public.pessoa (cpf_pessoa, nome_pessoa, data_nascimento_pessoa, endereco_pessoa, senha_pessoa, email_pessoa)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [pessoa_cpf_pessoa, nome_pessoa, data_nascimento_pessoa || null, endereco_pessoa || null, senha_pessoa || null, email_pessoa || null]
        );

        const result = await client.query(
            `INSERT INTO public.cliente (pessoa_cpf_pessoa, data_cadastro_cliente)
             VALUES ($1, $2) RETURNING *`,
            [pessoa_cpf_pessoa, data_cadastro_cliente || new Date()]
        );

        await client.query('COMMIT');
        res.status(201).json({ sucesso: true, mensagem: 'Cliente cadastrado com sucesso!', cliente: result.rows[0] });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erro ao criar cliente:', error);
        if (error.code === '23505') {
            return res.status(400).json({ sucesso: false, mensagem: 'Ja existe uma pessoa/cliente com este CPF.' });
        }
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao inserir cliente no banco de dados.' });
    } finally {
        client.release();
    }
};

// Atualiza dados da pessoa e do cliente juntos
exports.atualizarCliente = async (req, res) => {
    const { pool } = require('../database');
    const client = await pool.connect();
    try {
        const cpf = req.params.id;
        const { nome_pessoa, data_nascimento_pessoa, endereco_pessoa, senha_pessoa, email_pessoa, data_cadastro_cliente } = req.body;

        await client.query('BEGIN');

        await client.query(
            `UPDATE public.pessoa
             SET nome_pessoa = $1, data_nascimento_pessoa = $2, endereco_pessoa = $3, senha_pessoa = $4, email_pessoa = $5
             WHERE cpf_pessoa = $6`,
            [nome_pessoa, data_nascimento_pessoa || null, endereco_pessoa || null, senha_pessoa || null, email_pessoa || null, cpf]
        );

        const result = await client.query(
            `UPDATE public.cliente SET data_cadastro_cliente = $1 WHERE pessoa_cpf_pessoa = $2 RETURNING *`,
            [data_cadastro_cliente || null, cpf]
        );

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ sucesso: false, mensagem: 'Cliente nao encontrado.' });
        }

        await client.query('COMMIT');
        res.json({ sucesso: true, mensagem: 'Cliente alterado com sucesso!', cliente: result.rows[0] });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erro ao atualizar cliente:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar cliente.' });
    } finally {
        client.release();
    }
};

exports.deletarCliente = async (req, res) => {
    try {
        const cpf = req.params.id;
        await query('DELETE FROM public.cliente WHERE pessoa_cpf_pessoa = $1', [cpf]);
        res.json({ sucesso: true, mensagem: 'Cliente excluido com sucesso!' });
    } catch (error) {
        console.error('Erro ao deletar cliente:', error);
        if (error.code === '23503') {
            return res.status(400).json({ sucesso: false, mensagem: 'Nao e possivel excluir: existem agendamentos vinculados a este cliente.' });
        }
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao excluir cliente.' });
    }
};