// js/modulos/frequencia.js
(function() {
    'use strict';

    const secaoFrequencia = document.getElementById('frequencia');
    if (!secaoFrequencia) { console.warn("Seção Frequência não encontrada."); return; }

    const selectTurmaFrequencia = secaoFrequencia.querySelector('#select-turma-frequencia');
    const inputDataFrequencia = secaoFrequencia.querySelector('#input-data-frequencia');
    const tabelaFrequenciaCorpo = secaoFrequencia.querySelector('#tabela-frequencia-corpo');
    const templateLinhaFrequencia = document.getElementById('template-linha-frequencia');
    const btnRegistrarTodosPresentes = secaoFrequencia.querySelector('#btn-registrar-todos-presentes');
    const btnSalvarFrequencias = secaoFrequencia.querySelector('#btn-salvar-frequencias');


    // Usar alunos de window.alunosMatriculados se disponível
    // Registros de frequência: { 'YYYY-MM-DD': { alunoId1: {status: 'presente', obs:''}, alunoId2: {status:'ausente'} } }
    let registrosFrequencia = {
        // Exemplo:
        // '2024-04-01': { 
        //     [window.alunosMatriculados?.[0]?.id || 1]: { status: 'presente', obs: 'Chegou animado!' },
        //     [window.alunosMatriculados?.[1]?.id || 2]: { status: 'ausente', obs: 'Avisou que iria ao médico.' }
        // }
    };

    function getAvatarUrl(alunoNome = '') { // Simples, para fins de exemplo
        return `https://i.pravatar.cc/40?u=${encodeURIComponent(alunoNome.split(' ')[0])}`;
    }

    function carregarFrequencia() {
        if (!inputDataFrequencia || !tabelaFrequenciaCorpo || !templateLinhaFrequencia || !window.alunosMatriculados) return;

        const dataSelecionada = inputDataFrequencia.value; // YYYY-MM-DD
        const turmaSelecionadaId = selectTurmaFrequencia?.value || 'todas';

        if (!dataSelecionada) {
            tabelaFrequenciaCorpo.innerHTML = '<tr><td colspan="5" class="sem-dados">Selecione uma data para registrar/ver a frequência.</td></tr>';
            return;
        }

        tabelaFrequenciaCorpo.innerHTML = '';
        const alunosDaTurma = window.alunosMatriculados.filter(aluno =>
            turmaSelecionadaId === 'todas' || aluno.turmaId === turmaSelecionadaId
        );

        if (alunosDaTurma.length === 0) {
            tabelaFrequenciaCorpo.innerHTML = `<tr><td colspan="5" class="sem-dados">Nenhum aluno encontrado para ${turmaSelecionadaId === 'todas' ? 'o sistema' : 'esta turma'}.</td></tr>`;
            return;
        }

        const frequenciaDoDia = registrosFrequencia[dataSelecionada] || {};

        alunosDaTurma.forEach((aluno, index) => {
            const clone = templateLinhaFrequencia.content.cloneNode(true);
            const tr = clone.querySelector('tr');
            tr.style.animationDelay = `${index * 0.05}s`;
            tr.dataset.alunoId = aluno.id;

            const avatarImg = clone.querySelector('.avatar-tabela-frequencia');
            if(avatarImg) avatarImg.src = getAvatarUrl(aluno.nome); // Simples placeholder

            clone.querySelector('.frequencia-aluno-nome').textContent = aluno.nome;

            const registroAlunoHoje = frequenciaDoDia[aluno.id] || { status: 'nao_registrado', obs: '' };

            const selectStatus = clone.querySelector('.select-status-frequencia');
            selectStatus.value = registroAlunoHoje.status;
            selectStatus.dataset.alunoId = aluno.id; // Para fácil acesso no save
             // Aplicar classe de cor ao select
            selectStatus.className = `select-status-frequencia custom-select-nexus status-${registroAlunoHoje.status}`;


            const inputObs = clone.querySelector('.input-obs-frequencia');
            inputObs.value = registroAlunoHoje.obs;
            inputObs.dataset.alunoId = aluno.id;

            // Botão de histórico (simulado)
            const btnHist = clone.querySelector('.btn-historico-aluno');
            if(btnHist) btnHist.dataset.alunoId = aluno.id;

            tabelaFrequenciaCorpo.appendChild(clone);
        });
    }

    function salvarTodasFrequencias() {
        const dataSelecionada = inputDataFrequencia.value;
        if (!dataSelecionada) {
            window.mostrarToast('aviso', 'Data não Selecionada', 'Por favor, selecione uma data.');
            return;
        }

        if (!registrosFrequencia[dataSelecionada]) {
            registrosFrequencia[dataSelecionada] = {};
        }

        let alteracoesFeitas = 0;
        tabelaFrequenciaCorpo.querySelectorAll('tr').forEach(tr => {
            const alunoId = parseInt(tr.dataset.alunoId);
            if (!alunoId) return;

            const status = tr.querySelector('.select-status-frequencia').value;
            const obs = tr.querySelector('.input-obs-frequencia').value.trim();

            // Salva apenas se houver registro ou observação
            if (status !== 'nao_registrado' || obs !== '') {
                registrosFrequencia[dataSelecionada][alunoId] = { status, obs };
                alteracoesFeitas++;
            } else if (registrosFrequencia[dataSelecionada][alunoId]) {
                // Se estava registrado e agora é 'nao_registrado' sem obs, remove o registro
                delete registrosFrequencia[dataSelecionada][alunoId];
                alteracoesFeitas++;
            }
        });

        if(alteracoesFeitas > 0){
            console.log('Frequências salvas (simulado):', dataSelecionada, registrosFrequencia[dataSelecionada]);
            window.mostrarToast('sucesso', 'Frequências Salvas', `Registros de frequência para ${new Date(dataSelecionada+'T00:00:00').toLocaleDateString('pt-BR')} foram salvos.`);
        } else {
            window.mostrarToast('info', 'Nenhuma Alteração', 'Nenhuma frequência foi alterada para salvar.');
        }
         carregarFrequencia(); // Recarrega para refletir cores nos selects
    }


    function popularFiltrosFrequencia() {
        if (selectTurmaFrequencia && window.turmasDisponiveisGlobais) {
            selectTurmaFrequencia.innerHTML = '<option value="todas">Todas as Turmas</option>';
            window.turmasDisponiveisGlobais.forEach(turma => {
                selectTurmaFrequencia.add(new Option(turma.nome, turma.id));
            });
        }
        if (inputDataFrequencia) {
            inputDataFrequencia.valueAsDate = new Date(); // Data de hoje
        }
    }

    function inicializarModuloFrequencia() {
        if (!secaoFrequencia.classList.contains('ativa')) return;
        if (!window.alunosMatriculados || window.alunosMatriculados.length === 0) {
             tabelaFrequenciaCorpo.innerHTML = '<tr><td colspan="5" class="sem-dados">Não há alunos matriculados no sistema para registrar frequência.</td></tr>';
             console.warn("Módulo Frequência: Nenhum aluno matriculado encontrado.");
             return;
        }
        console.log("Módulo Frequência inicializado com dados.");

        popularFiltrosFrequencia();
        carregarFrequencia();

        inputDataFrequencia?.addEventListener('change', carregarFrequencia);
        selectTurmaFrequencia?.addEventListener('change', carregarFrequencia);

        btnRegistrarTodosPresentes?.addEventListener('click', () => {
            tabelaFrequenciaCorpo.querySelectorAll('.select-status-frequencia').forEach(select => {
                if (select.value === 'nao_registrado') { // Só altera se não estiver já registrado
                    select.value = 'presente';
                     select.className = `select-status-frequencia custom-select-nexus status-presente`;
                }
            });
            window.mostrarToast('info', 'Todos Presentes', 'Status alterado para presente. Clique em Salvar.');
        });

        btnSalvarFrequencias?.addEventListener('click', salvarTodasFrequencias);

        // Delegar evento para botões de histórico (simulado)
        tabelaFrequenciaCorpo?.addEventListener('click', (e) => {
            if(e.target.closest('.btn-historico-aluno')){
                const alunoId = e.target.closest('.btn-historico-aluno').dataset.alunoId;
                const aluno = window.alunosMatriculados.find(a => a.id == alunoId);
                window.mostrarToast('info', `Histórico de ${aluno?.nome || 'Aluno'}`, 'Exibindo histórico de frequência... (Simulado)');
            }
        });
        // Mudar cor do select ao alterar status
        tabelaFrequenciaCorpo?.addEventListener('change', (e) => {
            if(e.target.matches('.select-status-frequencia')){
                const select = e.target;
                select.className = `select-status-frequencia custom-select-nexus status-${select.value}`;
            }
        });
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.target.id === 'frequencia' && entry.target.classList.contains('ativa')) {
                inicializarModuloFrequencia();
            }
        });
    }, { threshold: 0.01 });
    observer.observe(secaoFrequencia);
    window.inicializarModuloFrequencia = inicializarModuloFrequencia;
})();