// js/modulos/pedagogico.js
(function() {
    'use strict';

    const secaoPedagogico = document.getElementById('pedagogico');
    if (!secaoPedagogico) { console.warn("Seção Pedagógico não encontrada."); return; }

    const tabLinks = secaoPedagogico.querySelectorAll('.tab-link-nexus');
    const tabConteudos = secaoPedagogico.querySelectorAll('.tab-conteudo-nexus');

    // Tab: Planos de Aula
    const selectTurmaPlanoAula = secaoPedagogico.querySelector('#select-turma-plano-aula');
    const inputSemanaPlanoAula = secaoPedagogico.querySelector('#input-semana-plano-aula');
    const btnNovoPlanoAula = secaoPedagogico.querySelector('#btn-novo-plano-aula');
    const containerPlanosAula = secaoPedagogico.querySelector('#container-planos-aula');
    // const templateCardPlanoAula = document.getElementById('template-card-plano-aula'); // Crie este template

    // Tab: Acompanhamento do Desenvolvimento
    const selectAlunoDesenvolvimento = secaoPedagogico.querySelector('#select-aluno-desenvolvimento');
    const selectAreaDesenvolvimento = secaoPedagogico.querySelector('#select-area-desenvolvimento');
    const btnNovoRegistroDesenvolvimento = secaoPedagogico.querySelector('#btn-novo-registro-desenvolvimento');
    const containerDesenvolvimentoAluno = secaoPedagogico.querySelector('#container-desenvolvimento-aluno');

    // Tab: Registro de Atividades
    const selectTurmaRegistroAtividade = secaoPedagogico.querySelector('#select-turma-registro-atividade');
    const inputDataRegistroAtividade = secaoPedagogico.querySelector('#input-data-registro-atividade');
    const btnNovaAtividadeTurma = secaoPedagogico.querySelector('#btn-nova-atividade-turma');
    const containerAtividadesRegistradas = secaoPedagogico.querySelector('#container-atividades-registradas');
    // const templateItemAtividadeRegistrada = document.getElementById('template-item-atividade-registrada'); // Crie este template

    // Dados Simulados
    let planosDeAula = { // Chave: turmaId_YYYY-WW (ano-semana)
        "maternal1_2024-15": [
            { dia: "Segunda", objetivo: "Coordenação Motora Fina", atividade: "Recorte e colagem com diferentes texturas.", materiais: "Tesoura sem ponta, cola, revistas, papel colorido." },
            { dia: "Terça", objetivo: "Linguagem Oral", atividade: "Roda de história: 'O Patinho Feio'. Discussão sobre sentimentos.", materiais: "Livro da história." },
            // ... mais dias
        ],
        "jardim1_2024-15": [
            { dia: "Segunda", objetivo: "Conceitos Matemáticos", atividade: "Contagem e agrupamento de objetos (tampinhas, blocos).", materiais: "Objetos diversos para contagem."}
        ]
    };
    let acompanhamentoDesenvolvimento = { // Chave: alunoId
        [window.alunosMatriculados?.[0]?.id || 1]: [ // Ex: Ana Clara
            { data: '2024-03-01', area: 'socioemocional', observacao: "Demonstrou iniciativa ao compartilhar brinquedos. Interagiu bem com os colegas.", responsavelObs: "Prof. Carla" },
            { data: '2024-03-15', area: 'motor', observacao: "Consegue empilhar 5 blocos. Mostra maior firmeza ao segurar o lápis.", responsavelObs: "Prof. Carla" }
        ]
    };
    let atividadesRegistradas = { // Chave: turmaId_YYYY-MM-DD
        "maternal1_2024-04-10": [
            { hora: "09:00", titulo: "Roda de Acolhida", descricao: "Músicas e conversa sobre o final de semana.", fotos: [] },
            { hora: "10:00", titulo: "Atividade de Pintura Livre", descricao: "Exploração de cores e texturas com tinta guache.", fotos: ["url_foto1.jpg", "url_foto2.jpg"] }
        ]
    };


    function ativarTab(targetId) { /* ... (código já fornecido) ... */ }

    function carregarPlanosDeAula() {
        if (!containerPlanosAula || !selectTurmaPlanoAula || !inputSemanaPlanoAula) return;
        const turmaId = selectTurmaPlanoAula.value;
        const semanaAno = inputSemanaPlanoAula.value; // YYYY-W##

        if (!turmaId || !semanaAno) {
            containerPlanosAula.innerHTML = '<p class="sem-dados">Selecione uma turma e uma semana para ver os planos de aula.</p>';
            return;
        }
        const chavePlano = `${turmaId}_${semanaAno.replace('W','')}`; // Ex: maternal1_202415
        const planosDaSemana = planosDeAula[chavePlano];

        containerPlanosAula.innerHTML = '';
        if (!planosDaSemana || planosDaSemana.length === 0) {
            containerPlanosAula.innerHTML = '<p class="sem-dados">Nenhum plano de aula encontrado para esta turma/semana.</p>';
            return;
        }

        planosDaSemana.forEach(plano => {
            // SIMULAÇÃO DE RENDERIZAÇÃO DE CARD DE PLANO (você precisaria de um <template>)
            const divPlano = document.createElement('div');
            divPlano.className = 'card-item-nexus animar-item-lista'; // Reutilize estilos de card
            divPlano.innerHTML = `
                <div class="card-item-cabecalho" style="background-color: var(--cor-acento-claro);">
                    <i class="fas fa-calendar-day icone-card-item"></i>
                    <h3>${plano.dia}</h3>
                </div>
                <div class="card-item-conteudo">
                    <p><strong>Objetivo:</strong> ${plano.objetivo}</p>
                    <p><strong>Atividade:</strong> ${plano.atividade}</p>
                    <p><strong>Materiais:</strong> ${plano.materiais}</p>
                </div>
                <div class="card-item-rodape acoes-item-dado">
                    <button class="botao-pequeno-nexus editar"><i class="fas fa-edit"></i> Editar</button>
                </div>
            `;
            containerPlanosAula.appendChild(divPlano);
        });
    }

    function carregarDadosDesenvolvimento() {
        if (!containerDesenvolvimentoAluno || !selectAlunoDesenvolvimento) return;
        const alunoId = parseInt(selectAlunoDesenvolvimento.value);
        const areaFiltrada = selectAreaDesenvolvimento.value;

        if (!alunoId) {
            containerDesenvolvimentoAluno.innerHTML = '<p class="sem-dados">Selecione um aluno para visualizar o acompanhamento.</p>';
            return;
        }
        const registrosDoAluno = (acompanhamentoDesenvolvimento[alunoId] || []).filter(reg =>
            areaFiltrada === '' || reg.area === areaFiltrada
        ).sort((a,b) => new Date(b.data) - new Date(a.data));

        containerDesenvolvimentoAluno.innerHTML = '';
        if (registrosDoAluno.length === 0) {
            containerDesenvolvimentoAluno.innerHTML = `<p class="sem-dados">Nenhum registro de desenvolvimento encontrado para este aluno ${areaFiltrada ? 'na área de ' + areaFiltrada : ''}.</p>`;
            return;
        }
        // SIMULAÇÃO DE RENDERIZAÇÃO (você precisaria de um <template> ou construir o HTML)
        const ul = document.createElement('ul');
        ul.className = 'lista-observacoes-desenvolvimento';
        registrosDoAluno.forEach(reg => {
            const li = document.createElement('li');
            li.className = 'item-observacao animar-item-lista';
            li.innerHTML = `
                <div class="obs-header">
                    <strong>${new Date(reg.data+'T00:00:00').toLocaleDateString('pt-BR')} - Área: ${reg.area.charAt(0).toUpperCase() + reg.area.slice(1)}</strong>
                    <small>Por: ${reg.responsavelObs}</small>
                </div>
                <p>${reg.observacao}</p>
            `;
            ul.appendChild(li);
        });
        containerDesenvolvimentoAluno.appendChild(ul);
        // Adicionar simulação de gráfico aqui se desejado
    }

    function carregarRegistrosAtividades() {
        if(!containerAtividadesRegistradas || !selectTurmaRegistroAtividade || !inputDataRegistroAtividade) return;
        const turmaId = selectTurmaRegistroAtividade.value;
        const data = inputDataRegistroAtividade.value; // YYYY-MM-DD

        if(!turmaId || !data){
            containerAtividadesRegistradas.innerHTML = '<p class="sem-dados">Selecione turma e data para ver as atividades.</p>';
            return;
        }
        const chaveAtividade = `${turmaId}_${data}`;
        const atividadesDoDia = atividadesRegistradas[chaveAtividade];

        containerAtividadesRegistradas.innerHTML = '';
        if(!atividadesDoDia || atividadesDoDia.length === 0){
             containerAtividadesRegistradas.innerHTML = '<p class="sem-dados">Nenhuma atividade registrada para esta turma/data.</p>';
            return;
        }
        // SIMULAÇÃO DE RENDERIZAÇÃO (você precisaria de um <template>)
        atividadesDoDia.forEach(ativ => {
            const divAtiv = document.createElement('div');
            divAtiv.className = 'item-dado-nexus animar-item-lista'; // Reutilizar estilo
            divAtiv.innerHTML = `
                <div class="info-principal-item">
                    <strong>${ativ.hora} - ${ativ.titulo}</strong>
                    <span class="detalhe-item">${ativ.descricao}</span>
                </div>
                <div class="acoes-item-dado">
                     ${ativ.fotos && ativ.fotos.length > 0 ? `<button class="botao-pequeno-nexus info"><i class="fas fa-camera"></i> Ver Fotos (${ativ.fotos.length})</button>` : ''}
                    <button class="botao-pequeno-nexus editar"><i class="fas fa-edit"></i></button>
                </div>
            `;
            containerAtividadesRegistradas.appendChild(divAtiv);
        });
    }

    function popularSelectsPedagogico() { /* ... (código já fornecido, certifique-se que usa window.turmasDisponiveisGlobais e window.alunosMatriculados) ... */ }

    function inicializarModuloPedagogico() {
        if (!secaoPedagogico.classList.contains('ativa')) return;
        console.log("Módulo Pedagógico inicializado com dados.");

        popularSelectsPedagogico();

        tabLinks.forEach(link => {
            link.addEventListener('click', () => {
                const targetId = link.dataset.tabTarget;
                ativarTab(targetId);
            });
        });
        const tabAtivaInicial = secaoPedagogico.querySelector('.tab-link-nexus.ativo');
        if (tabAtivaInicial) ativarTab(tabAtivaInicial.dataset.tabTarget);
        else if (tabLinks.length > 0) ativarTab(tabLinks[0].dataset.tabTarget);


        selectTurmaPlanoAula?.addEventListener('change', carregarPlanosDeAula);
        inputSemanaPlanoAula?.addEventListener('change', carregarPlanosDeAula);
        btnNovoPlanoAula?.addEventListener('click', () => window.mostrarToast('info', 'Novo Plano de Aula', 'Abrindo modal/formulário para novo plano. (Simulado)'));

        selectAlunoDesenvolvimento?.addEventListener('change', carregarDadosDesenvolvimento);
        selectAreaDesenvolvimento?.addEventListener('change', carregarDadosDesenvolvimento);
        btnNovoRegistroDesenvolvimento?.addEventListener('click', () => window.mostrarToast('info', 'Novo Registro de Desenvolvimento', 'Abrindo modal/formulário. (Simulado)'));

        selectTurmaRegistroAtividade?.addEventListener('change', carregarRegistrosAtividades);
        inputDataRegistroAtividade?.addEventListener('change', carregarRegistrosAtividades);
        btnNovaAtividadeTurma?.addEventListener('click', () => window.mostrarToast('info', 'Registrar Atividade', 'Abrindo modal/formulário. (Simulado)'));
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.target.id === 'pedagogico' && entry.target.classList.contains('ativa')) {
                inicializarModuloPedagogico();
            }
        });
    }, { threshold: 0.01 });
    observer.observe(secaoPedagogico);
    window.inicializarModuloPedagogico = inicializarModuloPedagogico;
})();