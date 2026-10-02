const URL_API = 'http://localhost:3001';

let oQueEstaFazendo = '';
let agendamento = null;
let servicosDoCache = [];
let servicosSelecionados = []; // { id_servico, nome_servico, preco_cobrado }

bloquearAtributos(true);

async function inicializar() {
    await carregarClientes();
    await carregarFuncionarios();
    await carregarServicos();
    await listar();
}

async function carregarClientes() {
    const select = document.getElementById("selectCliente");
    try {
        const resposta = await fetch(`${URL_API}/cliente/listar`);
        const data = await resposta.json();
        if (data.sucesso) {
            select.innerHTML = '<option value="">-- Selecione um Cliente --</option>';
            data.clientes.forEach(c => {
                select.innerHTML += `<option value="${c.pessoa_cpf_pessoa}">${c.nome_pessoa} (${c.pessoa_cpf_pessoa})</option>`;
            });
        }
    } catch (erro) {
        select.innerHTML = '<option value="">Erro ao carregar clientes</option>';
    }
}

async function carregarFuncionarios() {
    const select = document.getElementById("selectFuncionario");
    try {
        const resposta = await fetch(`${URL_API}/funcionario/listar`);
        const data = await resposta.json();
        if (data.sucesso) {
            select.innerHTML = '<option value="">-- Selecione um Barbeiro --</option>';
            data.funcionarios.forEach(f => {
                select.innerHTML += `<option value="${f.pessoa_cpf_pessoa}">${f.nome_pessoa} (${f.pessoa_cpf_pessoa})</option>`;
            });
        }
    } catch (erro) {
        select.innerHTML = '<option value="">Erro ao carregar barbeiros</option>';
    }
}

async function carregarServicos() {
    const select = document.getElementById("selectServicoParaAdicionar");
    try {
        const resposta = await fetch(`${URL_API}/servico/listar`);
        const data = await resposta.json();
        if (data.sucesso) {
            servicosDoCache = data.servicos;
            select.innerHTML = '<option value="">-- Selecione um Servico --</option>';
            data.servicos.forEach(s => {
                select.innerHTML += `<option value="${s.id_servico}">${s.nome_servico} - R$ ${parseFloat(s.preco_servico).toFixed(2)}</option>`;
            });
        }
    } catch (erro) {
        select.innerHTML = '<option value="">Erro ao carregar servicos</option>';
    }
}

function adicionarServico() {
    const select = document.getElementById("selectServicoParaAdicionar");
    const id_servico = select.value;
    if (!id_servico) return;

    const servico = servicosDoCache.find(s => String(s.id_servico) === String(id_servico));
    if (!servico) return;

    if (servicosSelecionados.some(s => String(s.id_servico) === String(id_servico))) {
        mostrarAviso("Este servico ja foi adicionado.");
        return;
    }

    servicosSelecionados.push({ id_servico: servico.id_servico, nome_servico: servico.nome_servico, preco_cobrado: servico.preco_servico });
    renderizarServicosSelecionados();
}

function removerServico(id_servico) {
    servicosSelecionados = servicosSelecionados.filter(s => String(s.id_servico) !== String(id_servico));
    renderizarServicosSelecionados();
}

function renderizarServicosSelecionados() {
    const lista = document.getElementById("listaServicosSelecionados");
    lista.innerHTML = "";
    servicosSelecionados.forEach(s => {
        const li = document.createElement("li");
        li.innerHTML = `<span>${s.nome_servico} - R$ ${parseFloat(s.preco_cobrado).toFixed(2)}</span>`;
        const btn = document.createElement("button");
        btn.textContent = "x";
        btn.onclick = () => removerServico(s.id_servico);
        li.appendChild(btn);
        lista.appendChild(li);
    });
}

async function procurePorChavePrimaria(chave) {
    try {
        const resposta = await fetch(`${URL_API}/agendamento/${chave}`);
        const data = await resposta.json();
        return data.sucesso ? data : null;
    } catch (erro) {
        return null;
    }
}

async function procure() {
    const id_agendamento = document.getElementById("inputId_agendamento").value;
    if (isNaN(id_agendamento) || !Number.isInteger(Number(id_agendamento)) || id_agendamento === "") {
        mostrarAviso("Precisa ser um numero inteiro");
        return;
    }

    const resultado = await procurePorChavePrimaria(id_agendamento);
    oQueEstaFazendo = '';

    if (resultado) {
        agendamento = resultado.agendamento;
        servicosSelecionados = resultado.servicos.map(s => ({ id_servico: s.servico_id_servico, nome_servico: s.nome_servico, preco_cobrado: s.preco_cobrado }));
        mostrarDadosAgendamento(agendamento);
        renderizarServicosSelecionados();
        visibilidadeDosBotoes('inline', 'none', 'inline', 'inline', 'none', 'none');
        mostrarAviso("Achou no banco, pode alterar ou excluir");
    } else {
        limparAtributos();
        visibilidadeDosBotoes('inline', 'inline', 'none', 'none', 'none', 'inline');
        mostrarAviso("Nao achou no banco, pode inserir");
    }
}

function inserir() {
    bloquearAtributos(false);
    visibilidadeDosBotoes('none', 'none', 'none', 'none', 'inline', 'inline');
    oQueEstaFazendo = 'inserindo';
    mostrarAviso("INSERINDO - Preencha os dados, adicione servicos e clique em salvar");
}

function alterar() {
    bloquearAtributos(false);
    visibilidadeDosBotoes('none', 'none', 'none', 'none', 'inline', 'none');
    oQueEstaFazendo = 'alterando';
    mostrarAviso("ALTERANDO - Altere os dados e clique em salvar (a lista de servicos nao e alterada aqui)");
}

function excluir() {
    bloquearAtributos(true);
    visibilidadeDosBotoes('none', 'none', 'none', 'none', 'inline', 'none');
    oQueEstaFazendo = 'excluindo';
    mostrarAviso("EXCLUINDO - Clique em salvar para confirmar a exclusao");
}

async function salvar() {
    let id_agendamento = document.getElementById("inputId_agendamento").value;
    const data_agendamento = document.getElementById("inputData").value;
    const hora_agendamento = document.getElementById("inputHora").value;
    const cliente_cpf_pessoa = document.getElementById("selectCliente").value;
    const funcionario_cpf_pessoa = document.getElementById("selectFuncionario").value;
    const status_agendamento = document.getElementById("selectStatus").value;

    const dados = { id_agendamento, data_agendamento, hora_agendamento, cliente_cpf_pessoa, funcionario_cpf_pessoa, status_agendamento, servicos: servicosSelecionados };

    try {
        let resposta;
        if (oQueEstaFazendo === 'inserindo') {
            resposta = await fetch(`${URL_API}/agendamento`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dados) });
        } else if (oQueEstaFazendo === 'alterando') {
            resposta = await fetch(`${URL_API}/agendamento/${id_agendamento}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dados) });
        } else if (oQueEstaFazendo === 'excluindo') {
            resposta = await fetch(`${URL_API}/agendamento/${id_agendamento}`, { method: 'DELETE' });
        }

        const data = await resposta.json();

        if (!data.sucesso) {
            mostrarAviso("ERRO: " + data.mensagem);
            return;
        }

        mostrarAviso(data.mensagem);
        visibilidadeDosBotoes('inline', 'none', 'none', 'none', 'none', 'none');
        limparAtributos();
        document.getElementById("inputId_agendamento").value = "";
        listar();
    } catch (erro) {
        mostrarAviso("Erro ao efetuar operacao no servidor. Verifique se o servidor (npm start) esta rodando.");
    }
}

async function listar() {
    try {
        const resposta = await fetch(`${URL_API}/agendamento/listar`);
        const data = await resposta.json();
        if (data.sucesso) {
            let texto = "<table><tr><th>ID</th><th>Data</th><th>Hora</th><th>Cliente</th><th>Barbeiro</th><th>Status</th></tr>";
            for (let linha of data.agendamentos) {
                const dataFmt = linha.data_agendamento ? new Date(linha.data_agendamento).toLocaleDateString('pt-BR') : '-';
                texto += `<tr><td>${linha.id_agendamento}</td><td>${dataFmt}</td><td>${linha.hora_agendamento || '-'}</td><td>${linha.nome_cliente}</td><td>${linha.nome_funcionario}</td><td>${linha.status_agendamento}</td></tr>`;
            }
            texto += "</table>";
            document.getElementById("outputSaida").innerHTML = data.agendamentos.length ? texto : "Nenhum agendamento cadastrado.";
        }
    } catch (erro) {
        document.getElementById("outputSaida").innerHTML = "Servidor offline.";
    }
}

function cancelarOperacao() {
    limparAtributos();
    bloquearAtributos(true);
    visibilidadeDosBotoes('inline', 'none', 'none', 'none', 'none', 'none');
    mostrarAviso("Cancelou a operacao");
}

function mostrarAviso(mensagem) {
    document.getElementById("divAviso").innerHTML = mensagem;
}

function mostrarDadosAgendamento(a) {
    document.getElementById("inputId_agendamento").value = a.id_agendamento;
    document.getElementById("inputData").value = a.data_agendamento ? a.data_agendamento.substring(0, 10) : '';
    document.getElementById("inputHora").value = a.hora_agendamento ? a.hora_agendamento.substring(0, 5) : '';
    document.getElementById("selectCliente").value = a.cliente_cpf_pessoa;
    document.getElementById("selectFuncionario").value = a.funcionario_cpf_pessoa;
    document.getElementById("selectStatus").value = a.status_agendamento || 'agendado';
    bloquearAtributos(true);
}

function limparAtributos() {
    agendamento = null;
    oQueEstaFazendo = '';
    servicosSelecionados = [];
    renderizarServicosSelecionados();
    document.getElementById("inputData").value = "";
    document.getElementById("inputHora").value = "";
    document.getElementById("selectCliente").value = "";
    document.getElementById("selectFuncionario").value = "";
    document.getElementById("selectStatus").value = "agendado";
    bloquearAtributos(true);
}

function bloquearAtributos(soLeitura) {
    document.getElementById("inputId_agendamento").readOnly = !soLeitura;
    document.getElementById("inputData").readOnly = soLeitura;
    document.getElementById("inputHora").readOnly = soLeitura;
    document.getElementById("selectCliente").disabled = soLeitura;
    document.getElementById("selectFuncionario").disabled = soLeitura;
    document.getElementById("selectStatus").disabled = soLeitura;
    document.getElementById("selectServicoParaAdicionar").disabled = soLeitura;
}

function visibilidadeDosBotoes(btP, btI, btA, btE, btS, btAdd) {
    document.getElementById("btProcure").style.display = btP;
    document.getElementById("btInserir").style.display = btI;
    document.getElementById("btAlterar").style.display = btA;
    document.getElementById("btExcluir").style.display = btE;
    document.getElementById("btSalvar").style.display = btS;
    document.getElementById("btCancelar").style.display = btS;
    document.getElementById("btAdicionarServico").style.display = btAdd;
}