const URL_API = 'http://localhost:3001';

let oQueEstaFazendo = '';
let cliente = null;
bloquearAtributos(true);

async function inicializar() {
    await listar();
}

async function procurePorChavePrimaria(chave) {
    try {
        const resposta = await fetch(`${URL_API}/cliente/${chave}`);
        const data = await resposta.json();
        return data.sucesso ? data.cliente : null;
    } catch (erro) {
        return null;
    }
}

async function procure() {
    const cpf = document.getElementById("inputCpf").value.trim();
    if (!cpf) {
        mostrarAviso("Informe o CPF para procurar");
        return;
    }

    cliente = await procurePorChavePrimaria(cpf);
    oQueEstaFazendo = '';

    if (cliente) {
        mostrarDadosCliente(cliente);
        visibilidadeDosBotoes('inline', 'none', 'inline', 'inline', 'none');
        mostrarAviso("Achou no banco, pode alterar ou excluir");
    } else {
        limparAtributos();
        visibilidadeDosBotoes('inline', 'inline', 'none', 'none', 'none');
        mostrarAviso("Nao achou no banco, pode inserir");
    }
}

function inserir() {
    bloquearAtributos(false);
    visibilidadeDosBotoes('none', 'none', 'none', 'none', 'inline');
    oQueEstaFazendo = 'inserindo';
    mostrarAviso("INSERINDO - Preencha os dados e clique em salvar");
}

function alterar() {
    bloquearAtributos(false);
    visibilidadeDosBotoes('none', 'none', 'none', 'none', 'inline');
    oQueEstaFazendo = 'alterando';
    mostrarAviso("ALTERANDO - Altere os dados e clique em salvar");
}

function excluir() {
    bloquearAtributos(true);
    visibilidadeDosBotoes('none', 'none', 'none', 'none', 'inline');
    oQueEstaFazendo = 'excluindo';
    mostrarAviso("EXCLUINDO - Clique em salvar para confirmar a exclusao");
}

async function salvar() {
    let pessoa_cpf_pessoa = document.getElementById("inputCpf").value.trim();
    const nome_pessoa = document.getElementById("inputNome").value;
    const data_nascimento_pessoa = document.getElementById("inputDataNascimento").value || null;
    const endereco_pessoa = document.getElementById("inputEndereco").value;
    const email_pessoa = document.getElementById("inputEmail").value;
    const senha_pessoa = document.getElementById("inputSenha").value;
    const data_cadastro_cliente = document.getElementById("inputDataCadastro").value || null;

    const dados = { pessoa_cpf_pessoa, nome_pessoa, data_nascimento_pessoa, endereco_pessoa, email_pessoa, senha_pessoa, data_cadastro_cliente };

    try {
        if (oQueEstaFazendo === 'inserindo') {
            await fetch(`${URL_API}/cliente`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dados) });
            mostrarAviso("Inserido no Banco de Dados com sucesso!");
        } else if (oQueEstaFazendo === 'alterando') {
            await fetch(`${URL_API}/cliente/${pessoa_cpf_pessoa}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dados) });
            mostrarAviso("Alterado no Banco de Dados com sucesso!");
        } else if (oQueEstaFazendo === 'excluindo') {
            await fetch(`${URL_API}/cliente/${pessoa_cpf_pessoa}`, { method: 'DELETE' });
            mostrarAviso("Excluido do Banco de Dados!");
        }

        visibilidadeDosBotoes('inline', 'none', 'none', 'none', 'none');
        limparAtributos();
        document.getElementById("inputCpf").value = "";
        listar();
    } catch (erro) {
        mostrarAviso("Erro ao efetuar operacao no servidor.");
    }
}

async function listar() {
    try {
        const resposta = await fetch(`${URL_API}/cliente/listar`);
        const data = await resposta.json();
        if (data.sucesso) {
            let texto = "<table><tr><th>CPF</th><th>Nome</th><th>E-mail</th><th>Cadastro</th></tr>";
            for (let linha of data.clientes) {
                const dataFmt = linha.data_cadastro_cliente ? new Date(linha.data_cadastro_cliente).toLocaleDateString('pt-BR') : '-';
                texto += `<tr><td>${linha.pessoa_cpf_pessoa}</td><td>${linha.nome_pessoa}</td><td>${linha.email_pessoa || '-'}</td><td>${dataFmt}</td></tr>`;
            }
            texto += "</table>";
            document.getElementById("outputSaida").innerHTML = data.clientes.length ? texto : "Nenhum cliente cadastrado.";
        }
    } catch (erro) {
        document.getElementById("outputSaida").innerHTML = "Servidor offline.";
    }
}

function cancelarOperacao() {
    limparAtributos();
    bloquearAtributos(true);
    visibilidadeDosBotoes('inline', 'none', 'none', 'none', 'none');
    mostrarAviso("Cancelou a operacao");
}

function mostrarAviso(mensagem) {
    document.getElementById("divAviso").innerHTML = mensagem;
}

function mostrarDadosCliente(c) {
    document.getElementById("inputCpf").value = c.pessoa_cpf_pessoa;
    document.getElementById("inputNome").value = c.nome_pessoa;
    document.getElementById("inputDataNascimento").value = c.data_nascimento_pessoa ? c.data_nascimento_pessoa.substring(0, 10) : '';
    document.getElementById("inputEndereco").value = c.endereco_pessoa || '';
    document.getElementById("inputEmail").value = c.email_pessoa || '';
    document.getElementById("inputSenha").value = c.senha_pessoa || '';
    document.getElementById("inputDataCadastro").value = c.data_cadastro_cliente ? c.data_cadastro_cliente.substring(0, 10) : '';
    bloquearAtributos(true);
}

function limparAtributos() {
    cliente = null;
    oQueEstaFazendo = '';
    document.getElementById("inputNome").value = "";
    document.getElementById("inputDataNascimento").value = "";
    document.getElementById("inputEndereco").value = "";
    document.getElementById("inputEmail").value = "";
    document.getElementById("inputSenha").value = "";
    document.getElementById("inputDataCadastro").value = "";
    bloquearAtributos(true);
}

function bloquearAtributos(soLeitura) {
    document.getElementById("inputCpf").readOnly = !soLeitura;
    document.getElementById("inputNome").readOnly = soLeitura;
    document.getElementById("inputDataNascimento").readOnly = soLeitura;
    document.getElementById("inputEndereco").readOnly = soLeitura;
    document.getElementById("inputEmail").readOnly = soLeitura;
    document.getElementById("inputSenha").readOnly = soLeitura;
    document.getElementById("inputDataCadastro").readOnly = soLeitura;
}

function visibilidadeDosBotoes(btP, btI, btA, btE, btS) {
    document.getElementById("btProcure").style.display = btP;
    document.getElementById("btInserir").style.display = btI;
    document.getElementById("btAlterar").style.display = btA;
    document.getElementById("btExcluir").style.display = btE;
    document.getElementById("btSalvar").style.display = btS;
    document.getElementById("btCancelar").style.display = btS;
}