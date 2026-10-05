const { query } = require('../database');

// Listar todos os servicos
exports.listarServicos = async (req, res) => {
    try {
        const result = await query('SELECT * FROM public.servico ORDER BY id_servico');
        res.json({ sucesso: true, servicos: result.rows });
    } catch (error) {
        console.error('Erro ao listar servicos:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao listar servicos.' });
    }
};

// Obter servico por ID
exports.obterServico = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ sucesso: false, mensagem: 'ID invalido.' });
        }

        const result = await query('SELECT * FROM public.servico WHERE id_servico = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ sucesso: false, mensagem: 'Servico nao encontrado.' });
        }

        res.json({ sucesso: true, servico: result.rows[0] });
    } catch (error) {
        console.error('Erro ao obter servico:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor.' });
    }
};

// Criar servico
exports.criarServico = async (req, res) => {
    try {
        const { id_servico, nome_servico, descricao_servico, duracao_minutos_servico, preco_servico, imagem_servico } = req.body;

        if (!nome_servico) {
            return res.status(400).json({ sucesso: false, mensagem: 'O nome do servico e obrigatorio.' });
        }

        const sql = `
            INSERT INTO public.servico (id_servico, nome_servico, descricao_servico, duracao_minutos_servico, preco_servico, imagem_servico)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const values = [
            id_servico,
            nome_servico,
            descricao_servico || null,
            duracao_minutos_servico || 30,
            preco_servico || 0.0,
            imagem_servico || null
        ];

        const result = await query(sql, values);
        res.status(201).json({ sucesso: true, mensagem: 'Servico inserido com sucesso!', servico: result.rows[0] });
    } catch (error) {
        console.error('Erro ao criar servico:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao inserir servico no banco de dados.' });
    }
};

// Atualizar servico
exports.atualizarServico = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { nome_servico, descricao_servico, duracao_minutos_servico, preco_servico, imagem_servico } = req.body;

        const sql = `
            UPDATE public.servico
            SET nome_servico = $1,
                descricao_servico = $2,
                duracao_minutos_servico = $3,
                preco_servico = $4,
                imagem_servico = $5
            WHERE id_servico = $6
            RETURNING *
        `;
        const values = [
            nome_servico,
            descricao_servico || null,
            duracao_minutos_servico || 30,
            preco_servico || 0.0,
            imagem_servico || null,
            id
        ];

        const result = await query(sql, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ sucesso: false, mensagem: 'Servico nao encontrado.' });
        }

        res.json({ sucesso: true, mensagem: 'Servico alterado com sucesso!', servico: result.rows[0] });
    } catch (error) {
        console.error('Erro ao atualizar servico:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar servico.' });
    }
};

// Deletar servico
exports.deletarServico = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);

        // Observacao: o arquivo de imagem na pasta imagens/ NAO e apagado
        // automaticamente, pois o mesmo arquivo pode estar sendo usado por
        // outro servico. Apague manualmente se quiser.
        await query('DELETE FROM public.servico WHERE id_servico = $1', [id]);

        res.json({ sucesso: true, mensagem: 'Servico excluido com sucesso!' });
    } catch (error) {
        console.error('Erro ao deletar servico:', error);
        if (error.code === '23503') {
            return res.status(400).json({ sucesso: false, mensagem: 'Nao e possivel excluir: existem agendamentos com este servico.' });
        }
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao excluir servico.' });
    }
};