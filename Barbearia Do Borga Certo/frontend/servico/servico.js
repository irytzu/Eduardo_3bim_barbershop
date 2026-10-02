const URL_API = 'http://localhost:3001';
const SILHUETA_URL = `${URL_API}/imagens/silhueta.png`;

let oQueEstaFazendo = '';
let servico = null;
bloquearAtributos(true);

async function inicializar() {
    await listar();
}

function carregarImagem(id) {
    const img = document.getElementById('imgServico');
    if (!id) {
        img.src = SILHUETA_URL;
        return;
    }
    img.src = `${URL_API}/imagens/servico_${id}.png?t=${new Date().getTime()}`;
    img.onerror = () => { img.src = SILHUETA_URL; };
}

function acionarUpload() {
    if (oQueEstaFazendo !== 'inserindo' && oQueEstaFazendo !== 'alterando') {
        mostrarAviso("Clique em Inserir ou Alterar primeiro para poder escolher uma imagem.");
        return;
    }
    document.getElementById('inputImagem').click();
}

function previewImagem() {
    const inputFiles = document.getElementById('inputImagem').files;
    if (inputFiles.length > 0) {
        const url = URL.createObjectURL(inputFiles[0]);
        document.getElementById('imgServico').src = url;
        mostrarAviso("Imagem escolhida! Clique em Salvar para concluir.");
    }
}

async function uploadImagemParaServidor(id) {
    const inputFiles = document.getElementById('inputImagem').files;
    if (inputFiles.length === 0) return;

    const formData = new FormData();
    formData.append('imagem', inputFiles[0]);

    try {
        await fetch(`${URL_API}/servico/upload/${id}`, { method: 'POST', body: formData });
    } catch (erro) {
        console.error("Erro ao enviar imagem:", erro);
    }
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
        carregarImagem(id_servico);
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
    mostrarAviso("INSERINDO - Preencha os dados, escolha a imagem e clique em salvar");
}

function alterar() {
    bloquearAtributos(false);
    visibilidadeDosBotoes('none', 'none', 'none', 'none', 'inline');
    oQueEstaFazendo = 'alterando';
    mostrarAviso("ALTERANDO - Altere os dados, mude a imagem (opcional) e clique em salvar");
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

    const dadosServico = { id_servico, nome_servico, descricao_servico, duracao_minutos_servico, preco_servico };

    try {
        if (oQueEstaFazendo === 'inserindo') {
            await fetch(`${URL_API}/servico`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dadosServico) });
            await uploadImagemParaServidor(id_servico);
            mostrarAviso("Inserido no Banco de Dados com sucesso!");
        } else if (oQueEstaFazendo === 'alterando') {
            await fetch(`${URL_API}/servico/${id_servico}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dadosServico) });
            await uploadImagemParaServidor(id_servico);
            mostrarAviso("Alterado no Banco de Dados com sucesso!");
        } else if (oQueEstaFazendo === 'excluindo') {
            await fetch(`${URL_API}/servico/${id_servico}`, { method: 'DELETE' });
            carregarImagem(null);
            mostrarAviso("Excluido do Banco de Dados!");
        }

        visibilidadeDosBotoes('inline', 'none', 'none', 'none', 'none');
        limparAtributos();
        document.getElementById("inputId_servico").value = "";
        listar();
    } catch (erro) {
        mostrarAviso("Erro ao efetuar operacao no servidor.");
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
    bloquearAtributos(true);
}

function limparAtributos() {
    servico = null;
    oQueEstaFazendo = '';
    document.getElementById("inputNome_servico").value = "";
    document.getElementById("inputDescricao_servico").value = "";
    document.getElementById("inputDuracao_minutos_servico").value = "30";
    document.getElementById("inputPreco_servico").value = "";
    document.getElementById("inputImagem").value = "";
    bloquearAtributos(true);
}

function bloquearAtributos(soLeitura) {
    document.getElementById("inputId_servico").readOnly = !soLeitura;
    document.getElementById("inputNome_servico").readOnly = soLeitura;
    document.getElementById("inputDescricao_servico").readOnly = soLeitura;
    document.getElementById("inputDuracao_minutos_servico").readOnly = soLeitura;
    document.getElementById("inputPreco_servico").readOnly = soLeitura;
}

function visibilidadeDosBotoes(btP, btI, btA, btE, btS) {
    document.getElementById("btProcure").style.display = btP;
    document.getElementById("btInserir").style.display = btI;
    document.getElementById("btAlterar").style.display = btA;
    document.getElementById("btExcluir").style.display = btE;
    document.getElementById("btSalvar").style.display = btS;
    document.getElementById("btCancelar").style.display = btS;
}