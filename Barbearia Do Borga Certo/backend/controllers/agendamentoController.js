const { query, pool } = require('../database');

// Lista agendamentos trazendo nome do cliente e do funcionario (join com pessoa)
exports.listarAgendamentos = async (req, res) => {
    try {
        const result = await query(
            `SELECT a.id_agendamento, a.data_agendamento, a.hora_agendamento, a.status_agendamento,
                    a.cliente_cpf_pessoa, pc.nome_pessoa AS nome_cliente,
                    a.funcionario_cpf_pessoa, pf.nome_pessoa AS nome_funcionario
             FROM public.agendamento a
             JOIN public.pessoa pc ON a.cliente_cpf_pessoa = pc.cpf_pessoa
             JOIN public.pessoa pf ON a.funcionario_cpf_pessoa = pf.cpf_pessoa
             ORDER BY a.data_agendamento DESC, a.hora_agendamento DESC`
        );
        res.json({ sucesso: true, agendamentos: result.rows });
    } catch (error) {
        console.error('Erro ao listar agendamentos:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor.' });
    }
};

exports.obterAgendamento = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ sucesso: false, mensagem: 'ID invalido.' });
        }

        const agendamentoResult = await query('SELECT * FROM public.agendamento WHERE id_agendamento = $1', [id]);
        if (agendamentoResult.rows.length === 0) {
            return res.status(404).json({ sucesso: false, mensagem: 'Agendamento nao encontrado.' });
        }

        const servicosResult = await query(
            `SELECT ahs.servico_id_servico, s.nome_servico, ahs.preco_cobrado
             FROM public.agendamento_has_servico ahs
             JOIN public.servico s ON ahs.servico_id_servico = s.id_servico
             WHERE ahs.agendamento_id_agendamento = $1`,
            [id]
        );

        res.json({ sucesso: true, agendamento: agendamentoResult.rows[0], servicos: servicosResult.rows });
    } catch (error) {
        console.error('Erro ao obter agendamento:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor.' });
    }
};

// Cria o agendamento e, opcionalmente, os servicos vinculados (N:N)
exports.criarAgendamento = async (req, res) => {
    const client = await pool.connect();
    try {
        const { id_agendamento, data_agendamento, hora_agendamento, cliente_cpf_pessoa, funcionario_cpf_pessoa,
                status_agendamento, servicos } = req.body;

        if (!data_agendamento || !cliente_cpf_pessoa || !funcionario_cpf_pessoa) {
            return res.status(400).json({ sucesso: false, mensagem: 'Data, cliente e funcionario sao obrigatorios.' });
        }

        await client.query('BEGIN');

        const sql = `
            INSERT INTO public.agendamento (id_agendamento, data_agendamento, hora_agendamento, cliente_cpf_pessoa, funcionario_cpf_pessoa, status_agendamento)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const values = [
            id_agendamento,
            data_agendamento,
            hora_agendamento || null,
            cliente_cpf_pessoa,
            funcionario_cpf_pessoa,
            status_agendamento || 'agendado'
        ];

        const result = await client.query(sql, values);
        const novoId = result.rows[0].id_agendamento;

        if (Array.isArray(servicos)) {
            for (const item of servicos) {
                await client.query(
                    `INSERT INTO public.agendamento_has_servico (agendamento_id_agendamento, servico_id_servico, preco_cobrado)
                     VALUES ($1, $2, $3)`,
                    [novoId, item.id_servico, item.preco_cobrado || 0.0]
                );
            }
        }

        await client.query('COMMIT');
        res.status(201).json({ sucesso: true, mensagem: 'Agendamento criado com sucesso!', agendamento: result.rows[0] });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erro ao criar agendamento:', error);
        if (error.code === '23503') {
            return res.status(400).json({ sucesso: false, mensagem: 'Cliente, funcionario ou servico informado nao existe no cadastro.' });
        }
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao inserir agendamento no banco de dados.' });
    } finally {
        client.release();
    }
};

exports.atualizarAgendamento = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { data_agendamento, hora_agendamento, cliente_cpf_pessoa, funcionario_cpf_pessoa, status_agendamento } = req.body;

        const sql = `
            UPDATE public.agendamento
            SET data_agendamento = $1,
                hora_agendamento = $2,
                cliente_cpf_pessoa = $3,
                funcionario_cpf_pessoa = $4,
                status_agendamento = $5
            WHERE id_agendamento = $6
            RETURNING *
        `;
        const values = [data_agendamento, hora_agendamento || null, cliente_cpf_pessoa, funcionario_cpf_pessoa, status_agendamento || 'agendado', id];

        const result = await query(sql, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ sucesso: false, mensagem: 'Agendamento nao encontrado.' });
        }

        res.json({ sucesso: true, mensagem: 'Agendamento alterado com sucesso!', agendamento: result.rows[0] });
    } catch (error) {
        console.error('Erro ao atualizar agendamento:', error);
        if (error.code === '23503') {
            return res.status(400).json({ sucesso: false, mensagem: 'Cliente ou funcionario informado nao existe no cadastro.' });
        }
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar agendamento.' });
    }
};

exports.deletarAgendamento = async (req, res) => {
    const client = await pool.connect();
    try {
        const id = parseInt(req.params.id, 10);

        await client.query('BEGIN');
        await client.query('DELETE FROM public.agendamento_has_servico WHERE agendamento_id_agendamento = $1', [id]);
        await client.query('DELETE FROM public.agendamento WHERE id_agendamento = $1', [id]);
        await client.query('COMMIT');

        res.json({ sucesso: true, mensagem: 'Agendamento excluido com sucesso!' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erro ao deletar agendamento:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao excluir agendamento.' });
    } finally {
        client.release();
    }
};