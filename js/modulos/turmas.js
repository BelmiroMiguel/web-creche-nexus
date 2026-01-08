import { AppService } from "../app_service.js";
import {
  capitalizeWords,
  formatarData,
  formatarDataInput,
  fotoPreview,
  renderPaginacao,
  toUpperCase,
} from "../utils.js";

// js/modulos/turmas.js
(function () {
  "use strict";

  const secaoTurmas = document.getElementById("turmas");
  if (!secaoTurmas) return;

  function baseUrl(url = "") {
    if (url && !url.startsWith("/")) {
      url = "/" + url;
    }
    return `turmas${url}`;
  }

  let turmaSelecionada = null;

  let paginacaoTurma = {
    page: 0,
    totalPages: 0,
    totalItems: 0,
    items: 12,
  };

  let turmasCarregadas = [];
  let isEditarTurma = false;

  $(btnAbilitarNovaTurma).on("click", () => abilitarNovaTurma(true));
  $(btnCancelarNovaTurma).on("click", () => abilitarNovaTurma(false));
  $(inpFiltroTurma).on("input", () => carregarTurmas(0));
  $(sltFitroEstadoTurma).on("input", () => carregarTurmas(0));

  $(formNovaTurma).on("submit", salvarTurma);

  const containerCardsTurmas = secaoTurmas.querySelector(
    "#container-cards-turmas"
  );
  const templateCardTurma = document.getElementById("template-card-turma");

  function carregarFuncionarios() {
    AppService.getData(
      "usuarios",
      {
        items: -1,
        eliminado: false,
      },
      {
        onSuccess: (res) => {
          const funcionarios = res.body;

          sltEducadorTurma.innerHTML = "";
          sltEducadorTurma.innerHTML += `<option value="" selected disabled>Selecione um educador</option>`;

          funcionarios.forEach((funcionario) => {
            if (
              funcionario.nivel == "educador" ||
              funcionario.nivel == "auxiliar"
            ) {
              const option = document.createElement("option");
              option.value = funcionario.idUsuario;
              option.textContent = capitalizeWords(
                `${funcionario.nome} - (${funcionario.nivel.toUpperCase()})`
              );
              sltEducadorTurma.innerHTML += option.outerHTML;
            }
          });
        },
        onEroor: (res) => {
          console.log(res);
        },
      }
    );
  }

  function salvarTurma(event) {
    event.preventDefault();
    // Monta o FormData
    const formDataTurma = new FormData();
    formDataTurma.append("nome", inpNomeTurma.value.trim());
    formDataTurma.append("idEducador", sltEducadorTurma.value);
    formDataTurma.append("faixaEtariaMin", sltFaixaEtariaMin.value);
    formDataTurma.append("faixaEtariaMax", sltFaixaEtariaMax.value);
    formDataTurma.append("capacidade", inpCapacidadeTurma.value);
    formDataTurma.append("dataInicio", inpDataInicioTurma.value);
    if (inpDataTerminoTurma.value) {
      formDataTurma.append("dataTermino", inpDataTerminoTurma.value);
    }
    if (sltCorTurma.value) formDataTurma.append("cor", sltCorTurma.value);

    if (isEditarTurma)
      formDataTurma.append("idTurma", turmaSelecionada.idTurma);

    const textBtn = btnCadastrarTurma.innerHTML;
    btnCadastrarTurma.disabled = true;
    btnCadastrarTurma.innerHTML = `<span class='pr-3' >Validando...</span> <i class="fas fa-spinner fa-spin"></i>`;

    const url = baseUrl(isEditarTurma ? "editar" : "");

    AppService.postData(url, formDataTurma, {
      onSuccess: (res) => {
        carregarTurmas();

        Swal.fire({
          title: res.message,
          icon: "success",
          timer: 3000,
        });

        abilitarNovaTurma(false);
        resetarFormularioTurma();
      },
      onError: (res) => {
        Swal.fire({
          title: res.message,
          icon: "error",
        });
      },
      onResponse: () => {
        btnCadastrarTurma.innerHTML = textBtn;
        btnCadastrarTurma.disabled = false;
      },
    });

    return false;
  }

  function carregarTurmas(page = 0) {
    $(preload).fadeIn();

    AppService.getData(
      baseUrl(),
      {
        page,
        items: paginacaoTurma.items,
        value: inpFiltroTurma.value,
        eliminada: sltFitroEstadoTurma.value,
      },
      {
        onSuccess: (res) => {
          paginacaoTurma = res.paginacao;
          renderPaginacao({
            container: containerPaginacaoTurma,
            totalPaginas: paginacaoTurma.totalPages,
            paginaAtual: paginacaoTurma.page,
            totalItens: paginacaoTurma.totalItems,
            onPageClick: (pagina) => carregarTurmas(pagina),
          });
          turmasCarregadas = res.body;
          renderizarTabelaTurmas(turmasCarregadas);
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
  }

  async function modificarEstadoTurma(turma, callbackInit) {
    const novoEstado = turma.eliminada ? 0 : 1;

    return Swal.fire({
      title: `Deseja ${novoEstado ? "desativar" : "ativar"} esta turma?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: novoEstado ? "Desativar" : "Ativar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        if (callbackInit) callbackInit();
        const formData = new FormData();
        formData.append("idTurma", turma.idTurma);
        formData.append("eliminada", novoEstado);

        try {
          AppService.postData("turmas/editar", formData, {
            onSuccess: async (res) => {
              Swal.fire({
                title: res.message || "Status alterado com sucesso!",
                icon: "success",
                timer: 2000,
              });
            },
            onError: async (res) => {
              Swal.fire({
                title:
                  res && res.message ? res.message : "Erro ao alterar status!",
                icon: "error",
              });
            },
            onResponse: () => {
              carregarTurmas();
            },
          });
        } catch (e) {
          Swal.fire({
            title: "Erro ao alterar status!",
            icon: "error",
          });
        }
      }
    });
  }

  function renderizarTabelaTurmas(turmas = []) {
    containerCardsTurmas.innerHTML = "";

    if (turmas.length === 0) {
      containerCardsTurmas.innerHTML =
        '<p class="sem-dados">Nenhuma turma encontrada, cadastre ou verifique os filtros.</p>';
      return;
    }

    turmas.forEach((turma) => {
      const clone = templateCardTurma.content.cloneNode(true);
      const card = clone.querySelector(".card-item-nexus");
      if (card)
        card.style.setProperty(
          "--cor-app",
          turma.cor || "var(--cor-primaria-claro)"
        );
      card.title = turma.nome;

      clone.querySelector(".turma-nome-card").textContent = turma.nome;
      clone.querySelector(".turma-educador-card").textContent =
        turma.educador.nome || "A definir";
      clone.querySelector(".turma-faixa-etaria-card").textContent =
        turma.descFaixaEtaria;
      clone.querySelector(".turma-capacidade-card").textContent =
        turma.capacidade;
      clone.querySelector(".turma-vagas-ocupadas-card").textContent =
        turma.ocupadas;
      const labelQtdAlunos = clone.querySelector(".label-quantidade-alunos");
      labelQtdAlunos.textContent = turma.alunos?.length ?? 0;

      const progressoBarra = clone.querySelector(".progresso-turma-barra");
      const totalAlunos = turma.alunos?.length ?? turma.ocupadas ?? 0;
      const capacidade = turma.capacidade || 1;
      const percentualOcupacao = Math.min(
        (totalAlunos / capacidade) * 100,
        100
      );
      if (progressoBarra) progressoBarra.style.width = `${percentualOcupacao}%`;

      const btnVerDetalheCompletoTurma =
        clone.querySelector(".btn-detalhe-turma");

      // ao clicar abre um container flutuante como popup, com todos os dados da turma bem customizados

      btnVerDetalheCompletoTurma.addEventListener("click", (e) => {
        showTurmaModal(turma, e);
      });

      // Adicionar data-id para botões
      //clone.querySelector('.btn-ver-alunos-turma').dataset.turmaId = turma.id;
      //clone.querySelector('.btn-editar-turma').dataset.turmaId = turma.id;

      containerCardsTurmas.appendChild(clone);
    });
    // Re-inicializar VanillaTilt para novos cards
    if (window.VanillaTilt) {
      VanillaTilt.init(containerCardsTurmas.querySelectorAll("[data-tilt]"), {
        max: 5,
        perspective: 800,
        scale: 1.01,
        speed: 300,
        glare: true,
        "max-glare": 0.05,
      });
    }
  }

  function showTurmaModal(turma, clickEvent) {
    // Criar elemento modal
    const modal = document.createElement("div");
    modal.className = "modal-turma-detailed";
    modal.style.setProperty("--cor-app-turma", turma.cor || "#3498db");

    // Calcular porcentagem de ocupação
    const ocupadas = turma.ocupadas ?? turma.alunos?.length ?? 0;
    const percentOcupacao = turma.capacidade
      ? Math.round((ocupadas / turma.capacidade) * 100)
      : 0;

    // Formatar datas
    const formatDate = (dateString) => {
      if (!dateString) return "Não definida";
      const date = new Date(dateString);
      return date.toLocaleDateString("pt-BR");
    };

    // Verificar status
    const isTerminada = turma.terminado || false;
    const isEliminada = turma.eliminada || false;

    // Montar conteúdo do modal
    modal.innerHTML = ` 
    <div class="modal-header-turma">
      <h3>${turma.nome || "Turma sem nome"}</h3>
      <button class="modal-close-btn">&times;</button>
    </div>
    
    <div class="modal-body-turma">
      <div class="info-grid-turma">
        <div class="info-item-turma">
          <span class="info-label-turma">Educador Principal</span>
          <span class="info-value-turma">${
            turma.educador?.nome || "A definir"
          }</span>
        </div>
        
        <div class="info-item-turma">
          <span class="info-label-turma">Faixa Etária</span>
          <span class="info-value-turma">
            ${turma.faixaEtariaMin || "0"} - ${turma.faixaEtariaMax || "0"} anos
          </span>
        </div>
        
        <div class="info-item-turma">
          <span class="info-label-turma">Período</span>
          <span class="info-value-turma">
            ${formatDate(turma.dataInicio)} ${
      turma.dataTermino ? `a ${formatDate(turma.dataTermino)}` : ""
    }
          </span>
        </div>
        
        <div class="info-item-turma">
          <span class="info-label-turma">Status</span>
          <span class="info-value-turma">
            ${
              isEliminada
                ? '<span class="status-badge status-inactive">Eliminada</span>'
                : isTerminada
                ? '<span class="status-badge status-inactive">Encerrada</span>'
                : '<span class="status-badge status-active">Ativa</span>'
            }
          </span>
        </div>
        
        <div class="info-item-turma">
          <span class="info-label-turma">Data de Cadastro</span>
          <span class="info-value-turma">${formatDate(
            turma.dataCadastro
          )}</span>
        </div>
        
        <div class="info-item-turma">
          <span class="info-label-turma">Registrado por</span>
          <span class="info-value-turma">${
            turma.educador?.nome || "Sistema"
          }</span>
        </div>
      </div>
      
      <div class="progress-container-turma">
        <div class="progress-info-turma">
          <span>Ocupação: ${ocupadas}/${turma.capacidade || 0}</span>
          <span>${percentOcupacao}%</span>
        </div>
        <div class="progress-bar-turma" role="progressbar">
          <div class="progress-fill-turma" style="width: ${percentOcupacao}%"></div>
        </div>
      </div>
      
      ${
        turma.descricao
          ? `
        <div class="info-item-turma" style="grid-column: span 2">
          <span class="info-label-turma">Descrição</span>
          <span class="info-value-turma">${turma.descricao}</span>
        </div>
      `
          : ""
      }
    </div>
    
    <div class="modal-footer-turma">
      <button hidden class="btn-modal-turma btn-primary-turma btn-ver-alunos">
        <i class="fas fa-eye"></i> Ver Alunos
      </button>
      <button class="btn-modal-turma btn-outline-turma btn-editar-turma">
        <i class="fas fa-edit"></i> Editar
      </button>
       <button class="btn-modal-turma btn-outline-turma btn-eliminar-turma">
        <i class="fas fa-trash"></i> Eliminar
      </button>
    </div>
  `;

    // Adicionar ao DOM
    const modalOverlay = document.createElement("div");
    modalOverlay.className = "modal-overlay-turma";
    modalOverlay.appendChild(modal);
    document.body.appendChild(modalOverlay);

    document.body.style.overflow = "hidden";

    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) {
        modal.remove();
        modalOverlay.remove();
        document.body.style.overflow = "";
        turmaSelecionada = null;
      }
    });

    // Fechar modal
    const closeModal = () => {
      modal.remove();
      modalOverlay.remove();
      document.body.style.overflow = "";
      turmaSelecionada = null;
    };

    // Event listeners
    modal
      .querySelector(".modal-close-btn")
      .addEventListener("click", closeModal);

    // Fechar ao clicar fora
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });

    // Fechar com ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });

    // Botão Ver Alunos
    modal.querySelector(".btn-ver-alunos").addEventListener("click", () => {
      console.log("Ver alunos da turma:", turma.id);
      closeModal();
    });

    // Botão Editar
    modal.querySelector(".btn-editar-turma").addEventListener("click", () => {
      closeModal();
      abilitarEditarTurma(turma);
    });

    // Botão Eliminar
    modal.querySelector(".btn-eliminar-turma").addEventListener("click", () => {
      closeModal();

      modificarEstadoTurma(turma, () => {
        const btnEliminar = modal.querySelector(".btn-eliminar-turma");
        const btnEditar = modal.querySelector(".btn-editar-turma");
        const btnVerAlunos = modal.querySelector(".btn-ver-alunos");

        // Bloquear todos os botões
        btnEliminar.disabled = true;
        btnEditar.disabled = true;
        btnVerAlunos.disabled = true;

        // Adicionar spinner ao botão Eliminar
        const originalText = btnEliminar.innerHTML;
        btnEliminar.innerHTML = `<span class="pr-2">Eliminando...</span> <i class="fas fa-spinner fa-spin"></i>`;
      });
    });
  }

  function resetarFormularioTurma() {
    if (typeof formNovaTurma !== "undefined" && formNovaTurma) {
      formNovaTurma.reset();
    }
  }

  function abilitarNovaTurma(status = false) {
    turmaSelecionada = null;
    isEditarTurma = false;
    resetarFormularioTurma();
    if (typeof formNovaTurma !== "undefined" && formNovaTurma) {
      if (status) {
        $(contentTurma).fadeOut(0);
        $(formNovaTurma).fadeIn(300);
      } else {
        $(formNovaTurma).fadeOut(0);
        $(contentTurma).fadeIn(300);
      }
    }

    labelTituloCadastroTurma.innerHTML = "Criar Nova Turma";
    labelBtnCadastrarTurma.innerHTML = "Salvar Dados";
  }

  async function abilitarEditarTurma(turma) {
    abilitarNovaTurma(true);
    turmaSelecionada = turma;
    isEditarTurma = true;

    inpNomeTurma.value = turma.nome || "";
    sltEducadorTurma.value = turma.idEducador || "";
    sltFaixaEtariaMin.value = turma.faixaEtariaMin || "";
    sltFaixaEtariaMax.value = turma.faixaEtariaMax || "";
    inpCapacidadeTurma.value = turma.capacidade || "";
    inpDataInicioTurma.value = formatarDataInput(turma.dataInicio) || "";
    inpDataTerminoTurma.value = formatarDataInput(turma.dataTermino) || "";
    sltCorTurma.value = turma.cor || "";

    labelTituloCadastroTurma.innerHTML = "Editar Dados da Turma";
    labelBtnCadastrarTurma.innerHTML = "Salvar Dados da Edição";
  }

  function inicializarModuloTurmas() {
    if (!secaoTurmas.classList.contains("ativa")) return;

    carregarTurmas();
    abilitarNovaTurma(false);
    carregarFuncionarios();
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (
          entry.isIntersecting &&
          entry.target.id === "turmas" &&
          entry.target.classList.contains("ativa")
        ) {
          inicializarModuloTurmas();
        }
      });
    },
    { threshold: 0.1 }
  );
  observer.observe(secaoTurmas);
  window.inicializarModuloTurmas = inicializarModuloTurmas;
})();
