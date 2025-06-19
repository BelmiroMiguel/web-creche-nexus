// js/modulos/eventos.js
(function() {
    'use strict';

    const secaoEventos = document.getElementById('eventos');
    if (!secaoEventos) return;

    const calendarioContainer = secaoEventos.querySelector('#calendario-plugin-container');
    const listaProximosEventos = secaoEventos.querySelector('#lista-proximos-eventos');
    const btnNovoEvento = secaoEventos.querySelector('#btn-novo-evento-calendario');
    const templateItemEvento = document.getElementById('template-item-evento');

    // Dados simulados
    let eventosAgendados = [
        { id: 1, titulo: 'Reunião de Pais - Berçário', dataInicio: new Date(2024, 3, 25, 18, 0), dataFim: new Date(2024, 3, 25, 19, 30), descricao: 'Discussão sobre o desenvolvimento e próximas atividades.', tipo: 'reuniao', cor: '#2980b9' },
        { id: 2, titulo: 'Festa da Primavera', dataInicio: new Date(2024, 4, 10, 14, 0), dataFim: new Date(2024, 4, 10, 17, 0), descricao: 'Celebração com atividades ao ar livre e lanche.', tipo: 'festa', cor: '#27ae60' },
        { id: 3, titulo: 'Dia do Brinquedo', dataInicio: new Date(2024, 3, 28, 8,0), dataFim: new Date(2024,3,28,17,0), descricao: 'Crianças podem trazer um brinquedo de casa.', tipo: 'atividade', cor: '#d35400' },
        { id: 4, titulo: 'Feriado: Dia do Trabalho', dataInicio: new Date(2024, 4, 1, 0, 0), dataFim: new Date(2024, 4, 1, 23, 59), descricao: 'Creche fechada.', tipo: 'feriado', cor: '#c0392b' }
    ];

    function renderizarListaProximosEventos() {
        if (!listaProximosEventos || !templateItemEvento) return;
        listaProximosEventos.innerHTML = '';

        const agora = new Date();
        const eventosFuturos = eventosAgendados
            .filter(evento => evento.dataFim >= agora)
            .sort((a, b) => a.dataInicio - b.dataInicio)
            .slice(0, 5); // Mostrar os próximos 5

        if (eventosFuturos.length === 0) {
            listaProximosEventos.innerHTML = '<p class="sem-dados">Nenhum evento próximo agendado.</p>';
            return;
        }

        eventosFuturos.forEach(evento => {
            const clone = templateItemEvento.content.cloneNode(true);
            const item = clone.querySelector('.item-evento-nexus');
            if(item) item.style.setProperty('--cor-app', evento.cor || 'var(--cor-primaria-claro)');

            clone.querySelector('.evento-dia').textContent = evento.dataInicio.getDate();
            clone.querySelector('.evento-mes').textContent = evento.dataInicio.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase().replace('.','');
            clone.querySelector('.evento-titulo').textContent = evento.titulo;
            clone.querySelector('.evento-descricao-curta').textContent = evento.descricao.substring(0,70) + '...';
            clone.querySelector('.evento-horario').innerHTML = `<i class="fas fa-clock"></i> ${evento.dataInicio.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})} - ${evento.dataFim.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}`;
            clone.querySelector('.btn-ver-detalhes-evento').dataset.eventoId = evento.id;

            listaProximosEventos.appendChild(clone);
        });
    }

    function inicializarCalendarioPlugin() {
        // Esta é uma SIMULAÇÃO. Para um calendário real, você integraria uma lib como FullCalendar.
        if (!calendarioContainer) return;
        calendarioContainer.innerHTML = `
            <div style="border:2px dashed var(--cor-borda-claro); padding:20px; text-align:center; border-radius:var(--raio-borda-padrao);">
                <i class="fas fa-calendar-alt fa-3x" style="color:var(--cor-primaria-claro); opacity:0.5; margin-bottom:15px;"></i>
                <p><strong>Simulação de Calendário Interativo</strong></p>
                <p>Aqui seria integrado um plugin como FullCalendar para visualização e gerenciamento de eventos.</p>
                <p>Eventos agendados apareceriam aqui e seriam clicáveis.</p>
            </div>
        `;
        // Exemplo com FullCalendar (requer inclusão da lib no HTML):
        // var calendar = new FullCalendar.Calendar(calendarioContainer, {
        //   initialView: 'dayGridMonth',
        //   locale: 'pt-br',
        //   events: eventosAgendados.map(e => ({ title: e.titulo, start: e.dataInicio, end: e.dataFim, color: e.cor, extendedProps: {id: e.id, descricao: e.descricao} })),
        //   eventClick: function(info) {
        //     window.mostrarToast('info', info.event.title, info.event.extendedProps.descricao.substring(0,100) + '...');
        //     // Abrir modal com detalhes do evento
        //   }
        // });
        // calendar.render();
    }

    function handleAcoesEventos(event){
         const target = event.target.closest('button');
        if(!target || !target.matches('.btn-ver-detalhes-evento')) return;
        const eventoId = parseInt(target.dataset.eventoId);
        const evento = eventosAgendados.find(e => e.id === eventoId);
        if(evento){
            // Simular abertura de modal com detalhes
            window.mostrarToast('info', evento.titulo, `Detalhes: ${evento.descricao} (Simulado)`);
            // Exemplo: window.abrirModalComDados('modal-detalhes-evento', evento);
        }
    }


    function inicializarModuloEventos() {
        if (!secaoEventos.classList.contains('ativa')) return;
        console.log("Módulo Calendário/Eventos inicializado.");

        inicializarCalendarioPlugin();
        renderizarListaProximosEventos();

        btnNovoEvento?.addEventListener('click', () => {
            window.mostrarToast('info', 'Novo Evento', 'Abrindo formulário para agendar novo evento (Simulado).');
            // Lógica para abrir modal/form de novo evento
        });

        if(listaProximosEventos){
            listaProximosEventos.removeEventListener('click', handleAcoesEventos);
            listaProximosEventos.addEventListener('click', handleAcoesEventos);
        }
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.target.id === 'eventos' && entry.target.classList.contains('ativa')) {
                inicializarModuloEventos();
            }
        });
    }, { threshold: 0.1 });
    observer.observe(secaoEventos);
    window.inicializarModuloEventos = inicializarModuloEventos;
})();