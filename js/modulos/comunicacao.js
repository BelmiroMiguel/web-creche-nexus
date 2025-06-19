// js/modulos/comunicacao.js
(function() {
    'use strict';

    const secaoComunicacao = document.getElementById('comunicacao');
    if (!secaoComunicacao) { console.warn("Seção Comunicação não encontrada."); return; }

    const formNovoComunicado = secaoComunicacao.querySelector('#form-novo-comunicado');
    const selectTipoDestinatario = secaoComunicacao.querySelector('#tipo-destinatario-comunicado');
    const containerDestinatarioEspecifico = secaoComunicacao.querySelector('#container-destinatario-especifico');
    const selectAlunoEspecifico = secaoComunicacao.querySelector('#select-aluno-especifico');
    const selectTurmaEspecifica = secaoComunicacao.querySelector('#select-turma-especifica');
    const inputTituloComunicado = secaoComunicacao.querySelector('#titulo-comunicado');
    const textareaMensagemComunicado = secaoComunicacao.querySelector('#mensagem-comunicado');
    const checkCanaisEnvio = secaoComunicacao.querySelectorAll('input[name="canal-envio"]');

    const listaHistoricoComunicados = secaoComunicacao.querySelector('#lista-historico-comunicados');
    const templateItemHistorico = document.getElementById('template-item-historico-comunicado');
    const filtroTituloComunicadoEl = secaoComunicacao.querySelector('#filtro-titulo-comunicado');
    const filtroDataComunicadoEl = secaoComunicacao.querySelector('#filtro-data-comunicado');


    let historicoComunicados = [
        { id: Date.now() + 1, data: new Date(2024,2,10,10,30), titulo: "Reunião de Pais - Apresentação Anual", mensagem: "Prezados pais e responsáveis, gostaríamos de convidá-los para nossa reunião anual de apresentação do plano pedagógico e das novidades da Creche Nexus para este ano. Contamos com a sua presença no dia 20/03 às 18h30.", destinatario: "Todos os Responsáveis", canais: ["App Nexus", "Email"] },
        { id: Date.now() + 2, data: new Date(2024,2,12,14,0), titulo: "Material para Aula de Arte - Maternal I", mensagem: "Lembramos aos responsáveis dos alunos do Maternal I - Estrelas que para a aula de arte da próxima quarta-feira, será necessário trazer uma caixa de tinta guache (6 cores) e um avental.", destinatario: "Responsáveis da Turma: Maternal I - Estrelas", canais: ["App Nexus", "WhatsApp (Sim.)"] },
        { id: Date.now() + 3, data: new Date(2024,2,13,9,15), titulo: "Lembrete: Vacinação", mensagem: "Olá Sra. Mariana, mãe da Ana Clara, lembramos que a data da próxima vacina da Ana está se aproximando. Favor verificar a carteirinha.", destinatario: "Responsável de: Ana Clara Souza Alves", canais: ["App Nexus"] }
    ];

    function renderizarHistorico() {
        if (!listaHistoricoComunicados || !templateItemHistorico) return;
        listaHistoricoComunicados.innerHTML = '';

        const filtroTitulo = filtroTituloComunicadoEl?.value.toLowerCase() || '';
        const filtroData = filtroDataComunicadoEl?.value || '';


        const comunicadosFiltrados = historicoComunicados.filter(com => {
            const matchTitulo = com.titulo.toLowerCase().includes(filtroTitulo);
            const matchData = filtroData === '' || com.data.toISOString().slice(0,10) === filtroData;
            return matchTitulo && matchData;
        }).sort((a,b) => b.data - a.data); // Mais recentes primeiro


        if (comunicadosFiltrados.length === 0) {
            listaHistoricoComunicados.innerHTML = '<p class="sem-dados">Nenhum comunicado encontrado.</p>';
            return;
        }

        comunicadosFiltrados.forEach((com, index) => {
            const clone = templateItemHistorico.content.cloneNode(true);
            const itemDiv = clone.querySelector('.item-historico-nexus');
            itemDiv.style.animationDelay = `${index * 0.05}s`;

            clone.querySelector('.historico-titulo').textContent = com.titulo;
            clone.querySelector('.historico-data').textContent = com.data.toLocaleString('pt-BR', {day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit'});
            clone.querySelector('.historico-destinatario').textContent = `${com.destinatario}`;
            clone.querySelector('.historico-canais').textContent = `Canais: ${com.canais.join(', ')}`;
            clone.querySelector('.historico-mensagem-preview').textContent = com.mensagem.substring(0, 120) + (com.mensagem.length > 120 ? '...' : '');
            clone.querySelector('.btn-ver-comunicado').dataset.comunicadoId = com.id;
            clone.querySelector('.btn-reenviar-comunicado').dataset.comunicadoId = com.id;
            listaHistoricoComunicados.appendChild(clone);
        });
    }


    function atualizarVisibilidadeDestinatario() {
        if (!selectTipoDestinatario || !containerDestinatarioEspecifico || !selectAlunoEspecifico || !selectTurmaEspecifica) return;

        const tipo = selectTipoDestinatario.value;
        containerDestinatarioEspecifico.style.display = 'none';
        selectAlunoEspecifico.style.display = 'none';
        selectTurmaEspecifica.style.display = 'none';
        selectAlunoEspecifico.required = false;
        selectTurmaEspecifica.required = false;
        const labelEspecifico = containerDestinatarioEspecifico.querySelector('label');
        if(labelEspecifico) labelEspecifico.remove(); // Remove label antiga

        if (tipo === 'aluno') {
            containerDestinatarioEspecifico.style.display = 'block';
            selectAlunoEspecifico.style.display = 'block';
            selectAlunoEspecifico.required = true;
            if (window.alunosMatriculados) {
                selectAlunoEspecifico.innerHTML = '<option value="">Selecione o Aluno...</option>';
                window.alunosMatriculados.forEach(aluno => {
                    selectAlunoEspecifico.add(new Option(aluno.nome, aluno.id));
                });
            }
            const newLabel = document.createElement('label');
            newLabel.htmlFor = selectAlunoEspecifico.id;
            newLabel.textContent = "Aluno Específico:";
            containerDestinatarioEspecifico.prepend(newLabel);

        } else if (tipo === 'turma') {
            containerDestinatarioEspecifico.style.display = 'block';
            selectTurmaEspecifica.style.display = 'block';
            selectTurmaEspecifica.required = true;
            if (window.turmasDisponiveisGlobais) {
                selectTurmaEspecifica.innerHTML = '<option value="">Selecione a Turma...</option>';
                window.turmasDisponiveisGlobais.forEach(turma => {
                    selectTurmaEspecifica.add(new Option(turma.nome, turma.id));
                });
            }
            const newLabel = document.createElement('label');
            newLabel.htmlFor = selectTurmaEspecifica.id;
            newLabel.textContent = "Turma Específica:";
            containerDestinatarioEspecifico.prepend(newLabel);
        }
    }

    function handleEnviarComunicado(event) {
        event.preventDefault();
        const titulo = inputTituloComunicado.value.trim();
        const mensagem = textareaMensagemComunicado.value.trim();
        const tipoDestinatario = selectTipoDestinatario.value;
        let destinatarioDesc = "Todos os Responsáveis";
        let destinatarioId = null;

        if (tipoDestinatario === 'aluno') {
            destinatarioId = selectAlunoEspecifico.value;
            destinatarioDesc = `Responsável de: ${selectAlunoEspecifico.options[selectAlunoEspecifico.selectedIndex].text}`;
        } else if (tipoDestinatario === 'turma') {
            destinatarioId = selectTurmaEspecifica.value;
            destinatarioDesc = `Responsáveis da Turma: ${selectTurmaEspecifica.options[selectTurmaEspecifica.selectedIndex].text}`;
        }

        const canaisSelecionados = Array.from(checkCanaisEnvio)
                                     .filter(check => check.checked)
                                     .map(check => check.closest('label').textContent.trim());

        if (!titulo || !mensagem || canaisSelecionados.length === 0) {
            window.mostrarToast('aviso', 'Campos Obrigatórios', 'Título, mensagem e pelo menos um canal são necessários.');
            return;
        }
        if ((tipoDestinatario === 'aluno' || tipoDestinatario === 'turma') && !destinatarioId) {
            window.mostrarToast('aviso', 'Destinatário Inválido', 'Selecione um aluno ou turma específica.');
            return;
        }

        window.mostrarToast('info', 'Enviando...', 'Seu comunicado está sendo processado...');
        setTimeout(() => {
            const novoComunicado = {
                id: Date.now(), data: new Date(), titulo, mensagem, destinatario: destinatarioDesc, canais: canaisSelecionados
            };
            historicoComunicados.push(novoComunicado);
            renderizarHistorico();
            formNovoComunicado.reset();
            atualizarVisibilidadeDestinatario();
            window.mostrarToast('sucesso', 'Comunicado Enviado!', 'A mensagem foi enviada com sucesso.');
        }, 1000);
    }

    function handleAcoesHistorico(event){
        const targetButton = event.target.closest('button');
        if(!targetButton) return;
        const comunicadoId = parseInt(targetButton.dataset.comunicadoId);
        const comunicado = historicoComunicados.find(c => c.id === comunicadoId);
        if(!comunicado) return;

        if(targetButton.matches('.btn-ver-comunicado')){
            let htmlConteudoModal = `
                <h4>${comunicado.titulo}</h4>
                <p><strong>Data:</strong> ${comunicado.data.toLocaleString('pt-BR')}</p>
                <p><strong>Para:</strong> ${comunicado.destinatario}</p>
                <p><strong>Canais:</strong> ${comunicado.canais.join(', ')}</p>
                <hr class="divisor-nexus">
                <div class="mensagem-completa-comunicado">${comunicado.mensagem.replace(/\n/g, '<br>')}</div>
            `;
            window.toggleModal('modal-generico', true, htmlConteudoModal, "Detalhes do Comunicado");
             // Se o modal genérico tiver um rodapé padrão, você pode querer limpá-lo ou customizá-lo
            const modalRodape = document.querySelector('#modal-generico #modal-rodape-botoes');
            if (modalRodape) modalRodape.innerHTML = `<button class="botao-estilizado secundario" data-modal-id="modal-generico"><span>Fechar</span></button>`;


        } else if(targetButton.matches('.btn-reenviar-comunicado')){
            if(confirm(`Reenviar o comunicado "${comunicado.titulo}"?`)){
                window.mostrarToast('info', 'Reenviando...', `Reenviando o comunicado: ${comunicado.titulo}`);
                // Simular lógica de reenvio
                setTimeout(() => {
                    window.mostrarToast('sucesso', 'Comunicado Reenviado!', `"${comunicado.titulo}" foi reenviado.`);
                }, 1000);
            }
        }
    }


    function inicializarModuloComunicacao() {
        if (!secaoComunicacao.classList.contains('ativa')) return;
        console.log("Módulo Comunicação inicializado com dados.");

        renderizarHistorico();
        atualizarVisibilidadeDestinatario();

        selectTipoDestinatario?.removeEventListener('change', atualizarVisibilidadeDestinatario);
        selectTipoDestinatario?.addEventListener('change', atualizarVisibilidadeDestinatario);

        formNovoComunicado?.removeEventListener('submit', handleEnviarComunicado);
        formNovoComunicado?.addEventListener('submit', handleEnviarComunicado);

        listaHistoricoComunicados?.removeEventListener('click', handleAcoesHistorico);
        listaHistoricoComunicados?.addEventListener('click', handleAcoesHistorico);

        filtroTituloComunicadoEl?.addEventListener('input', renderizarHistorico);
        filtroDataComunicadoEl?.addEventListener('change', renderizarHistorico);
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.target.id === 'comunicacao' && entry.target.classList.contains('ativa')) {
                inicializarModuloComunicacao();
            }
        });
    }, { threshold: 0.01 });
    observer.observe(secaoComunicacao);
    window.inicializarModuloComunicacao = inicializarModuloComunicacao;
})();