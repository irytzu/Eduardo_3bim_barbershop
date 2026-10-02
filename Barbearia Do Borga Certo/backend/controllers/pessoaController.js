const { query } = require('../database');

exports.listarPessoas = async (req, res) => {
    try {
        const result = await query('SELECT * FROM public.pessoa ORDER BY cpf_pessoa');
        res.json({ sucesso: true, pessoas: result.rows });
    } catch (error) {
        console.error('Erro ao listar pessoas:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor.' });
    }
};

exports.obterPessoa = async (req, res) => {
    try {
        const cpf = req.params.id;
        const result = await query('SELECT * FROM public.pessoa WHERE cpf_pessoa = $1', [cpf]);

        if (result.rows.length === 0) {
            return res.status(404).json({ sucesso: false, mensagem: 'Pessoa nao encontrada.' });
        }

        res.json({ sucesso: true, pessoa: result.rows[0] });
    } catch (error) {
        console.error('Erro ao obter pessoa:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor.' });
    }
};

exports.criarPessoa = async (req, res) => {
    try {
        const { cpf_pessoa, nome_pessoa, data_nascimento_pessoa, endereco_pessoa, senha_pessoa, email_pessoa } = req.body;

        if (!cpf_pessoa || !nome_pessoa) {
            return res.status(400).json({ sucesso: false, mensagem: 'CPF e nome sao obrigatorios.' });
        }

        const sql = `
            INSERT INTO public.pessoa (cpf_pessoa, nome_pessoa, data_nascimento_pessoa, endereco_pessoa, senha_pessoa, email_pessoa)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const values = [cpf_pessoa, nome_pessoa, data_nascimento_pessoa || null, endereco_pessoa || null, senha_pessoa || null, email_pessoa || null];

        const result = await query(sql, values);
        res.status(201).json({ sucesso: true, mensagem: 'Pessoa cadastrada com sucesso!', pessoa: result.rows[0] });
    } catch (error) {
        console.error('Erro ao criar pessoa:', error);
        if (error.code === '23505') {
            return res.status(400).json({ sucesso: false, mensagem: 'Ja existe uma pessoa com este CPF.' });
        }
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao inserir pessoa no banco de dados.' });
    }
};

exports.atualizarPessoa = async (req, res) => {
    try {
        const cpf = req.params.id;
        const { nome_pessoa, data_nascimento_pessoa, endereco_pessoa, senha_pessoa, email_pessoa } = req.body;

        const sql = `
            UPDATE public.pessoa
            SET nome_pessoa = $1,
                data_nascimento_pessoa = $2,
                endereco_pessoa = $3,
                senha_pessoa = $4,
                email_pessoa = $5
            WHERE cpf_pessoa = $6
            RETURNING *
        `;
        const values = [nome_pessoa, data_nascimento_pessoa || null, endereco_pessoa || null, senha_pessoa || null, email_pessoa || null, cpf];

        const result = await query(sql, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ sucesso: false, mensagem: 'Pessoa nao encontrada.' });
        }

        res.json({ sucesso: true, mensagem: 'Pessoa alterada com sucesso!', pessoa: result.rows[0] });
    } catch (error) {
        console.error('Erro ao atualizar pessoa:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar pessoa.' });
    }
};

exports.deletarPessoa = async (req, res) => {
    try {
        const cpf = req.params.id;
        await query('DELETE FROM public.pessoa WHERE cpf_pessoa = $1', [cpf]);
        res.json({ sucesso: true, mensagem: 'Pessoa excluida com sucesso!' });
    } catch (error) {
        console.error('Erro ao deletar pessoa:', error);
        if (error.code === '23503') {
            return res.status(400).json({ sucesso: false, mensagem: 'Nao e possivel excluir: esta pessoa e cliente ou funcionario cadastrado.' });
        }
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao excluir pessoa.' });
    }
};