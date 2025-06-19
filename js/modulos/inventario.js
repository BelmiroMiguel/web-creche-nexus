// js/modulos/inventario.js
(function() {
    'use strict';

    const secaoInventario = document.getElementById('inventario');
    if (!secaoInventario) return;

    const btnNovoItem = secaoInventario.querySelector('#btn-novo-item-inventario');
    const filtroNomeItem = secaoInventario.querySelector('#filtro-nome-item-inventario');
    const filtroCategoria = secaoInventario.querySelector('#filtro-categoria-inventario');
    const tabelaInventarioCorpo = secaoInventario.querySelector('#tabela-inventario-corpo');
    const templateLinhaInventario = document.getElementById('template-linha-inventario');

    let itensInventario = [
        { id: 1, nome: 'Giz de Cera (Caixa Grande)', categoria: 'pedagogico', qtdEstoque: 15, qtdMinima: 5, ultimaReposicao: '2024-02-20' },
        { id: 2, nome: 'Papel Sulfite A4 (Resma)', categoria: 'escritorio', qtdEstoque: 8, qtdMinima: 3, ultimaReposicao: '2024-03-01' },
        { id: 3, nome: 'Álcool em Gel 70% (Litro)', categoria: 'limpeza', qtdEstoque: 3, qtdMinima: 2, ultimaReposicao: '2024-03-10' },
        { id: 4, nome: 'Massinha de Modelar (Kit)', categoria: 'pedagogico', qtdEstoque: 1, qtdMinima: 5, ultimaReposicao: '2024-01-15' },
        { id: 5, nome: 'Leite em Pó (Lata)', categoria: 'alimentos', qtdEstoque: 12, qtdMinima: 4, ultimaReposicao: '2024-03-05' },
    ];

    function calcularStatusItem(item) {
        if (item.qtdEstoque <= 0) return { texto: 'Esgotado', classe: 'esgotado' };
        if (item.qtdEstoque <= item.qtdMinima) return { texto: 'Baixo', classe: 'baixo' };
        if (item.qtdEstoque <= item.qtdMinima * 1.5) return { texto: 'Atenção', classe: 'atencao' }; // Ex: 50% acima do mínimo
        return { texto: 'OK', classe: 'ok' };
    }

    function renderizarTabelaInventario(filtroN = '', filtroC = '') {
        if (!tabelaInventarioCorpo || !templateLinhaInventario) return;
        tabelaInventarioCorpo.innerHTML = '';

        const itensFiltrados = itensInventario.filter(item =>
            (item.nome.toLowerCase().includes(filtroN.toLowerCase()) || item.categoria.toLowerCase().includes(filtroN.toLowerCase())) &&
            (filtroC === '' || item.categoria === filtroC)
        );

        if (itensFiltrados.length === 0) {
            tabelaInventarioCorpo.innerHTML = `<tr><td colspan="7" class="sem-dados">Nenhum item encontrado.</td></tr>`;
            return;
        }

        itensFiltrados.forEach(item => {
            const clone = templateLinhaInventario.content.cloneNode(true);
            const statusInfo = calcularStatusItem(item);

            clone.querySelector('.inventario-nome-item').textContent = item.nome;
            clone.querySelector('.inventario-categoria').textContent = item.categoria.charAt(0).toUpperCase() + item.categoria.slice(1);
            clone.querySelector('.inventario-qtd-estoque').textContent = item.qtdEstoque;
            clone.querySelector('.inventario-qtd-minima').textContent = item.qtdMinima;
            clone.querySelector('.inventario-status').innerHTML = `<span class="status-chip status-inventario-${statusInfo.classe}">${statusInfo.texto}</span>`;
            clone.querySelector('.inventario-ultima-reposicao').textContent = item.ultimaReposicao ? new Date(item.ultimaReposicao + 'T00:00:00').toLocaleDateString('pt-BR') : '-';

            const acoesCell = clone.querySelector('.inventario-acoes');
            acoesCell.innerHTML = `
                <button class="botao-pequeno-nexus sucesso btn-registrar-entrada" data-id="${item.id}" title="Registrar Entrada"><i class="fas fa-plus-circle"></i></button>
                <button class="botao-pequeno-nexus alerta btn-registrar-saida" data-id="${item.id}" title="Registrar Saída/Uso"><i class="fas fa-minus-circle"></i></button>
                <button class="botao-pequeno-nexus editar btn-editar-item-inventario" data-id="${item.id}" title="Editar Item"><i class="fas fa-edit"></i></button>
            `;
            tabelaInventarioCorpo.appendChild(clone);
        });
    }

    function handleAcoesInventario(event){
        const target = event.target.closest('button');
        if(!target) return;
        const itemId = parseInt(target.dataset.id);
        const item = itensInventario.find(i => i.id === itemId);
        if(!item) return;

        if(target.matches('.btn-registrar-entrada')){
            const qtd = parseInt(prompt(`Registrar entrada para "${item.nome}". Quantidade:`, "1"));
            if(!isNaN(qtd) && qtd > 0){
                item.qtdEstoque += qtd;
                item.ultimaReposicao = new Date().toISOString().slice(0,10);
                renderizarTabelaInventario(filtroNomeItem?.value, filtroCategoria?.value);
                window.mostrarToast('sucesso', 'Entrada Registrada', `${qtd} unidade(s) de ${item.nome} adicionada(s).`);
            }
        } else if(target.matches('.btn-registrar-saida')){
             const qtd = parseInt(prompt(`Registrar saída/uso para "${item.nome}". Quantidade:`, "1"));
            if(!isNaN(qtd) && qtd > 0 && qtd <= item.qtdEstoque){
                item.qtdEstoque -= qtd;
                renderizarTabelaInventario(filtroNomeItem?.value, filtroCategoria?.value);
                window.mostrarToast('sucesso', 'Saída Registrada', `${qtd} unidade(s) de ${item.nome} removida(s).`);
            } else if (qtd > item.qtdEstoque) {
                window.mostrarToast('erro', 'Estoque Insuficiente', `Não há ${qtd} unidades de ${item.nome} em estoque.`);
            }
        } else if(target.matches('.btn-editar-item-inventario')){
            window.mostrarToast('info', 'Editar Item', `Abrindo formulário para editar ${item.nome} (Simulado).`);
            // Abrir modal/form de edição
        }
    }

    function inicializarModuloInventario() {
        if (!secaoInventario.classList.contains('ativa')) return;
        console.log("Módulo Inventário inicializado.");

        renderizarTabelaInventario();

        btnNovoItem?.addEventListener('click', () => {
            window.mostrarToast('info', 'Novo Item', 'Abrindo formulário de cadastro de item (Simulado).');
            // Abrir modal/form
        });
        filtroNomeItem?.addEventListener('input', (e) => renderizarTabelaInventario(e.target.value, filtroCategoria?.value));
        filtroCategoria?.addEventListener('change', (e) => renderizarTabelaInventario(filtroNomeItem?.value, e.target.value));

        if(tabelaInventarioCorpo){
            tabelaInventarioCorpo.removeEventListener('click', handleAcoesInventario);
            tabelaInventarioCorpo.addEventListener('click', handleAcoesInventario);
        }
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.target.id === 'inventario' && entry.target.classList.contains('ativa')) {
                inicializarModuloInventario();
            }
        });
    }, { threshold: 0.1 });
    observer.observe(secaoInventario);
    window.inicializarModuloInventario = inicializarModuloInventario;
})();