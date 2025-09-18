// js/modulos/dashboard.js

import { formatarTempo, formatMoney } from "../utils.js";
import {
  AppService,
  armazenamento,
  getEmpresaLogada,
  getUsuarioLogado,
} from "./../app_service.js";

(function () {
  const secaodashboard = document.getElementById("dashboard");
  if (!secaodashboard) {
    console.warn("Seção dashboard não encontrada.");
    return;
  }

  btnSair.addEventListener("click", () => {
    armazenamento.clear();
    window.location.href = "login.html";
  });

  function countDadosCards() {
    AppService.getData(
      "alunos",
      {
        page: 1,
        items: 1,
        eliminado: 0,
        confirmacao_terminado: 0,
      },
      {
        onSuccess: (res) => {
          labelTotalalunosConfirmados.innerText = res.paginacao.totalItems;
        },
        onEroor: (res) => {
          console.log(res);
        },
        onResponse: () => {},
      }
    );

    AppService.getData(
      "turmas",
      {
        page: 1,
        items: 1,
        eliminada: 0,
      },
      {
        onSuccess: (res) => {
          labelTotalTurmasCards.innerText = res.paginacao.totalItems;
        },
        onEroor: (res) => {
          console.log(res);
        },
        onResponse: () => {
          $(contentTurma).fadeIn();
          $(preload).fadeOut();
        },
      }
    );

    AppService.getData(
      "propinas/count",
      { statusPagamento: 0 },
      {
        onSuccess: (res) => {
          labelTotalPagamentosPendentes.innerText = res.body.qtd;
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

    AppService.getData(
      "usuarios/count",
      {},
      {
        onSuccess: (res) => {
          const { total, ativos, inativos } = res.body;
          labelTotalFuncionariosCard.textContent = ativos;
        },
      }
    );
  }

  // --- DADOS DE EXEMPLO ---
  const dadosMatriculasMes = [];

  const atividadesRecentesExemplo = [
    {
      icone: "fa-user-plus",
      corIcone: "#2ecc71",
      descricao:
        "Nova matrícula: <strong>Lucas Pereira</strong> (Turma Berçário II)",
      tempo: "Há 5 min",
    },
    {
      icone: "fa-file-invoice-dollar",
      corIcone: "#f1c40f",
      descricao:
        "Pagamento recebido de <strong>Ana Silva</strong> (Mensalidade Março)",
      tempo: "Há 2 horas",
    },
    {
      icone: "fa-bullhorn",
      corIcone: "#3498db",
      descricao:
        'Comunicado enviado: <strong>"Reunião de Pais - Abril"</strong>',
      tempo: "Ontem",
    },
    {
      icone: "fa-calendar-check",
      corIcone: "#FF8A65",
      descricao: "Frequência registrada para Turma Maternal I.",
      tempo: "Ontem",
    },
    {
      icone: "fa-exchange-alt",
      corIcone: "#54a0ff",
      descricao: "Entrada registrada: <strong>Maria Clara</strong> às 08:02.",
      tempo: "Hoje",
    },
    {
      icone: "fa-boxes-stacked",
      corIcone: "#e67e22",
      descricao:
        'Item <strong>"Giz de Cera (Cx)"</strong> baixo no inventário.',
      tempo: "2 dias atrás",
    },
  ];

  // --- SELETORES ---
  let graficoContainerEl, listaAtividadesContainerEl;

  // --- FUNÇÕES ---
  function popularGraficoMatriculas() {
    const graficoContainerEl = document.getElementById("grafico-dashboard");
    graficoContainerEl.innerHTML = ""; // Limpa antes de popular

    AppService.getData(
      "alunos/ultimos-meses",
      {},
      {
        onSuccess: (res) => {
          const dadosMatriculasMes = res.body;

          const totalMatriculas = dadosMatriculasMes.reduce(
            (acc, dado) => acc + dado.valor,
            0
          );

          dadosMatriculasMes.forEach((dado, index) => {
            const alturaPorcentagem = (dado.valor / totalMatriculas) * 100;
            const formatado = Number.isInteger(alturaPorcentagem)
              ? alturaPorcentagem
              : alturaPorcentagem.toFixed(1);

            const cores = [
              "#6699FF",
              "#66CC66",
              "#FF6666",
              "#B266FF",
              "#FFB266",
            ];

            graficoContainerEl.innerHTML += `
              <div
                class="barra-grafico duration-1000!"
                style="height: ${alturaPorcentagem}%; --cor-barra: ${cores[index]}"
                title="${dado.valor} Matrícula(s)"
                >
                <p class=' absolute! -top-[${alturaPorcentagem}%]! text-center! font-semibold text-xs! '>${formatado}%</p>
                <span>${dado.mes}</span>
              </div>
            `;
          });
        },
      }
    );
  }

  let interval = null;
  function popularListaAtividades() {
    if (interval) clearInterval(interval);

    const contentAtividadesSistema = document.getElementById(
      "contentAtividadesSistema"
    );
    contentAtividadesSistema.innerHTML = ""; // Limpa antes de popular

    AppService.getData(
      "atividades",
      {},
      {
        onSuccess: (res) => {
          console.log(res);

          res.body.forEach((dado, index) => {
            contentAtividadesSistema.innerHTML += `
              <li class="item-atividade">
                  <i
                    class="${dado.icon} icone-atividade-lista" 
                    style='${dado.icon}'
                    aria-hidden="true"
                  ></i>
                  <div class="info-atividade">
                    <span class="descricao-atividade">
                      ${dado.descricao} 
                    </span>
                    <span class="tempo-atividade"><i class="fas fa-clock" aria-hidden="true"></i>
                      ${formatarTempo(dado.dataCadastro)}
                    </span
                    >
                  </div>
                </li>
            `;
          });

          interval = setTimeout(() => {
            popularListaAtividades();
          }, 60000);
        },
      }
    );
  }

  function carregarDadosDashboard() {
    popularListaAtividades();
    // Disparar evento para script.js saber que conteúdo foi carregado e re-aplicar VanillaTilt se necessário
    document.dispatchEvent(
      new CustomEvent("nexusContentLoaded", {
        detail: { container: document.getElementById("dashboard") },
      })
    );
  }

  function init() {
    graficoContainerEl = document.getElementById("grafico-matriculas-mes");
    countDadosCards();
    popularGraficoMatriculas();

    listaAtividadesContainerEl = document.getElementById(
      "lista-atividades-recentes-dashboard"
    );

    // Carrega dados quando a seção do dashboard é mostrada
    document.addEventListener("nexusSecaoCarregada", (event) => {
      if (event.detail.idSecao === "dashboard") {
        // Os contadores já são animados pelo script.js, mas podemos forçar se necessário
        // Ou carregar dados específicos do dashboard aqui
        carregarDadosDashboard();
      }
    });

    // Se o dashboard for a primeira seção carregada, carregar dados imediatamente
    if (document.getElementById("dashboard")?.classList.contains("ativa")) {
      carregarDadosDashboard();
    }

    let empresaLogada = getEmpresaLogada();

    const partes = empresaLogada.nome.trim().split(/\s+/); // separa por espaços
    labelNomeEmpresa.innerText = partes[0];
    labelNomeEmpresa2.innerText = partes[0];
    labelNomeEmpresa3.innerText = empresaLogada.nome;
    document.getElementById("ano-atual-footer").innerText =
      new Date().getFullYear();
    if (partes.length > 1) {
      labelNomeEmpresaSecundario.innerText = partes[partes.length - 1];
      labelNomeEmpresaSecundario2.innerText = partes[partes.length - 1];
    }

    document.getElementById("avatar-admin").src = getUsuarioLogado().imagem;

    console.log("Módulo Dashboard Nexus OS Inicializado.");
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (
          entry.isIntersecting &&
          entry.target.id === "dashboard" &&
          entry.target.classList.contains("ativa")
        ) {
          init();
        }
      });
    },
    { threshold: 0.01 }
  );
  observer.observe(secaodashboard);
  window.init = init;
})();
