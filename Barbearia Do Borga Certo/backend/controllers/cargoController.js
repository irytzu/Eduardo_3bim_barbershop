const { query } = require('../database');

exports.listarCargos = async (req, res) => {
    try {
        const result = await query('SELECT * FROM public.cargo ORDER BY id_cargo');
        res.json({ sucesso: true, cargos: result.rows });
    } catch (error) {
        console.error('Erro ao listar cargos:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor.' });
    }
};

exports.obterCargo = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ sucesso: false, mensagem: 'ID invalido.' });
        }

        const result = await query('SELECT * FROM public.cargo WHERE id_cargo = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ sucesso: false, mensagem: 'Cargo nao encontrado.' });
        }

        res.json({ sucesso: true, cargo: result.rows[0] });
    } catch (error) {
        console.error('Erro ao obter cargo:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor.' });
    }
};

exports.criarCargo = async (req, res) => {
    try {
        const { id_cargo, nome_cargo } = req.body;

        if (!nome_cargo) {
            return res.status(400).json({ sucesso: false, mensagem: 'O nome do cargo e obrigatorio.' });
        }

        const sql = `
            INSERT INTO public.cargo (id_cargo, nome_cargo)
            VALUES ($1, $2)
            RETURNING *
        `;
        const values = [id_cargo, nome_cargo];

        const result = await query(sql, values);
        res.status(201).json({ sucesso: true, mensagem: 'Cargo inserido com sucesso!', cargo: result.rows[0] });
    } catch (error) {
        console.error('Erro ao criar cargo:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao inserir cargo no banco de dados.' });
    }
};

exports.atualizarCargo = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { nome_cargo } = req.body;

        const sql = `
            UPDATE public.cargo
            SET nome_cargo = $1
            WHERE id_cargo = $2
            RETURNING *
        `;
        const values = [nome_cargo, id];

        const result = await query(sql, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ sucesso: false, mensagem: 'Cargo nao encontrado.' });
        }

        res.json({ sucesso: true, mensagem: 'Cargo alterado com sucesso!', cargo: result.rows[0] });
    } catch (error) {
        console.error('Erro ao atualizar cargo:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar cargo.' });
    }
};

exports.deletarCargo = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        await query('DELETE FROM public.cargo WHERE id_cargo = $1', [id]);
        res.json({ sucesso: true, mensagem: 'Cargo excluido com sucesso!' });
    } catch (error) {
        console.error('Erro ao deletar cargo:', error);
        if (error.code === '23503') {
            return res.status(400).json({ sucesso: false, mensagem: 'Nao e possivel excluir: existem funcionarios com este cargo.' });
        }
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao excluir cargo.' });
    }
};