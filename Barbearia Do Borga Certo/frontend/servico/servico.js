const URL_API = 'http://localhost:3001';
const SILHUETA_URL = `${URL_API}/imagens/silhueta.png`;

let oQueEstaFazendo = '';
let servico = null;
bloquearAtributos(true);

async function inicializar() {
    await listar();
}

// Busca o arquivo pelo NOME salvo no banco (campo imagem_servico)
// Se nao tiver nome salvo, ou o arquivo nao existir, cai na silhueta padrao
function carregarImagem(nomeArquivo) {
    const img = document.getElementById('imgServico');
    if (!nomeArquivo) {
        img.src = SILHUETA_URL;
        return;
    }
    img.src = `${URL_API}/imagens/${nomeArquivo}?t=${new Date().getTime()}`;
    img.onerror = () => { img.src = SILHUETA_URL; };
}

async function procurePorChavePrimaria(chave) {
    try {
        const resposta = await fetch(`${URL_API}/servico/${chave}`);
        const data = await resposta.json();
        return data.sucesso ? data.servico : null;
    } catch (erro) {
        return null;
    }
}

async function procure() {
    const id_servico = document.getElementById("inputId_servico").value;
    if (isNaN(id_servico) || !Number.isInteger(Number(id_servico)) || id_servico === "") {
        mostrarAviso("Precisa ser um numero inteiro");
        return;
    }

    servico = await procurePorChavePrimaria(id_servico);
    oQueEstaFazendo = '';

    if (servico) {
        mostrarDadosServico(servico);
        carregarImagem(servico.imagem_servico);
        visibilidadeDosBotoes('inline', 'none', 'inline', 'inline', 'none');
        mostrarAviso("Achou no banco, pode alterar ou excluir");
    } else {
        limparAtributos();
        carregarImagem(null);
        visibilidadeDosBotoes('inline', 'inline', 'none', 'none', 'none');
        mostrarAviso("Nao achou no banco, pode inserir");
    }
}

function inserir() {
    bloquearAtributos(false);
    visibilidadeDosBotoes('none', 'none', 'none', 'none', 'inline');
    oQueEstaFazendo = 'inserindo';
    mostrarAviso("INSERINDO - Preencha os dados (incluindo o nome do arquivo da imagem, se tiver) e clique em salvar");
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
    let id_servico = document.getElementById("inputId_servico").value;
    const nome_servico = document.getElementById("inputNome_servico").value;
    const descricao_servico = document.getElementById("inputDescricao_servico").value;
    const duracao_minutos_servico = parseInt(document.getElementById("inputDuracao_minutos_servico").value) || 30;
    const preco_servico = parseFloat(document.getElementById("inputPreco_servico").value) || 0.0;
    const imagem_servico = document.getElementById("inputImagem_servico").value.trim();

    const dadosServico = { id_servico, nome_servico, descricao_servico, duracao_minutos_servico, preco_servico, imagem_servico };

    try {
        let resposta;
        if (oQueEstaFazendo === 'inserindo') {
            resposta = await fetch(`${URL_API}/servico`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dadosServico) });
        } else if (oQueEstaFazendo === 'alterando') {
            resposta = await fetch(`${URL_API}/servico/${id_servico}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dadosServico) });
        } else if (oQueEstaFazendo === 'excluindo') {
            resposta = await fetch(`${URL_API}/servico/${id_servico}`, { method: 'DELETE' });
        }

        const data = await resposta.json();

        if (!data.sucesso) {
            mostrarAviso("ERRO: " + data.mensagem);
            return;
        }

        mostrarAviso(data.mensagem);
        carregarImagem(null);

        visibilidadeDosBotoes('inline', 'none', 'none', 'none', 'none');
        limparAtributos();
        document.getElementById("inputId_servico").value = "";
        listar();
    } catch (erro) {
        mostrarAviso("Erro ao efetuar operacao no servidor. Verifique se o servidor (npm start) esta rodando.");
    }
}

async function listar() {
    try {
        const resposta = await fetch(`${URL_API}/servico/listar`);
        const data = await resposta.json();
        if (data.sucesso) {
            let texto = "<table><tr><th>ID</th><th>Nome</th><th>Duracao</th><th>Preco</th></tr>";
            for (let linha of data.servicos) {
                texto += `<tr><td>${linha.id_servico}</td><td>${linha.nome_servico}</td><td>${linha.duracao_minutos_servico} min</td><td>R$ ${parseFloat(linha.preco_servico).toFixed(2)}</td></tr>`;
            }
            texto += "</table>";
            document.getElementById("outputSaida").innerHTML = data.servicos.length ? texto : "Nenhum servico cadastrado.";
        }
    } catch (erro) {
        document.getElementById("outputSaida").innerHTML = "Servidor offline.";
    }
}

function cancelarOperacao() {
    limparAtributos();
    carregarImagem(null);
    bloquearAtributos(true);
    visibilidadeDosBotoes('inline', 'none', 'none', 'none', 'none');
    mostrarAviso("Cancelou a operacao");
}

function mostrarAviso(mensagem) {
    document.getElementById("divAviso").innerHTML = mensagem;
}

function mostrarDadosServico(s) {
    document.getElementById("inputId_servico").value = s.id_servico;
    document.getElementById("inputNome_servico").value = s.nome_servico;
    document.getElementById("inputDescricao_servico").value = s.descricao_servico || '';
    document.getElementById("inputDuracao_minutos_servico").value = s.duracao_minutos_servico;
    document.getElementById("inputPreco_servico").value = s.preco_servico;
    document.getElementById("inputImagem_servico").value = s.imagem_servico || '';
    bloquearAtributos(true);
}

function limparAtributos() {
    servico = null;
    oQueEstaFazendo = '';
    document.getElementById("inputNome_servico").value = "";
    document.getElementById("inputDescricao_servico").value = "";
    document.getElementById("inputDuracao_minutos_servico").value = "30";
    document.getElementById("inputPreco_servico").value = "";
    document.getElementById("inputImagem_servico").value = "";
    bloquearAtributos(true);
}

function bloquearAtributos(soLeitura) {
    document.getElementById("inputId_servico").readOnly = !soLeitura;
    document.getElementById("inputNome_servico").readOnly = soLeitura;
    document.getElementById("inputDescricao_servico").readOnly = soLeitura;
    document.getElementById("inputDuracao_minutos_servico").readOnly = soLeitura;
    document.getElementById("inputPreco_servico").readOnly = soLeitura;
    document.getElementById("inputImagem_servico").readOnly = soLeitura;
}

function visibilidadeDosBotoes(btP, btI, btA, btE, btS) {
    document.getElementById("btProcure").style.display = btP;
    document.getElementById("btInserir").style.display = btI;
    document.getElementById("btAlterar").style.display = btA;
    document.getElementById("btExcluir").style.display = btE;
    document.getElementById("btSalvar").style.display = btS;
    document.getElementById("btCancelar").style.display = btS;
}