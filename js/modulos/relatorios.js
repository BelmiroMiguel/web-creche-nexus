import { AppService, getEmpresaLogada } from "../app_service.js";
import {
    capitalizeWords,
    formatarData,
    formatarDataInput,
    fotoPreview,
    renderPaginacao,
    toUpperCase,
} from "../utils.js";
import { OnGeneratePdf } from "./build_pdf.js";


(function () {
    'use strict';

    const secaoRelatorios = document.getElementById('relatorios');
    if (!secaoRelatorios) return;

    let turmasCarregadas = [];

    $(sltFiltroTurmaRelatorio).on("input", () => carregarRelatorioConfirmacoes());
    $(sltFiltroStatusRelatorio).on("input", () => carregarRelatorioConfirmacoes());
    $(inpFiltroDataRelatorio).on("input", () => carregarRelatorioConfirmacoes());
    $(btnImprimirRelatorioCentral).on("click", () => gerarRelatorio());
    $(sltFitroEstadoConfirmacaoAlunoMatriculaRelatorio).on("input", () => carregarAlunos());
    $(inpFiltroPeriodoRelatorio).on("input", () => carregarAlunos());

    const gridSelecaoRelatorios = secaoRelatorios.querySelector('.grid-selecao-relatorios');
    const containerVisualizacaoRelatorio = secaoRelatorios.querySelector('#container-visualizacao-relatorio');

    let tipoRelatorioSelecionado = null;
    let confirmacoesCarregadasRelatorio = [];

    function gerarRelatorio() {
        if (!tipoRelatorioSelecionado) return

        $(preload).fadeIn(200);

        switch (tipoRelatorioSelecionado) {
            case 'frequencia_geral':
                break;
            default:
                break;
        }

        $(preload).fadeOut(0);
        print()
    }

    async function carregarRelatorioConfirmacoes() {
        $(btnImprimirRelatorioCentral).fadeOut(0)
        $(labelInfoFiltroVazio).fadeOut(0)
        const turmaSelecionada = turmasCarregadas.find(
            (turma) => turma.idTurma == sltFiltroTurmaRelatorio.value
        );
        const dataFiltro = inpFiltroDataRelatorio.value;

        if (!dataFiltro || !turmaSelecionada) return

        $(labelInfoRelatorio).fadeOut(0)
        $(labelInfoSelecionarFiltroRelatorio).fadeOut(0)
        $(labelLoadRelatorio).fadeIn(0)

        AppService.getData(
            "confirmacoes",
            {
                idTurma: turmaSelecionada.idTurma,
                statusFrequencia: sltFiltroStatusFrequencia.value,
                dataFiltro,
                items: 500000,
                page: 0,
            },
            {
                onSuccess: (res) => {
                    confirmacoesCarregadasRelatorio = res.body;
                    if (!confirmacoesCarregadasRelatorio || !confirmacoesCarregadasRelatorio.length) $(labelInfoFiltroVazio).fadeIn(100)
                    else {
                        $(labelInfoFiltroVazio).fadeOut(0)
                        $(btnImprimirRelatorioCentral).fadeIn(200)
                    }
                },
                onResponse: () => {
                    $(labelInfoSelecionarFiltroRelatorio).fadeIn(100)
                    $(labelLoadRelatorio).fadeOut(0)
                },
            }
        )
    }

    async function carregarAlunos(page = 0) {
        $(btnImprimirRelatorioCentral).fadeOut(0)
        $(labelInfoFiltroVazio).fadeOut(0)

        console.log(inpFiltroPeriodoRelatorio.value);


        if (!inpFiltroPeriodoRelatorio.value) return

        $(labelInfoRelatorio).fadeOut(0)
        $(labelInfoSelecionarFiltroRelatorio).fadeOut(0)
        $(labelLoadRelatorio).fadeIn(0)

        AppService.getData(
            "alunos",
            {
                items: 500000000,
                eliminado: 0,
                periodo: inpFiltroPeriodoRelatorio.value,
                confirmacao_terminado: sltFitroEstadoConfirmacaoAlunoMatriculaRelatorio.value,
            },
            {
                onSuccess: (res) => {
                    paginacaoFunciomario = res.paginacao;
                    renderPaginacao({
                        container: containerPaginacaoMatricula,
                        totalPaginas: paginacaoFunciomario.totalPages,
                        paginaAtual: paginacaoFunciomario.page,
                        totalItens: paginacaoFunciomario.totalItems,
                        onPageClick: (pagina) => carregarAlunos(pagina),
                    });
                    alunosCarregados = res.body;
                    renderizarTabelaAlunos(alunosCarregados);
                },
                onEroor: (res) => {
                    console.log(res);
                },
                onResponse: () => {
                    $(contetMatricula).fadeIn();
                    $(preload).fadeOut();
                },
            }
        );
    }


    async function carregarTurmas() {
        AppService.getData(
            "turmas",
            { eliminado: false, items: 5000000 },
            {
                onSuccess: (res) => {
                    turmasCarregadas = res.body;
                    sltFiltroTurmaRelatorio.innerHTML = "";
                    sltFiltroTurmaRelatorio.innerHTML = `<option value="" selected disabled>Selecione uma turma...</option>`;
                    turmasCarregadas.forEach((turma) => {
                        const option = document.createElement("option");
                        option.value = turma.idTurma;
                        option.textContent = `${turma.nome} (${turma.descFaixaEtaria})`;
                        sltFiltroTurmaRelatorio.appendChild(option);
                    });
                },
                onError: (res) => {
                    console.error(res);
                },
            }
        );
    }


    $(contentFiltro).fadeOut(0)
    $(labelInfoRelatorio).fadeOut(0)
    $(labelInfoSelecionarFiltroRelatorio).fadeOut(0)
    $(labelLoadRelatorio).fadeOut(0)
    $(labelInfoFiltroVazio).fadeOut(0)
    $(btnImprimirRelatorioCentral).fadeOut(0)

    function inicializarModuloRelatorios() {
        if (!secaoRelatorios.classList.contains('ativa')) return;
        $(contentFiltro).fadeOut(0)
        $(preload).fadeOut(0);
        $(labelInfoRelatorio).fadeOut(0)
        $(labelInfoSelecionarFiltroRelatorio).fadeOut(0)
        $(labelLoadRelatorio).fadeOut(0)
        $(labelInfoFiltroVazio).fadeOut(0)
        $(btnImprimirRelatorioCentral).fadeOut(0)

        carregarTurmas()
        gridSelecaoRelatorios.querySelectorAll('.item-selecao-relatorio').forEach(item => item.classList.remove('ativo-relatorio'));
        $(labelInfoRelatorio).fadeIn(1000)

        if (gridSelecaoRelatorios) {
            $(".item-selecao-relatorio").on("click", (event) => {
                const itemRelatorio = event.currentTarget;
                tipoRelatorioSelecionado = itemRelatorio.dataset.tipoRelatorio
                if (contentFiltro.dataset.tipoRelatorio) contentFiltro.classList.remove(contentFiltro.dataset.tipoRelatorio)
                contentFiltro.classList.add(tipoRelatorioSelecionado)
                contentFiltro.dataset.tipoRelatorio = tipoRelatorioSelecionado;

                // Adicionar classe 'ativo' ao item selecionado
                gridSelecaoRelatorios.querySelectorAll('.item-selecao-relatorio').forEach(item => item.classList.remove('ativo-relatorio'));
                itemRelatorio.classList.add('ativo-relatorio');

                $(btnImprimirRelatorioCentral).fadeOut(0)
                $(labelInfoRelatorio).fadeOut(0)
                $(contentFiltro).fadeIn(200)
                $(labelInfoSelecionarFiltroRelatorio).fadeIn(800)
                carregarRelatorioConfirmacoes()
            })
        }
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