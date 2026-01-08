import { AppService } from "../app_service.js";
import { formatarData, formatMoney, renderPaginacao } from "../utils.js";

// js/modulos/financeiro.js
(function () {
  "use strict";

  const secaoFinanceiro = document.getElementById("financeiro");
  if (!secaoFinanceiro) {
    console.warn("Seção Financeiro não encontrada.");
    return;
  }

  $("#inpFiltroPagamentos").on("input", () => carregarDadosFinanceiros(0));
  $("#sltFitroEstadoPagamentos").on("change", () =>
    carregarDadosFinanceiros(0)
  );

  $("#inpFiltroMesesPagamentos").on("input", function () {
    let value = $(this).val();

    if (!value) {
      let hoje = new Date();
      let mes = String(hoje.getMonth() + 1).padStart(2, "0");
      let ano = hoje.getFullYear();
      let atual = `${ano}-${mes}`;

      $(this).val(atual);
    }
    carregarDadosFinanceiros(0);
  });

  // Dados simulados de mensalidades
  // Chave: alunoId, sub-chave: 'YYYY-MM'
  let dadosFinanceiros = {}; // Será populado

  let confiracoesCarregadas = [];
  let paginacaoConfirmacoes = {
    page: 0,
    totalPages: 0,
    totalItems: 0,
    items: 15,
  };

  function popularDadosFinanceirosIniciais() {
    if (Object.keys(dadosFinanceiros).length > 0 || !window.alunosMatriculados)
      return;

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
        const mesAnoChave = `${anoIter}-${String(mesIter + 1).padStart(
          2,
          "0"
        )}`;
        const diaVencimento = 10;
        let status = "pendente";
        let dataPagamento = null;

        if (index % 3 === 0 && i < 0) {
          // Alguns pagos
          status = "pago";
          dataPagamento = `${anoIter}-${String(mesIter + 1).padStart(
            2,
            "0"
          )}-${String(Math.floor(Math.random() * diaVencimento) + 1).padStart(
            2,
            "0"
          )}`;
        } else if (index % 4 === 0 && i === -2) {
          // Um vencido
          status = "vencido";
        } else if (
          i === 0 &&
          new Date(anoIter, mesIter, diaVencimento) > hoje
        ) {
          // Pendente se vencimento futuro
          status = "pendente";
        } else if (i < 0) {
          // Outros pendentes para meses anteriores (se não pagos)
          status = "vencido";
        }

        dadosFinanceiros[aluno.id][mesAnoChave] = {
          valor: parseFloat((400 + (aluno.id % 5) * 25).toFixed(2)), // Valor variado
          status: status,
          vencimento: `${String(diaVencimento).padStart(2, "0")}/${String(
            mesIter + 1
          ).padStart(2, "0")}/${anoIter}`,
          dataPagamento: dataPagamento,
        };
      }
    });
    // console.log("Dados Financeiros Iniciais Populados:", JSON.stringify(dadosFinanceiros, null, 2));
  }

  function formatarMoeda(valor) {
    if (typeof valor !== "number") return "-";
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function countAlunosMensalidades() {
    AppService.getData(
      "propinas/count",
      { statusPagamento: 1 },
      {
        onSuccess: (res) => {
          labelTotalAlunosPagamentosSemDividas.innerText = res.body.qtd;
        },
        onError: (res) => {
          Swal.fire({
            title: res.message,
            icon: "error",
          });
        },
      }
    );

    AppService.getData(
      "propinas/count",
      { statusPagamento: 0 },
      {
        onSuccess: (res) => {
          labelTotalAlunosPagamentosDividas.innerText = res.body.qtd;
          labelTotalPrecoDividas.innerText = formatMoney(res.body.valor);
        },
        onError: (res) => {
          Swal.fire({
            title: res.message,
            icon: "error",
          });
        },
      }
    );
  }

  function carregarDadosFinanceiros(page = 0) {
    countAlunosMensalidades();
    $(preload).fadeIn();

    let value = $("#inpFiltroMesesPagamentos").val(); // exemplo: "2025-09"
    let [ano, mes] = value.split("-");

    btnImprimirRelatorioPropinas.href = `http://localhost:8000/api/pdf/propinas?value=${inpFiltroPagamentos.value}&ano=${ano}&mes=${mes}&statusPagamento=${sltFitroEstadoPagamentos.value}`;

    AppService.getData(
      "propinas",
      {
        value: inpFiltroPagamentos.value,
        page,
        ano,
        mes,
        statusPagamento: sltFitroEstadoPagamentos.value,
      },
      {
        onSuccess: (res) => {
          confiracoesCarregadas = res.body;
          paginacaoConfirmacoes = res.paginacao;
          renderPaginacao({
            container: containerPaginacaoPagamento,
            totalPaginas: paginacaoConfirmacoes?.totalPages,
            paginaAtual: paginacaoConfirmacoes?.page,
            totalItens: paginacaoConfirmacoes?.totalItems,
            onPageClick: (pagina) => carregarMensalidadesfaixaEtaria(pagina),
          });

          renderizarConfirmacoes(confiracoesCarregadas);
        },
        onError: (res) => {
          Swal.fire({
            title: res.message,
            icon: "error",
          });
        },
        onResponse: () => {
          $(preload).fadeOut();
        },
      }
    );
  }

  function renderizarConfirmacoes(confirmacoes = []) {
    tbodyAlunosPagamentosPropinas.innerHTML = ""; // Limpa tabela

    if (confirmacoes.length === 0) {
      tbodyAlunosPagamentosPropinas.innerHTML = `<tr><td colspan="10" class="sem-dados">Nenhum dado encontrado, verifique os filtros</td></tr>`;
      return;
    }

    confirmacoes.forEach((confirmacao, index) => {
      const tr = document.createElement("tr");
      tr.classList.add("animar-item-lista", "p-0", "m-0");

      // Corrige a contagem de itens considerando o número de itens por página
      const itemIndex =
        (paginacaoConfirmacoes?.page - 1) * paginacaoConfirmacoes?.items +
          index +
          1 || index + 1;

      tr.innerHTML = `
         <td class="px-4 py-3">${itemIndex}</td>
         <td class="px-4 py-3 funcionario-nome">${confirmacao.aluno.nome}</td>
         <td class="px-4 py-3 funcionario-nome">${confirmacao.aluno.idade}</td>
         <td class="px-4 py-3 funcionario-nome">${
           confirmacao.aluno.matricula
         }</td>
         <td class="px-4 py-3 funcionario-nome">${confirmacao.totalDividas}</td>
         <td class="px-4 py-3 funcionario-nome">${
           confirmacao.mensalidade
             ? formatMoney(
                 confirmacao.pagamento?.mensalidade ?? confirmacao.mensalidade
               )
             : "ISENTO"
         }</td>
         <td class="px-4 py-3 funcionario-nome">${
           confirmacao.pagamento
             ? formatarData(confirmacao.pagamento?.dataPagamento)
             : "---"
         }
         </td>
         <td class="px-4 py-3 funcionario-nome">
            <span ${
              !!confirmacao.pagamento ? "" : "hidden"
            } class="badge bg-success">Pago</span>

            <span ${
              !confirmacao.pagamento && confirmacao.mensalidade ? "" : "hidden"
            } class="badge bg-danger">Pendente</span>

            <span ${
              !confirmacao.mensalidade ? "" : "hidden"
            } class="badge bg-secondary">ISENTO</span>
         </td>
            <td class="px-4 py-3 funcionario-acoes">
                <button ${
                  confirmacao.mensalidade && !confirmacao.pagamento
                    ? "title='Confimar Pagamento'"
                    : "disabled "
                } class="botao-pequeno-nexus sucesso btn-pagar-mensalidade" ><i class="fa-solid fa-file-invoice-dollar"></i></button>
            </td>
      `;

      const btnPagarMensalidade = tr.querySelector(".btn-pagar-mensalidade");
      let value = $("#inpFiltroMesesPagamentos").val(); // exemplo: "2025-09"
      let [ano, mes] = value.split("-");

      btnPagarMensalidade.addEventListener("click", () => {
        Swal.fire({
          title: `Deseja pagar esta propina?`,
          text: "Não tem volta",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Realizar Pagamento",
          cancelButtonText: "Cancelar",
        }).then(async (result) => {
          if (result.isConfirmed) {
            AppService.postData(
              "propinas",
              {
                idAlunoTurma: confirmacao.idAlunoTurma,
                mes: Number(mes),
                ano: Number(ano),
                mensalidade: confirmacao.mensalidade,
              },
              {
                onSuccess: (res) => {
                  carregarDadosFinanceiros(0);

                  Swal.fire({
                    title: res.message,
                    icon: "success",
                  });
                },
                onError: (res) => {
                  Swal.fire({
                    title: res.message,
                    icon: "error",
                  });
                },
              }
            );
          }
        });
      });

      tbodyAlunosPagamentosPropinas.appendChild(tr);
    });
  }

  function handleAcoesFinanceiro(event) {
    const target = event.target.closest("button");
    if (!target) return;

    const alunoId = parseInt(target.dataset.alunoId);
    const mesAno = target.dataset.mesAno;
    const aluno = window.alunosMatriculados.find((a) => a.id === alunoId);

    if (target.matches(".btn-registrar-pagamento")) {
      if (
        confirm(
          `Registrar pagamento para ${aluno?.nome} referente a ${mesAno}?`
        )
      ) {
        dadosFinanceiros[alunoId][mesAno].status = "pago";
        dadosFinanceiros[alunoId][mesAno].dataPagamento = new Date()
          .toISOString()
          .slice(0, 10); // Formato YYYY-MM-DD
        window.mostrarToast(
          "sucesso",
          "Pagamento Registrado",
          `Mensalidade de ${aluno?.nome} (${mesAno}) marcada como paga.`
        );
        carregarDadosFinanceiros();
      }
    } else if (target.matches(".btn-lancar-cobranca")) {
      if (
        confirm(`Lançar cobrança para ${aluno?.nome} referente a ${mesAno}?`)
      ) {
        if (!dadosFinanceiros[alunoId]) dadosFinanceiros[alunoId] = {};
        dadosFinanceiros[alunoId][mesAno] = {
          valor: parseFloat((400 + (alunoId % 5) * 25).toFixed(2)), // Valor padrão simulado
          status: "pendente",
          vencimento: `10/${mesAno.substring(5)}/${mesAno.substring(0, 4)}`,
          dataPagamento: null,
        };
        window.mostrarToast(
          "sucesso",
          "Cobrança Lançada",
          `Mensalidade para ${aluno?.nome} (${mesAno}) lançada.`
        );
        carregarDadosFinanceiros();
      }
    } else if (target.matches(".btn-emitir-recibo")) {
      window.mostrarToast(
        "info",
        "Recibo (Simulado)",
        `Emitindo recibo para ${aluno?.nome} de ${mesAno}. (Funcionalidade a implementar)`
      );
    } else if (target.matches(".btn-notificar-divida")) {
      window.mostrarToast(
        "info",
        "Notificação (Simulada)",
        `Enviando notificação para responsável de ${aluno?.nome} sobre débito de ${mesAno}.`
      );
    } else if (target.matches(".btn-editar-cobranca")) {
      window.mostrarToast(
        "info",
        "Editar Cobrança (Simulado)",
        `Abrindo formulário para editar cobrança de ${aluno?.nome} (${mesAno}).`
      );
      // Lógica para abrir modal de edição
    }
  }

  function inicializarModuloFinanceiro() {
    if (!secaoFinanceiro.classList.contains("ativa")) return;
    let hoje = new Date();
    let mes = String(hoje.getMonth() + 1).padStart(2, "0");
    let ano = hoje.getFullYear();
    let atual = `${ano}-${mes}`;

    $("#inpFiltroMesesPagamentos").val(atual);
    carregarDadosFinanceiros(); // Carga inicial
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (
          entry.isIntersecting &&
          entry.target.id === "financeiro" &&
          entry.target.classList.contains("ativa")
        ) {
          inicializarModuloFinanceiro();
        }
      });
    },
    { threshold: 0.01 }
  );
  observer.observe(secaoFinanceiro);
  window.inicializarModuloFinanceiro = inicializarModuloFinanceiro;
})();
