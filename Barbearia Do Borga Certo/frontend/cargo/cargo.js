const URL_API = 'http://localhost:3001';

let oQueEstaFazendo = '';
let cargo = null;
bloquearAtributos(true);

async function inicializar() {
    await listar();
}

async function procurePorChavePrimaria(chave) {
    try {
        const resposta = await fetch(`${URL_API}/cargo/${chave}`);
        const data = await resposta.json();
        return data.sucesso ? data.cargo : null;
    } catch (erro) {
        return null;
    }
}

async function procure() {
    const id_cargo = document.getElementById("inputId_cargo").value;
    if (isNaN(id_cargo) || !Number.isInteger(Number(id_cargo)) || id_cargo === "") {
        mostrarAviso("Precisa ser um numero inteiro");
        return;
    }

    cargo = await procurePorChavePrimaria(id_cargo);
    oQueEstaFazendo = '';

    if (cargo) {
        mostrarDadosCargo(cargo);
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
    mostrarAviso("INSERINDO - Digite os dados e clique em salvar");
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
    let id_cargo = document.getElementById("inputId_cargo").value;
    const nome_cargo = document.getElementById("inputNome_cargo").value;

    const dadosCargo = { id_cargo, nome_cargo };

    try {
        let resposta;
        if (oQueEstaFazendo === 'inserindo') {
            resposta = await fetch(`${URL_API}/cargo`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dadosCargo) });
        } else if (oQueEstaFazendo === 'alterando') {
            resposta = await fetch(`${URL_API}/cargo/${id_cargo}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dadosCargo) });
        } else if (oQueEstaFazendo === 'excluindo') {
            resposta = await fetch(`${URL_API}/cargo/${id_cargo}`, { method: 'DELETE' });
        }

        const data = await resposta.json();

        if (!data.sucesso) {
            mostrarAviso("ERRO: " + data.mensagem);
            return;
        }

        mostrarAviso(data.mensagem);
        visibilidadeDosBotoes('inline', 'none', 'none', 'none', 'none');
        limparAtributos();
        document.getElementById("inputId_cargo").value = "";
        listar();
    } catch (erro) {
        mostrarAviso("Erro ao efetuar operacao no servidor. Verifique se o servidor (npm start) esta rodando.");
    }
}

async function listar() {
    try {
        const resposta = await fetch(`${URL_API}/cargo/listar`);
        const data = await resposta.json();
        if (data.sucesso) {
            let texto = "<table><tr><th>ID</th><th>Nome do Cargo</th></tr>";
            for (let linha of data.cargos) {
                texto += `<tr><td>${linha.id_cargo}</td><td>${linha.nome_cargo}</td></tr>`;
            }
            texto += "</table>";
            document.getElementById("outputSaida").innerHTML = data.cargos.length ? texto : "Nenhum cargo cadastrado.";
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

function mostrarDadosCargo(c) {
    document.getElementById("inputId_cargo").value = c.id_cargo;
    document.getElementById("inputNome_cargo").value = c.nome_cargo;
    bloquearAtributos(true);
}

function limparAtributos() {
    cargo = null;
    oQueEstaFazendo = '';
    document.getElementById("inputNome_cargo").value = "";
    bloquearAtributos(true);
}

function bloquearAtributos(soLeitura) {
    document.getElementById("inputId_cargo").readOnly = !soLeitura;
    document.getElementById("inputNome_cargo").readOnly = soLeitura;
}

function visibilidadeDosBotoes(btP, btI, btA, btE, btS) {
    document.getElementById("btProcure").style.display = btP;
    document.getElementById("btInserir").style.display = btI;
    document.getElementById("btAlterar").style.display = btA;
    document.getElementById("btExcluir").style.display = btE;
    document.getElementById("btSalvar").style.display = btS;
    document.getElementById("btCancelar").style.display = btS;
}