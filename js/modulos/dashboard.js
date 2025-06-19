// js/modulos/dashboard.js

import { AppService, armazenamento } from "./../app_service.js";

window.NexusDashboard = (function () {

    btnSair.addEventListener('click', () => {
        armazenamento.clear()
        window.location.href = 'login.html'
    })


    // --- DADOS DE EXEMPLO ---
    const dadosMatriculasMes = [
        { mes: 'Jan', valor: 12, cor: '#81C784' },
        { mes: 'Fev', valor: 16, cor: '#64B5F6' },
        { mes: 'Mar', valor: 10, cor: '#FFB74D' },
        { mes: 'Abr', valor: 14, cor: '#E57373' },
        { mes: 'Mai', valor: 18, cor: '#BA68C8' }
    ];

    const atividadesRecentesExemplo = [
        { icone: 'fa-user-plus', corIcone: '#2ecc71', descricao: 'Nova matrícula: <strong>Lucas Pereira</strong> (Turma Berçário II)', tempo: 'Há 5 min' },
        { icone: 'fa-file-invoice-dollar', corIcone: '#f1c40f', descricao: 'Pagamento recebido de <strong>Ana Silva</strong> (Mensalidade Março)', tempo: 'Há 2 horas' },
        { icone: 'fa-bullhorn', corIcone: '#3498db', descricao: 'Comunicado enviado: <strong>"Reunião de Pais - Abril"</strong>', tempo: 'Ontem' },
        { icone: 'fa-calendar-check', corIcone: '#FF8A65', descricao: 'Frequência registrada para Turma Maternal I.', tempo: 'Ontem' },
        { icone: 'fa-exchange-alt', corIcone: '#54a0ff', descricao: 'Entrada registrada: <strong>Maria Clara</strong> às 08:02.', tempo: 'Hoje' },
        { icone: 'fa-boxes-stacked', corIcone: '#e67e22', descricao: 'Item <strong>"Giz de Cera (Cx)"</strong> baixo no inventário.', tempo: '2 dias atrás' }
    ];


    // --- SELETORES ---
    let graficoContainerEl, listaAtividadesContainerEl;

    // --- FUNÇÕES ---
    function popularGraficoMatriculas() {
        if (!graficoContainerEl) return;
        graficoContainerEl.innerHTML = ''; // Limpa antes de popular

        const maiorValor = Math.max(...dadosMatriculasMes.map(d => d.valor), 0);

        dadosMatriculasMes.forEach(dado => {
            const barraEl = document.createElement('div');
            barraEl.classList.add('barra-grafico-dash');
            barraEl.style.height = maiorValor > 0 ? `${(dado.valor / maiorValor) * 90}%` : '0%'; // 90% para não colar no topo
            barraEl.style.backgroundColor = dado.cor;
            barraEl.title = `${dado.mes}: ${dado.valor} matrículas`;

            const spanMesEl = document.createElement('span');
            spanMesEl.textContent = dado.mes;
            barraEl.appendChild(spanMesEl);

            graficoContainerEl.appendChild(barraEl);
        });
    }

    function popularListaAtividades() {
        if (!listaAtividadesContainerEl) return;
        listaAtividadesContainerEl.innerHTML = ''; // Limpa

        if (atividadesRecentesExemplo.length === 0) {
            listaAtividadesContainerEl.innerHTML = '<li class="sem-dados">Nenhuma atividade recente.</li>';
            return;
        }

        atividadesRecentesExemplo.forEach(atividade => {
            const itemLi = document.createElement('li');
            itemLi.classList.add('item-atividade', 'animar-item-lista'); // Adicionar classe de animação se houver

            itemLi.innerHTML = `
                <i class="fas ${atividade.icone} icone-atividade-lista" style="color: ${atividade.corIcone};" aria-hidden="true"></i>
                <div class="info-atividade">
                    <span class="descricao-atividade">${atividade.descricao}</span>
                    <span class="tempo-atividade"><i class="fas fa-clock" aria-hidden="true"></i> ${atividade.tempo}</span>
                </div>
            `;
            listaAtividadesContainerEl.appendChild(itemLi);
        });
    }

    function carregarDadosDashboard() {
        popularGraficoMatriculas();
        popularListaAtividades();
        // Disparar evento para script.js saber que conteúdo foi carregado e re-aplicar VanillaTilt se necessário
        document.dispatchEvent(new CustomEvent('nexusContentLoaded', { detail: { container: document.getElementById('dashboard') } }));
    }

    function init() {
        graficoContainerEl = document.getElementById('grafico-matriculas-mes');
        listaAtividadesContainerEl = document.getElementById('lista-atividades-recentes-dashboard');

        // Carrega dados quando a seção do dashboard é mostrada
        document.addEventListener('nexusSecaoCarregada', (event) => {
            if (event.detail.idSecao === 'dashboard') {
                // Os contadores já são animados pelo script.js, mas podemos forçar se necessário
                // Ou carregar dados específicos do dashboard aqui
                carregarDadosDashboard();
            }
        });

        // Se o dashboard for a primeira seção carregada, carregar dados imediatamente
        if (document.getElementById('dashboard')?.classList.contains('ativa')) {
            carregarDadosDashboard();
        }

        console.log("Módulo Dashboard Nexus OS Inicializado.");
    }

    return {
        init: init
    };
})();