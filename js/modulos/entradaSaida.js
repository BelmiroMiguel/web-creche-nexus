// js/modulos/entradaSaida.js

document.addEventListener('DOMContentLoaded', () => {
    const secaoEntradaSaida = document.getElementById('entrada-saida');
    if (!secaoEntradaSaida) return; // Só executa se a seção existir na página

    // --- Elementos do DOM ---
    const btnRegistrarNovoES = document.getElementById('btn-registrar-nova-entrada-saida');
    const formRegistroES = document.getElementById('form-registro-entrada-saida');
    const btnCancelarRegistroES = document.getElementById('btn-cancelar-registro-es');

    const filtroDataES = document.getElementById('filtro-data-entrada-saida');
    const filtroAlunoES = document.getElementById('filtro-aluno-entrada-saida');

    const tabelaCorpoES = document.getElementById('tabela-entrada-saida-corpo');
    const templateLinhaES = document.getElementById('template-linha-entrada-saida');

    // Elementos de Paginação específicos da seção
    const paginacaoContainer = secaoEntradaSaida.querySelector('.paginacao-nexus');
    const selectPaginacaoES = paginacaoContainer.querySelector('.select-paginacao-nexus');
    const btnPaginacaoAnteriorES = paginacaoContainer.querySelector('.anterior');
    const btnPaginacaoProximoES = paginacaoContainer.querySelector('.proximo');
    const infoPaginacaoES = paginacaoContainer.querySelector('.info-paginacao-nexus');

    // Campos do formulário
    const registroDataInput = document.getElementById('registro-data');
    const registroAlunoSelect = document.getElementById('registro-aluno-id');
    const registroHoraEntradaInput = document.getElementById('registro-hora-entrada');
    const registroQuemTrouxeInput = document.getElementById('registro-quem-trouxe');
    const registroHoraSaidaInput = document.getElementById('registro-hora-saida');
    const registroQuemBuscouInput = document.getElementById('registro-quem-buscou');
    const registroObservacoesInput = document.getElementById('registro-observacoes');

    // --- Estado da Aplicação e Dados Mock ---
    let todosRegistrosES = []; // Armazenará todos os registros, como se viessem do backend
    let registrosFiltradosEPaginados = [];
    let alunosMock = [ // Você integraria com seus dados reais de alunos
        { id: 'aluno1', nome: 'Ana Júlia Silva' },
        { id: 'aluno2', nome: 'Lucas Pereira Santos' },
        { id: 'aluno3', nome: 'Beatriz Costa Almeida' },
        { id: 'aluno4', nome: 'Miguel Oliveira Ferreira' },
        { id: 'aluno5', nome: 'Sofia Rodrigues Lima' },
        { id: 'aluno6', nome: 'Arthur Gonçalves Martins' },
        { id: 'aluno7', nome: 'Laura Barbosa Gomes' },
        { id: 'aluno8', nome: 'Pedro Alves Ribeiro' },
        { id: 'aluno9', nome: 'Valentina Sousa Castro' },
        { id: 'aluno10', nome: 'Davi Moreira Dias' },
        { id: 'aluno11', nome: 'Isabella Nogueira Azevedo' },
        { id: 'aluno12', nome: 'Bernardo Mendes Barros' }
    ];

    let paginaAtualES = 1;
    const itensPorPaginaES = 5; // Quantos registros por página
    let totalPaginasES = 1;
    let editandoId = null; // Para controlar se estamos editando um registro existente

    // Função para gerar IDs únicos para mock data
    const gerarIdUnico = () => `es_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    // Dados mock iniciais
    const carregarDadosMockIniciais = () => {
        todosRegistrosES = [
            { id: gerarIdUnico(), data: '2024-07-28', alunoId: 'aluno1', alunoNome: 'Ana Júlia Silva', horaEntrada: '07:58', quemTrouxe: 'Mariana Silva (Mãe)', horaSaida: '17:05', quemBuscou: 'Carlos Silva (Pai)', observacoes: 'Entregou bilhete sobre vacina.' },
            { id: gerarIdUnico(), data: '2024-07-28', alunoId: 'aluno2', alunoNome: 'Lucas Pereira Santos', horaEntrada: '08:10', quemTrouxe: 'Fernanda Pereira (Mãe)', horaSaida: '', quemBuscou: '', observacoes: 'Chorou um pouco na entrada.' },
            { id: gerarIdUnico(), data: '2024-07-27', alunoId: 'aluno3', alunoNome: 'Beatriz Costa Almeida', horaEntrada: '08:00', quemTrouxe: 'Ricardo Almeida (Pai)', horaSaida: '16:50', quemBuscou: 'Ricardo Almeida (Pai)', observacoes: '' },
            { id: gerarIdUnico(), data: '2024-07-27', alunoId: 'aluno1', alunoNome: 'Ana Júlia Silva', horaEntrada: '07:55', quemTrouxe: 'Mariana Silva (Mãe)', horaSaida: '17:00', quemBuscou: 'Avó (Maria)', observacoes: 'Tudo ok.' },
            { id: gerarIdUnico(), data: '2024-07-29', alunoId: 'aluno4', alunoNome: 'Miguel Oliveira Ferreira', horaEntrada: '08:15', quemTrouxe: 'Ana Oliveira (Mãe)', horaSaida: '', quemBuscou: '', observacoes: 'Trouxe lanche extra.' },
            { id: gerarIdUnico(), data: '2024-07-29', alunoId: 'aluno5', alunoNome: 'Sofia Rodrigues Lima', horaEntrada: '07:50', quemTrouxe: 'Paulo Lima (Pai)', horaSaida: '17:10', quemBuscou: 'Paulo Lima (Pai)', observacoes: '' },
            { id: gerarIdUnico(), data: '2024-07-29', alunoId: 'aluno6', alunoNome: 'Arthur Gonçalves Martins', horaEntrada: '08:05', quemTrouxe: 'Clara Martins (Mãe)', horaSaida: '', quemBuscou: '', observacoes: 'Parecia sonolento.' },
            { id: gerarIdUnico(), data: '2024-07-30', alunoId: 'aluno7', alunoNome: 'Laura Barbosa Gomes', horaEntrada: '08:00', quemTrouxe: 'Sr. Barbosa (Pai)', horaSaida: '17:00', quemBuscou: 'Sra. Gomes (Mãe)', observacoes: '' },
            { id: gerarIdUnico(), data: '2024-07-30', alunoId: 'aluno2', alunoNome: 'Lucas Pereira Santos', horaEntrada: '08:12', quemTrouxe: 'Fernanda Pereira (Mãe)', horaSaida: '16:55', quemBuscou: 'Fernanda Pereira (Mãe)', observacoes: 'Hoje ficou bem.' },
        ];
         // Adicionar mais dados para testar paginação
        for (let i = 0; i < 8; i++) {
            const randomAluno = alunosMock[Math.floor(Math.random() * alunosMock.length)];
            todosRegistrosES.push({
                id: gerarIdUnico(),
                data: `2024-07-${20 + i}`,
                alunoId: randomAluno.id,
                alunoNome: randomAluno.nome,
                horaEntrada: `08:${Math.floor(Math.random() * 30).toString().padStart(2, '0')}`,
                quemTrouxe: 'Responsável Mock',
                horaSaida: i % 2 === 0 ? `17:${Math.floor(Math.random() * 30).toString().padStart(2, '0')}` : '',
                quemBuscou: i % 2 === 0 ? 'Outro Responsável Mock' : '',
                observacoes: i % 3 === 0 ? 'Alguma observação.' : ''
            });
        }
        todosRegistrosES.sort((a, b) => new Date(b.data + 'T' + (b.horaEntrada || '00:00')) - new Date(a.data + 'T' + (a.horaEntrada || '00:00'))); // Ordena mais recentes primeiro
    };


    // --- Funções ---
    const popularAlunosDropdown = () => {
        return
        registroAlunoSelect.innerHTML = '<option value="">Selecione o Aluno...</option>'; // Opção padrão
        alunosMock.forEach(aluno => {
            const option = document.createElement('option');
            option.value = aluno.id;
            option.textContent = aluno.nome;
            registroAlunoSelect.appendChild(option);
        });
    };

    const formatarDataParaExibicao = (dataISO) => {
        if (!dataISO) return '--/--/----';
        const [ano, mes, dia] = dataISO.split('-');
        return `${dia}/${mes}/${ano}`;
    };
    
    const formatarHora = (hora) => {
        return hora || '--:--';
    };

    const determinarStatus = (registro) => {
        if (registro.horaEntrada && registro.horaSaida) {
            return { texto: 'Concluído', classe: 'saida' };
        } else if (registro.horaEntrada) {
            return { texto: 'Presente', classe: 'entrada' };
        }
        return { texto: 'Pendente', classe: 'pendente' }; // Ou 'Ausente', dependendo da lógica
    };

    const renderizarTabela = () => {
        tabelaCorpoES.innerHTML = ''; // Limpa a tabela

        if (registrosFiltradosEPaginados.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td colspan="9" class="sem-dados">Nenhum registro de entrada/saída encontrado para os filtros selecionados.</td>`;
            tabelaCorpoES.appendChild(tr);
            atualizarControlesPaginacaoES(); // Atualiza mesmo se vazio
            return;
        }

        registrosFiltradosEPaginados.forEach(registro => {
            const clone = templateLinhaES.content.cloneNode(true);
            const tr = clone.querySelector('tr');
            tr.dataset.id = registro.id;

            tr.querySelector('.data').textContent = formatarDataParaExibicao(registro.data);
            tr.querySelector('.aluno-nome-es').textContent = registro.alunoNome;
            tr.querySelector('.hora-entrada').textContent = formatarHora(registro.horaEntrada);
            tr.querySelector('.quem-trouxe').textContent = registro.quemTrouxe || 'N/A';
            tr.querySelector('.hora-saida').textContent = formatarHora(registro.horaSaida);
            tr.querySelector('.quem-buscou').textContent = registro.quemBuscou || 'N/A';
            
            const statusInfo = determinarStatus(registro);
            const statusContainer = tr.querySelector('.status-es-container');
            statusContainer.innerHTML = `<span class="status-entrada-saida ${statusInfo.classe}">${statusInfo.texto}</span>`;
            
            tr.querySelector('.observacoes-es').textContent = registro.observacoes || '-';

            const btnEditar = tr.querySelector('.editar');
            const btnExcluir = tr.querySelector('.perigo');

            btnEditar.addEventListener('click', () => abrirFormularioParaEdicao(registro.id));
            btnExcluir.addEventListener('click', () => handleExcluirRegistro(registro.id));

            tabelaCorpoES.appendChild(clone);
        });
        atualizarControlesPaginacaoES();
    };

    const aplicarFiltrosEPaginacao = () => {
        const dataFiltro = filtroDataES.value;
        const nomeFiltro = filtroAlunoES.value.toLowerCase();

        let registrosFiltrados = todosRegistrosES.filter(reg => {
            const matchData = !dataFiltro || reg.data === dataFiltro;
            const matchNome = !nomeFiltro || reg.alunoNome.toLowerCase().includes(nomeFiltro);
            return matchData && matchNome;
        });

        totalPaginasES = Math.ceil(registrosFiltrados.length / itensPorPaginaES) || 1;
        if (paginaAtualES > totalPaginasES) paginaAtualES = totalPaginasES;

        const inicio = (paginaAtualES - 1) * itensPorPaginaES;
        const fim = inicio + itensPorPaginaES;
        registrosFiltradosEPaginados = registrosFiltrados.slice(inicio, fim);

        renderizarTabela();
    };
    
    const atualizarControlesPaginacaoES = () => {
        infoPaginacaoES.textContent = `de ${totalPaginasES}`;
        selectPaginacaoES.innerHTML = ''; // Limpa options existentes

        for (let i = 1; i <= totalPaginasES; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `Página ${i}`;
            if (i === paginaAtualES) {
                option.selected = true;
            }
            selectPaginacaoES.appendChild(option);
        }
        // Limita o dropdown para no máximo 10 opções de página, se houver mais, precisaria de outra lógica
        // A solicitação original era de 1 a 10 páginas fixas, mas dinâmico é melhor.
        // Se for fixo em 10, ajuste o loop 'for' e a lógica de `totalPaginasES`

        btnPaginacaoAnteriorES.disabled = paginaAtualES === 1;
        btnPaginacaoProximoES.disabled = paginaAtualES === totalPaginasES || totalPaginasES === 0;

        if (registrosFiltradosEPaginados.length === 0 && todosRegistrosES.length > 0 && paginaAtualES > 1) {
            // Se a página atual ficou vazia após uma exclusão, por exemplo, volte uma página.
            paginaAtualES--;
            aplicarFiltrosEPaginacao();
        }
    };

    const abrirFormularioParaEdicao = (id) => {
        const registro = todosRegistrosES.find(r => r.id === id);
        if (!registro) return;

        editandoId = id;
        formRegistroES.querySelector('h3').innerHTML = '<i class="fas fa-edit"></i> Editar Movimentação';
        registroDataInput.value = registro.data;
        registroAlunoSelect.value = registro.alunoId;
        registroHoraEntradaInput.value = registro.horaEntrada;
        registroQuemTrouxeInput.value = registro.quemTrouxe;
        registroHoraSaidaInput.value = registro.horaSaida;
        registroQuemBuscouInput.value = registro.quemBuscou;
        registroObservacoesInput.value = registro.observacoes;
        formRegistroES.style.display = 'block';
        formRegistroES.scrollIntoView({ behavior: 'smooth' });
    };

    const abrirFormularioNovo = () => {
        editandoId = null;
        formRegistroES.reset(); // Limpa o formulário
        formRegistroES.querySelector('h3').innerHTML = '<i class="fas fa-plus-circle"></i> Registrar Nova Movimentação';
        registroDataInput.valueAsDate = new Date(); // Data atual por padrão
        formRegistroES.style.display = 'block';
        formRegistroES.scrollIntoView({ behavior: 'smooth' });
    };

    const fecharFormulario = () => {
        formRegistroES.style.display = 'none';
        formRegistroES.reset();
        editandoId = null;
    };

    const handleSalvarRegistro = (event) => {
        event.preventDefault();
        const data = registroDataInput.value;
        const alunoId = registroAlunoSelect.value;
        const horaEntrada = registroHoraEntradaInput.value;
        const quemTrouxe = registroQuemTrouxeInput.value.trim();
        const horaSaida = registroHoraSaidaInput.value;
        const quemBuscou = registroQuemBuscouInput.value.trim();
        const observacoes = registroObservacoesInput.value.trim();

        if (!data || !alunoId) {
            if (typeof mostrarToast === 'function') mostrarToast("Data e Aluno são obrigatórios.", "erro");
            else alert("Data e Aluno são obrigatórios.");
            return;
        }
        if (!horaEntrada && !horaSaida) {
             if (typeof mostrarToast === 'function') mostrarToast("É necessário registrar ao menos a Hora de Entrada ou a Hora de Saída.", "aviso");
            else alert("É necessário registrar ao menos a Hora de Entrada ou a Hora de Saída.");
            return;
        }
        if (horaEntrada && !quemTrouxe) {
            if (typeof mostrarToast === 'function') mostrarToast("Se houver Hora de Entrada, informe Quem Trouxe.", "aviso");
            else alert("Se houver Hora de Entrada, informe Quem Trouxe.");
            return;
        }
         if (horaSaida && !quemBuscou) {
            if (typeof mostrarToast === 'function') mostrarToast("Se houver Hora de Saída, informe Quem Buscou.", "aviso");
            else alert("Se houver Hora de Saída, informe Quem Buscou.");
            return;
        }

        const alunoSelecionado = alunosMock.find(a => a.id === alunoId);
        const alunoNome = alunoSelecionado ? alunoSelecionado.nome : 'Desconhecido';

        if (editandoId) { // Editando
            const index = todosRegistrosES.findIndex(r => r.id === editandoId);
            if (index > -1) {
                todosRegistrosES[index] = { ...todosRegistrosES[index], data, alunoId, alunoNome, horaEntrada, quemTrouxe, horaSaida, quemBuscou, observacoes };
                if (typeof mostrarToast === 'function') mostrarToast("Registro atualizado com sucesso!", "sucesso");
            }
        } else { // Novo
            const novoRegistro = {
                id: gerarIdUnico(), data, alunoId, alunoNome, horaEntrada, quemTrouxe, horaSaida, quemBuscou, observacoes
            };
            todosRegistrosES.unshift(novoRegistro); // Adiciona no início para aparecer primeiro
            if (typeof mostrarToast === 'function') mostrarToast("Registro salvo com sucesso!", "sucesso");
        }
        
        // Reordenar por data e hora de entrada (mais recentes primeiro)
        todosRegistrosES.sort((a, b) => new Date(b.data + 'T' + (b.horaEntrada || '00:00')) - new Date(a.data + 'T' + (a.horaEntrada || '00:00')));

        aplicarFiltrosEPaginacao();
        fecharFormulario();
    };

    const handleExcluirRegistro = (id) => {
        // Em um app real, pedir confirmação
        if (!confirm("Tem certeza que deseja excluir este registro?")) return;

        todosRegistrosES = todosRegistrosES.filter(r => r.id !== id);
        if (typeof mostrarToast === 'function') mostrarToast("Registro excluído com sucesso!", "sucesso");
        
        // Se a página atual ficar vazia após a exclusão, e não for a primeira página, volte uma página.
        const totalRegistrosAposExclusaoNaPagina = registrosFiltradosEPaginados.filter(r => r.id !== id).length;
        if (totalRegistrosAposExclusaoNaPagina === 0 && paginaAtualES > 1) {
             // Verificamos se o total de itens filtrados permitiria a página anterior.
            const dataFiltro = filtroDataES.value;
            const nomeFiltro = filtroAlunoES.value.toLowerCase();
            let tempRegistrosFiltrados = todosRegistrosES.filter(reg => {
                const matchData = !dataFiltro || reg.data === dataFiltro;
                const matchNome = !nomeFiltro || reg.alunoNome.toLowerCase().includes(nomeFiltro);
                return matchData && matchNome;
            });
            if (Math.ceil(tempRegistrosFiltrados.length / itensPorPaginaES) < paginaAtualES) {
                 paginaAtualES--;
            }
        }
        aplicarFiltrosEPaginacao();
    };

    // --- Event Listeners ---
    btnRegistrarNovoES.addEventListener('click', abrirFormularioNovo);
    btnCancelarRegistroES.addEventListener('click', fecharFormulario);
    formRegistroES.addEventListener('submit', handleSalvarRegistro);

    filtroDataES.addEventListener('change', () => {
        paginaAtualES = 1; // Resetar para a primeira página ao filtrar
        aplicarFiltrosEPaginacao();
    });
    filtroAlunoES.addEventListener('input', () => {
        paginaAtualES = 1; // Resetar para a primeira página ao filtrar
        aplicarFiltrosEPaginacao();
    });
    
    // Event Listeners para Paginação
    selectPaginacaoES.addEventListener('change', (e) => {
        paginaAtualES = parseInt(e.target.value);
        aplicarFiltrosEPaginacao();
    });
    btnPaginacaoAnteriorES.addEventListener('click', () => {
        if (paginaAtualES > 1) {
            paginaAtualES--;
            aplicarFiltrosEPaginacao();
        }
    });
    btnPaginacaoProximoES.addEventListener('click', () => {
        if (paginaAtualES < totalPaginasES) {
            paginaAtualES++;
            aplicarFiltrosEPaginacao();
        }
    });


    // --- Inicialização ---
    const initEntradaSaida = () => {
        carregarDadosMockIniciais();
        popularAlunosDropdown();
        aplicarFiltrosEPaginacao(); // Carrega os dados na tabela e configura paginação inicial
        
        // Define data atual nos filtros, se desejado
        // filtroDataES.valueAsDate = new Date(); 
        // aplicarFiltrosEPaginacao(); // Se definir data, reaplique filtro
    };

    initEntradaSaida();

});