const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Importa a funcao de consulta do banco
const { query } = require('./database');

// Importa as rotas
const pessoaRoutes = require('./routes/pessoaRoutes');
const cargoRoutes = require('./routes/cargoRoutes');
const servicoRoutes = require('./routes/servicoRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Servir imagens estaticas
app.use('/imagens', express.static(path.join(__dirname, '../imagens')));

// Definir Rotas
// clienteRoutes e funcionarioRoutes dependem de pessoa, por isso vem antes
const clienteRoutes = require('./routes/clienteRoutes');
app.use('/cliente', clienteRoutes);

const funcionarioRoutes = require('./routes/funcionarioRoutes');
app.use('/funcionario', funcionarioRoutes);

app.use('/pessoa', pessoaRoutes);
app.use('/cargo', cargoRoutes);
app.use('/servico', servicoRoutes);

// agendamentoRoutes depende de cliente, funcionario e servico, por isso vem por ultimo
const agendamentoRoutes = require('./routes/agendamentoRoutes');
app.use('/agendamento', agendamentoRoutes);

const PORT = process.env.PORT || 3001;

// Inicializa o servidor e testa o PostgreSQL
app.listen(PORT, async () => {
    console.log(`\n=================================`);
    console.log(`Servidor BarberShop executando na porta ${PORT}`);

    try {
        await query('SELECT 1');
        console.log(`Banco de Dados ${process.env.DB_NAME} conectado com sucesso!`);
    } catch (error) {
        console.error(`FALHA NA CONEXAO COM O BANCO DE DADOS:`);
        console.error(`   Motivo: ${error.message}`);
        console.error(`Ajuste o arquivo backend/.env com os dados corretos do seu PostgreSQL.`);
    }
    console.log(`=================================\n`);
});