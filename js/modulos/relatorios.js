// js/modulos/relatorios.js
(function() {
    'use strict';

    const secaoRelatorios = document.getElementById('relatorios');
    if (!secaoRelatorios) return;

    const gridSelecaoRelatorios = secaoRelatorios.querySelector('.grid-selecao-relatorios');
    const containerVisualizacaoRelatorio = secaoRelatorios.querySelector('#container-visualizacao-relatorio');

    function gerarRelatorio(tipoRelatorio) {
        if (!containerVisualizacaoRelatorio) return;
        containerVisualizacaoRelatorio.innerHTML = `<p class="processando-relatorio"><i class="fas fa-spinner fa-spin"></i> Gerando relatório de ${tipoRelatorio.replace('_', ' ')}...</p>`;
        window.mostrarToast('info', 'Gerando Relatório', `Processando dados para ${tipoRelatorio}...`);

        // Simulação de busca de dados e renderização
        setTimeout(() => {
            let conteudoHtml = `<h3>Relatório: ${tipoRelatorio.replace(/_/g, ' ').toUpperCase()}</h3>`;
            switch (tipoRelatorio) {
                case 'frequencia_geral':
                    conteudoHtml += `<p>Aqui seria uma tabela ou gráfico com dados de frequência geral. (Simulado)</p>
                                     <img src="https://via.placeholder.com/600x300/16a085/ffffff?text=Gráfico+Frequência+Geral" alt="Gráfico Frequência" style="width:100%; max-width:600px; margin-top:15px; border-radius:8px;">`;
                    break;
                case 'financeiro_consolidado':
                    conteudoHtml += `<p>Aqui seria um dashboard financeiro com totais. (Simulado)</p>
                                     <ul><li>Total Recebido: R$ 15.500,00</li><li>Total Pendente: R$ 2.300,00</li><li>Inadimplência: 12%</li></ul>`;
                    break;
                case 'matriculas_periodo':
                    conteudoHtml += `<p>Número de novas matrículas no último mês: 25. (Simulado)</p>
                                     <p>Alunos transferidos: 3.</p> <p>Evasões: 1.</p>`;
                    break;
                case 'desempenho_turmas':
                     conteudoHtml += `<p>Tabela comparativa do desempenho e ocupação das turmas. (Simulado)</p>
                                      <img src="https://via.placeholder.com/600x300/2980b9/ffffff?text=Comparativo+Turmas" alt="Comparativo Turmas" style="width:100%; max-width:600px; margin-top:15px; border-radius:8px;">`;
                    break;
                case 'lista_aniversariantes':
                    conteudoHtml += `<h4>Aniversariantes do Mês Atual:</h4>
                                     <ul><li>Joãozinho Silva - Dia 15</li><li>Maria Clara - Dia 22</li><li>Prof. Ana - Dia 05</li></ul>`;
                    break;
                default:
                    conteudoHtml += '<p>Tipo de relatório não reconhecido.</p>';
            }
            conteudoHtml += `<div style="margin-top:20px;"><button class="botao-estilizado secundario com-icone pequeno btn-exportar-relatorio"><i class="fas fa-file-export"></i> Exportar (PDF/Excel)</button></div>`;
            containerVisualizacaoRelatorio.innerHTML = conteudoHtml;
            containerVisualizacaoRelatorio.querySelector('.btn-exportar-relatorio')?.addEventListener('click', () => {
                window.mostrarToast('sucesso', 'Exportação Simulada', 'O relatório seria exportado aqui.');
            });
        }, 1500);
    }


    function inicializarModuloRelatorios() {
        if (!secaoRelatorios.classList.contains('ativa')) return;
        console.log("Módulo Relatórios inicializado.");

        if (gridSelecaoRelatorios) {
            gridSelecaoRelatorios.addEventListener('click', (event) => {
                const itemRelatorio = event.target.closest('.item-selecao-relatorio');
                if (itemRelatorio && itemRelatorio.dataset.tipoRelatorio) {
                    gerarRelatorio(itemRelatorio.dataset.tipoRelatorio);
                    // Adicionar classe 'ativo' ao item selecionado
                    gridSelecaoRelatorios.querySelectorAll('.item-selecao-relatorio').forEach(item => item.classList.remove('ativo'));
                    itemRelatorio.classList.add('ativo');
                }
            });
        }
        // Limpar visualização ao sair da seção ou selecionar outro relatório
        if(containerVisualizacaoRelatorio) containerVisualizacaoRelatorio.innerHTML = '<p class="sem-dados">Selecione um relatório para visualizar.</p>';
        if(gridSelecaoRelatorios) gridSelecaoRelatorios.querySelectorAll('.item-selecao-relatorio').forEach(item => item.classList.remove('ativo'));

    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.target.id === 'relatorios' && entry.target.classList.contains('ativa')) {
                inicializarModuloRelatorios();
            }
        });
    }, { threshold: 0.1 });
    observer.observe(secaoRelatorios);
    window.inicializarModuloRelatorios = inicializarModuloRelatorios;
})();