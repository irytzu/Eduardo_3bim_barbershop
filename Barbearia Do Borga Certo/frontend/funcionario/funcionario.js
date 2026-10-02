const URL_API = 'http://localhost:3001';
const SILHUETA_URL = `${URL_API}/imagens/silhueta.png`;

let oQueEstaFazendo = '';
let funcionario = null;
bloquearAtributos(true);

async function inicializar() {
    await carregarCargos();
    await listar();
}

// A foto e fixa: busca o arquivo imagens/funcionario_<CPF>.png
// Se nao existir, cai na silhueta padrao
function carregarImagem(cpf) {
    const img = document.getElementById('imgFuncionario');
    if (!cpf) {
        img.src = SILHUETA_URL;
        return;
    }
    img.src = `${URL_API}/imagens/funcionario_${cpf}.png?t=${new Date().getTime()}`;
    img.onerror = () => { img.src = SILHUETA_URL; };
}

async function carregarCargos() {
    const select = document.getElementById("selectCargo");
    try {
        const resposta = await fetch(`${URL_API}/cargo/listar`);
        const data = await resposta.json();
        if (data.sucesso) {
            select.innerHTML = '<option value="">-- Selecione um Cargo --</option>';
            data.cargos.forEach(c => {
                select.innerHTML += `<option value="${c.id_cargo}">${c.nome_cargo}</option>`;
            });
        }
    } catch (erro) {
        select.innerHTML = '<option value="">Erro ao carregar cargos</option>';
    }
}

async function procurePorChavePrimaria(chave) {
    try {
        const resposta = await fetch(`${URL_API}/funcionario/${chave}`);
        const data = await resposta.json();
        return data.sucesso ? data.funcionario : null;
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

    funcionario = await procurePorChavePrimaria(cpf);
    oQueEstaFazendo = '';

    if (funcionario) {
        mostrarDadosFuncionario(funcionario);
        carregarImagem(cpf);
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
    mostrarAviso("INSERINDO - Preencha os dados e clique em salvar. Depois, salve a foto como imagens/funcionario_CPF.png");
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
    const cargo_id_cargo = document.getElementById("selectCargo").value || null;
    const salario_funcionario = parseFloat(document.getElementById("inputSalario").value) || 0.0;
    const especialidade_funcionario = document.getElementById("inputEspecialidade").value;

    const dados = { pessoa_cpf_pessoa, nome_pessoa, data_nascimento_pessoa, endereco_pessoa, email_pessoa, senha_pessoa, cargo_id_cargo, salario_funcionario, especialidade_funcionario };

    try {
        let resposta;
        if (oQueEstaFazendo === 'inserindo') {
            resposta = await fetch(`${URL_API}/funcionario`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dados) });
        } else if (oQueEstaFazendo === 'alterando') {
            resposta = await fetch(`${URL_API}/funcionario/${pessoa_cpf_pessoa}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dados) });
        } else if (oQueEstaFazendo === 'excluindo') {
            resposta = await fetch(`${URL_API}/funcionario/${pessoa_cpf_pessoa}`, { method: 'DELETE' });
        }

        const data = await resposta.json();

        if (!data.sucesso) {
            // O servidor recusou a operacao (ex: CPF duplicado, cargo invalido) - mostra o motivo real
            mostrarAviso("ERRO: " + data.mensagem);
            return;
        }

        mostrarAviso(data.mensagem);
        if (oQueEstaFazendo === 'excluindo') {
            carregarImagem(null);
        }

        visibilidadeDosBotoes('inline', 'none', 'none', 'none', 'none');
        limparAtributos();
        document.getElementById("inputCpf").value = "";
        listar();
    } catch (erro) {
        mostrarAviso("Erro ao efetuar operacao no servidor. Verifique se o servidor (npm start) esta rodando.");
    }
}

async function listar() {
    try {
        const resposta = await fetch(`${URL_API}/funcionario/listar`);
        const data = await resposta.json();
        if (data.sucesso) {
            let texto = "<table><tr><th>CPF</th><th>Nome</th><th>Cargo</th><th>Salario</th><th>Especialidade</th></tr>";
            for (let linha of data.funcionarios) {
                texto += `<tr><td>${linha.pessoa_cpf_pessoa}</td><td>${linha.nome_pessoa}</td><td>${linha.nome_cargo || '-'}</td><td>R$ ${parseFloat(linha.salario_funcionario || 0).toFixed(2)}</td><td>${linha.especialidade_funcionario || '-'}</td></tr>`;
            }
            texto += "</table>";
            document.getElementById("outputSaida").innerHTML = data.funcionarios.length ? texto : "Nenhum funcionario cadastrado.";
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

function mostrarDadosFuncionario(f) {
    document.getElementById("inputCpf").value = f.pessoa_cpf_pessoa;
    document.getElementById("inputNome").value = f.nome_pessoa;
    document.getElementById("inputDataNascimento").value = f.data_nascimento_pessoa ? f.data_nascimento_pessoa.substring(0, 10) : '';
    document.getElementById("inputEndereco").value = f.endereco_pessoa || '';
    document.getElementById("inputEmail").value = f.email_pessoa || '';
    document.getElementById("inputSenha").value = f.senha_pessoa || '';
    document.getElementById("selectCargo").value = f.cargo_id_cargo || '';
    document.getElementById("inputSalario").value = f.salario_funcionario;
    document.getElementById("inputEspecialidade").value = f.especialidade_funcionario || '';
    bloquearAtributos(true);
}

function limparAtributos() {
    funcionario = null;
    oQueEstaFazendo = '';
    document.getElementById("inputNome").value = "";
    document.getElementById("inputDataNascimento").value = "";
    document.getElementById("inputEndereco").value = "";
    document.getElementById("inputEmail").value = "";
    document.getElementById("inputSenha").value = "";
    document.getElementById("selectCargo").value = "";
    document.getElementById("inputSalario").value = "";
    document.getElementById("inputEspecialidade").value = "";
    bloquearAtributos(true);
}

function bloquearAtributos(soLeitura) {
    document.getElementById("inputCpf").readOnly = !soLeitura;
    document.getElementById("inputNome").readOnly = soLeitura;
    document.getElementById("inputDataNascimento").readOnly = soLeitura;
    document.getElementById("inputEndereco").readOnly = soLeitura;
    document.getElementById("inputEmail").readOnly = soLeitura;
    document.getElementById("inputSenha").readOnly = soLeitura;
    document.getElementById("selectCargo").disabled = soLeitura;
    document.getElementById("inputSalario").readOnly = soLeitura;
    document.getElementById("inputEspecialidade").readOnly = soLeitura;
}

function visibilidadeDosBotoes(btP, btI, btA, btE, btS) {
    document.getElementById("btProcure").style.display = btP;
    document.getElementById("btInserir").style.display = btI;
    document.getElementById("btAlterar").style.display = btA;
    document.getElementById("btExcluir").style.display = btE;
    document.getElementById("btSalvar").style.display = btS;
    document.getElementById("btCancelar").style.display = btS;
}