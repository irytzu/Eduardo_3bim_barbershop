const { query, pool } = require('../database');

exports.listarFuncionarios = async (req, res) => {
    try {
        const result = await query(
            `SELECT f.pessoa_cpf_pessoa, p.nome_pessoa, p.email_pessoa, f.salario_funcionario, f.cargo_id_cargo, c.nome_cargo, f.especialidade_funcionario, f.foto_funcionario
             FROM public.funcionario f
             JOIN public.pessoa p ON f.pessoa_cpf_pessoa = p.cpf_pessoa
             LEFT JOIN public.cargo c ON f.cargo_id_cargo = c.id_cargo
             ORDER BY f.pessoa_cpf_pessoa`
        );
        res.json({ sucesso: true, funcionarios: result.rows });
    } catch (error) {
        console.error('Erro ao listar funcionarios:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor.' });
    }
};

exports.obterFuncionario = async (req, res) => {
    try {
        const cpf = req.params.id;
        const result = await query(
            `SELECT f.pessoa_cpf_pessoa, p.nome_pessoa, p.data_nascimento_pessoa, p.endereco_pessoa, p.senha_pessoa, p.email_pessoa,
                    f.salario_funcionario, f.cargo_id_cargo, f.especialidade_funcionario, f.foto_funcionario
             FROM public.funcionario f
             JOIN public.pessoa p ON f.pessoa_cpf_pessoa = p.cpf_pessoa
             WHERE f.pessoa_cpf_pessoa = $1`,
            [cpf]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ sucesso: false, mensagem: 'Funcionario nao encontrado.' });
        }

        res.json({ sucesso: true, funcionario: result.rows[0] });
    } catch (error) {
        console.error('Erro ao obter funcionario:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor.' });
    }
};

exports.criarFuncionario = async (req, res) => {
    const client = await pool.connect();
    try {
        const { pessoa_cpf_pessoa, nome_pessoa, data_nascimento_pessoa, endereco_pessoa, senha_pessoa, email_pessoa,
                salario_funcionario, cargo_id_cargo, especialidade_funcionario, foto_funcionario } = req.body;

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
            `INSERT INTO public.funcionario (pessoa_cpf_pessoa, salario_funcionario, cargo_id_cargo, especialidade_funcionario, foto_funcionario)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [pessoa_cpf_pessoa, salario_funcionario || 0.0, cargo_id_cargo || null, especialidade_funcionario || null, foto_funcionario || null]
        );

        await client.query('COMMIT');
        res.status(201).json({ sucesso: true, mensagem: 'Funcionario cadastrado com sucesso!', funcionario: result.rows[0] });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erro ao criar funcionario:', error);
        if (error.code === '23505') {
            return res.status(400).json({ sucesso: false, mensagem: 'Ja existe uma pessoa/funcionario com este CPF.' });
        }
        if (error.code === '23503') {
            return res.status(400).json({ sucesso: false, mensagem: 'O cargo informado nao existe no cadastro.' });
        }
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao inserir funcionario no banco de dados.' });
    } finally {
        client.release();
    }
};

exports.atualizarFuncionario = async (req, res) => {
    const client = await pool.connect();
    try {
        const cpf = req.params.id;
        const { nome_pessoa, data_nascimento_pessoa, endereco_pessoa, senha_pessoa, email_pessoa,
                salario_funcionario, cargo_id_cargo, especialidade_funcionario, foto_funcionario } = req.body;

        await client.query('BEGIN');

        await client.query(
            `UPDATE public.pessoa
             SET nome_pessoa = $1, data_nascimento_pessoa = $2, endereco_pessoa = $3, senha_pessoa = $4, email_pessoa = $5
             WHERE cpf_pessoa = $6`,
            [nome_pessoa, data_nascimento_pessoa || null, endereco_pessoa || null, senha_pessoa || null, email_pessoa || null, cpf]
        );

        const result = await client.query(
            `UPDATE public.funcionario
             SET salario_funcionario = $1, cargo_id_cargo = $2, especialidade_funcionario = $3, foto_funcionario = $4
             WHERE pessoa_cpf_pessoa = $5 RETURNING *`,
            [salario_funcionario || 0.0, cargo_id_cargo || null, especialidade_funcionario || null, foto_funcionario || null, cpf]
        );

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ sucesso: false, mensagem: 'Funcionario nao encontrado.' });
        }

        await client.query('COMMIT');
        res.json({ sucesso: true, mensagem: 'Funcionario alterado com sucesso!', funcionario: result.rows[0] });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erro ao atualizar funcionario:', error);
        if (error.code === '23503') {
            return res.status(400).json({ sucesso: false, mensagem: 'O cargo informado nao existe no cadastro.' });
        }
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar funcionario.' });
    } finally {
        client.release();
    }
};

exports.deletarFuncionario = async (req, res) => {
    try {
        const cpf = req.params.id;
        await query('DELETE FROM public.funcionario WHERE pessoa_cpf_pessoa = $1', [cpf]);
        res.json({ sucesso: true, mensagem: 'Funcionario excluido com sucesso!' });
    } catch (error) {
        console.error('Erro ao deletar funcionario:', error);
        if (error.code === '23503') {
            return res.status(400).json({ sucesso: false, mensagem: 'Nao e possivel excluir: existem agendamentos vinculados a este funcionario.' });
        }
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao excluir funcionario.' });
    }
};