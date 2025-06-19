// js/modulos/financeiro.js
(function() {
    'use strict';

    const secaoFinanceiro = document.getElementById('financeiro');
    if (!secaoFinanceiro) { console.warn("Seção Financeiro não encontrada."); return; }

    const inputMesAnoFinanceiro = secaoFinanceiro.querySelector('#mes-ano-financeiro');
    const filtroStatusFinanceiro = secaoFinanceiro.querySelector('#filtro-status-financeiro');
    const tabelaFinanceiroCorpo = secaoFinanceiro.querySelector('#tabela-financeiro-corpo');
    const templateLinhaFinanceiro = document.getElementById('template-linha-financeiro');
    const resumoFinanceiroContainer = secaoFinanceiro.querySelector('#resumo-financeiro-container');
    const btnLancarMensalidadesLote = secaoFinanceiro.querySelector('#btn-lancar-mensalidades-lote');

    // Dados simulados de mensalidades
    // Chave: alunoId, sub-chave: 'YYYY-MM'
    let dadosFinanceiros = {}; // Será populado

    function popularDadosFinanceirosIniciais() {
        if (Object.keys(dadosFinanceiros).length > 0 || !window.alunosMatriculados) return;

        window.alunosMatriculados.forEach((aluno, index) => {
            dadosFinanceiros[aluno.id] = {};
            const hoje = new Date();
            const anoAtual = hoje.getFullYear();
            const mesAtual = hoje.getMonth(); // 0-11

            // Gerar para os últimos 3 meses e o atual
            for (let i = -2; i <= 0; i++) {
                let mesIter = mesAtual + i;
                let anoIter = anoAtual;
                if (mesIter < 0) {
                    mesIter += 12;
                    anoIter--;
                }
                const mesAnoChave = `${anoIter}-${String(mesIter + 1).padStart(2, '0')}`;
                const diaVencimento = 10;
                let status = 'pendente';
                let dataPagamento = null;

                if (index % 3 === 0 && i < 0) { // Alguns pagos
                    status = 'pago';
                    dataPagamento = `${anoIter}-${String(mesIter + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * diaVencimento) + 1).padStart(2, '0')}`;
                } else if (index % 4 === 0 && i === -2) { // Um vencido
                    status = 'vencido';
                } else if (i === 0 && new Date(anoIter, mesIter, diaVencimento) > hoje) { // Pendente se vencimento futuro
                    status = 'pendente';
                } else if (i < 0) { // Outros pendentes para meses anteriores (se não pagos)
                     status = 'vencido';
                }


                dadosFinanceiros[aluno.id][mesAnoChave] = {
                    valor: parseFloat((400 + (aluno.id % 5) * 25).toFixed(2)), // Valor variado
                    status: status,
                    vencimento: `${String(diaVencimento).padStart(2, '0')}/${String(mesIter + 1).padStart(2, '0')}/${anoIter}`,
                    dataPagamento: dataPagamento
                };
            }
        });
        // console.log("Dados Financeiros Iniciais Populados:", JSON.stringify(dadosFinanceiros, null, 2));
    }


    function formatarMoeda(valor) {
        if (typeof valor !== 'number') return '-';
        return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function carregarDadosFinanceiros() {
        if (!inputMesAnoFinanceiro || !tabelaFinanceiroCorpo || !templateLinhaFinanceiro || !window.alunosMatriculados) return;

        const mesAnoSelecionado = inputMesAnoFinanceiro.value; // Formato YYYY-MM
        const statusFiltrado = filtroStatusFinanceiro?.value || '';

        if (!mesAnoSelecionado) {
            tabelaFinanceiroCorpo.innerHTML = '<tr><td colspan="7" class="sem-dados">Selecione um mês/ano para visualizar.</td></tr>';
            if (resumoFinanceiroContainer) resumoFinanceiroContainer.innerHTML = '';
            return;
        }

        tabelaFinanceiroCorpo.innerHTML = '';
        let totalRecebido = 0, totalPendente = 0, totalVencido = 0, countVisiveis = 0;

        window.alunosMatriculados.forEach((aluno, index) => {
            const mensalidade = dadosFinanceiros[aluno.id]?.[mesAnoSelecionado];
            const statusAtual = mensalidade ? mensalidade.status : 'nao_aplicavel';

            if (statusFiltrado && statusFiltrado !== statusAtual) {
                return; // Pula se não corresponder ao filtro de status
            }
            countVisiveis++;

            const clone = templateLinhaFinanceiro.content.cloneNode(true);
            const tr = clone.querySelector('tr');
            tr.style.animationDelay = `${index * 0.03}s`; // Animação escalonada

            clone.querySelector('.financeiro-aluno').textContent = aluno.nome;
            clone.querySelector('.financeiro-responsavel').textContent = aluno.responsavel || 'N/D';

            if (mensalidade) {
                clone.querySelector('.financeiro-valor').textContent = formatarMoeda(mensalidade.valor);
                clone.querySelector('.financeiro-status').innerHTML = `<span class="status-chip status-${mensalidade.status}">${mensalidade.status.replace(/_/g, ' ').toUpperCase()}</span>`;
                clone.querySelector('.financeiro-vencimento').textContent = mensalidade.vencimento;
                clone.querySelector('.financeiro-data-pagamento').textContent = mensalidade.dataPagamento ? new Date(mensalidade.dataPagamento + 'T00:00:00').toLocaleDateString('pt-BR') : '-';

                let acoesHtml = '';
                if (mensalidade.status === 'pago') {
                    acoesHtml = `<button class="botao-pequeno-nexus info btn-emitir-recibo" data-aluno-id="${aluno.id}" data-mes-ano="${mesAnoSelecionado}" title="Emitir Recibo"><i class="fas fa-receipt"></i></button>`;
                    totalRecebido += mensalidade.valor;
                } else if (mensalidade.status === 'pendente' || mensalidade.status === 'vencido') {
                    acoesHtml = `<button class="botao-pequeno-nexus sucesso btn-registrar-pagamento" data-aluno-id="${aluno.id}" data-mes-ano="${mesAnoSelecionado}" title="Registrar Pagamento"><i class="fas fa-check-circle"></i></button>
                                 <button class="botao-pequeno-nexus alerta btn-notificar-divida" data-aluno-id="${aluno.id}" data-mes-ano="${mesAnoSelecionado}" title="Notificar Responsável"><i class="fas fa-bell"></i></button>`;
                    if (mensalidade.status === 'pendente') totalPendente += mensalidade.valor;
                    if (mensalidade.status === 'vencido') totalVencido += mensalidade.valor;
                }
                 acoesHtml += ` <button class="botao-pequeno-nexus editar btn-editar-cobranca" data-aluno-id="${aluno.id}" data-mes-ano="${mesAnoSelecionado}" title="Editar Cobrança"><i class="fas fa-edit"></i></button>`;
                clone.querySelector('.financeiro-acoes').innerHTML = acoesHtml;
            } else {
                clone.querySelector('.financeiro-valor').textContent = '-';
                clone.querySelector('.financeiro-status').innerHTML = `<span class="status-chip nao-aplicavel">Não Lançado</span>`;
                clone.querySelector('.financeiro-vencimento').textContent = '-';
                clone.querySelector('.financeiro-data-pagamento').textContent = '-';
                clone.querySelector('.financeiro-acoes').innerHTML = `<button class="botao-pequeno-nexus primario btn-lancar-cobranca" data-aluno-id="${aluno.id}" data-mes-ano="${mesAnoSelecionado}" title="Lançar Cobrança"><i class="fas fa-plus-circle"></i> Lançar</button>`;
            }
            tabelaFinanceiroCorpo.appendChild(clone);
        });
        
        if(countVisiveis === 0){
            tabelaFinanceiroCorpo.innerHTML = `<tr><td colspan="7" class="sem-dados">Nenhum registro financeiro encontrado para os filtros aplicados.</td></tr>`;
        }


        if (resumoFinanceiroContainer) {
            resumoFinanceiroContainer.innerHTML = `
                <div class="resumo-item recebido"><strong>Recebido:</strong> ${formatarMoeda(totalRecebido)}</div>
                <div class="resumo-item pendente"><strong>Pendente:</strong> ${formatarMoeda(totalPendente)}</div>
                <div class="resumo-item vencido"><strong>Vencido:</strong> ${formatarMoeda(totalVencido)}</div>
            `;
        }
    }

    function handleAcoesFinanceiro(event) {
        const target = event.target.closest('button');
        if (!target) return;

        const alunoId = parseInt(target.dataset.alunoId);
        const mesAno = target.dataset.mesAno;
        const aluno = window.alunosMatriculados.find(a => a.id === alunoId);

        if (target.matches('.btn-registrar-pagamento')) {
            if (confirm(`Registrar pagamento para ${aluno?.nome} referente a ${mesAno}?`)) {
                dadosFinanceiros[alunoId][mesAno].status = 'pago';
                dadosFinanceiros[alunoId][mesAno].dataPagamento = new Date().toISOString().slice(0,10); // Formato YYYY-MM-DD
                window.mostrarToast('sucesso', 'Pagamento Registrado', `Mensalidade de ${aluno?.nome} (${mesAno}) marcada como paga.`);
                carregarDadosFinanceiros();
            }
        } else if (target.matches('.btn-lancar-cobranca')) {
            if (confirm(`Lançar cobrança para ${aluno?.nome} referente a ${mesAno}?`)) {
                if (!dadosFinanceiros[alunoId]) dadosFinanceiros[alunoId] = {};
                dadosFinanceiros[alunoId][mesAno] = {
                    valor: parseFloat((400 + (alunoId % 5) * 25).toFixed(2)), // Valor padrão simulado
                    status: 'pendente',
                    vencimento: `10/${mesAno.substring(5)}/${mesAno.substring(0,4)}`,
                    dataPagamento: null
                };
                window.mostrarToast('sucesso', 'Cobrança Lançada', `Mensalidade para ${aluno?.nome} (${mesAno}) lançada.`);
                carregarDadosFinanceiros();
            }
        } else if (target.matches('.btn-emitir-recibo')) {
            window.mostrarToast('info', 'Recibo (Simulado)', `Emitindo recibo para ${aluno?.nome} de ${mesAno}. (Funcionalidade a implementar)`);
        } else if (target.matches('.btn-notificar-divida')) {
            window.mostrarToast('info', 'Notificação (Simulada)', `Enviando notificação para responsável de ${aluno?.nome} sobre débito de ${mesAno}.`);
        } else if (target.matches('.btn-editar-cobranca')) {
            window.mostrarToast('info', 'Editar Cobrança (Simulado)', `Abrindo formulário para editar cobrança de ${aluno?.nome} (${mesAno}).`);
            // Lógica para abrir modal de edição
        }
    }


    function inicializarModuloFinanceiro() {
        if (!secaoFinanceiro.classList.contains('ativa')) return;
         if (!window.alunosMatriculados || window.alunosMatriculados.length === 0) {
             tabelaFinanceiroCorpo.innerHTML = '<tr><td colspan="7" class="sem-dados">Não há alunos matriculados para exibir dados financeiros.</td></tr>';
             console.warn("Módulo Financeiro: Nenhum aluno matriculado encontrado.");
             return;
        }
        console.log("Módulo Financeiro inicializado com dados.");

        popularDadosFinanceirosIniciais(); // Popula dados de exemplo

        if (inputMesAnoFinanceiro) {
            const hoje = new Date();
            inputMesAnoFinanceiro.value = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
            inputMesAnoFinanceiro.addEventListener('change', carregarDadosFinanceiros);
        }
        filtroStatusFinanceiro?.addEventListener('change', carregarDadosFinanceiros);

        if (tabelaFinanceiroCorpo) {
            tabelaFinanceiroCorpo.removeEventListener('click', handleAcoesFinanceiro);
            tabelaFinanceiroCorpo.addEventListener('click', handleAcoesFinanceiro);
        }

        btnLancarMensalidadesLote?.addEventListener('click', () => {
            const mesAnoParaLancar = inputMesAnoFinanceiro.value;
            if(!mesAnoParaLancar){
                window.mostrarToast('aviso', 'Mês/Ano Necessário', 'Selecione um mês/ano para o lançamento em lote.');
                return;
            }
            if(confirm(`Lançar mensalidades para TODOS os alunos ativos referente a ${mesAnoParaLancar}? (Alunos já com lançamento para este mês não serão afetados).`)){
                let lancamentosFeitos = 0;
                window.alunosMatriculados.forEach(aluno => {
                    if(!dadosFinanceiros[aluno.id]) dadosFinanceiros[aluno.id] = {};
                    if(!dadosFinanceiros[aluno.id][mesAnoParaLancar]){ // Só lança se não existir
                         dadosFinanceiros[aluno.id][mesAnoParaLancar] = {
                            valor: parseFloat((400 + (aluno.id % 5) * 25).toFixed(2)),
                            status: 'pendente',
                            vencimento: `10/${mesAnoParaLancar.substring(5)}/${mesAnoParaLancar.substring(0,4)}`,
                            dataPagamento: null
                        };
                        lancamentosFeitos++;
                    }
                });
                if(lancamentosFeitos > 0){
                    window.mostrarToast('sucesso', 'Lançamento em Lote', `${lancamentosFeitos} mensalidades lançadas para ${mesAnoParaLancar}.`);
                    carregarDadosFinanceiros();
                } else {
                    window.mostrarToast('info', 'Nenhum Lançamento Novo', `Todos os alunos já possuem lançamento para ${mesAnoParaLancar}.`);
                }
            }
        });

        carregarDadosFinanceiros(); // Carga inicial
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.target.id === 'financeiro' && entry.target.classList.contains('ativa')) {
                inicializarModuloFinanceiro();
            }
        });
    }, { threshold: 0.01 });
    observer.observe(secaoFinanceiro);
    window.inicializarModuloFinanceiro = inicializarModuloFinanceiro;
})();