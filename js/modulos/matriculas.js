"use strict";
import { AppService } from "../app_service.js";
import {
  calcularIdade,
  capitalizeWords,
  formatarData,
  formatarDataInput,
  fotoPreview,
  renderPaginacao,
  toUpperCase,
} from "../utils.js";

// js/modulos/matriculas.js
(function () {
  const secaoMatriculas = document.getElementById("matriculas");
  if (!secaoMatriculas) {
    console.warn("Seção Matrículas não encontrada.");
    return;
  }

  function baseUrl(url = "") {
    if (url && !url.startsWith("/")) {
      url = "/" + url;
    }
    return `alunos${url}`;
  }

  fotoPreview({
    inputFileImagem: inpFotoAlunoMatricula,
    docImg: fotoPreviewAlunoMatricula,
  });

  $(btnAbilitarNovaMatricula).on("click", () => abilitarNovaMatricula(true));
  $(btnCancelarNovaMatricula).on("click", () => abilitarNovaMatricula(false));
  $(formNovaConfirmacao).on("submit", cadastrarConfirmacao);
  // $(btnCancelarConfirmacaoTurma).on('click', () => window.fecharModalNexus(modalConfirmacaoTurma.id, false))
  $(inpFiltroAlunoMatricula).on("input", () => carregarAlunos(0));
  $(sltFitroEstadoAlunoMatricula).on("input", () => carregarAlunos(0));
  $(sltFitroEstadoConfirmacaoAlunoMatricula).on("input", () =>
    carregarAlunos(0)
  );
  $(sltTurmaConfirmacao).on("input", () =>
    mostrarTurmaSelecionada(turmasCarregadas)
  );
  $(formNovaMatricula).on("submit", salvarAluno);

  let trAnterior = null;

  let paginacaoFunciomario = {
    page: 0,
    totalPages: 0,
    totalItems: 0,
    items: 10,
  };

  let isEditarAluno = false;
  let alunosCarregados = [];
  let turmasCarregadas = [];
  let alunoSelecionado = null;

  async function carregarTurmas() {
    mostrarTurmaSelecionada();

    AppService.getData(
      "turmas",
      { eliminado: false },
      {
        onSuccess: (res) => {
          turmasCarregadas = res.body;
          sltTurmaConfirmacao.innerHTML = "";
          sltTurmaConfirmacao.innerHTML += `<option value="" selected disabled>Selecione uma turma...</option>`;

          turmasCarregadas.forEach((turma) => {
            const option = document.createElement("option");
            option.value = turma.idTurma;
            option.textContent = `${capitalizeWords(turma.nome)} - (${
              turma.descFaixaEtaria
            })`;
            sltTurmaConfirmacao.innerHTML += option.outerHTML;
          });
        },
      }
    );
  }

  async function contarAlunos() {
    AppService.getData(
      baseUrl("count"),
      {},
      {
        onSuccess: (res) => {
          const { total, ativos, inativos } = res.body;
          labelTotalAlunosMatricula.textContent = total;
          labelTotalAlunosMatriculaAtivos.textContent = ativos;
          labelTotalAlunosMatriculaInativos.textContent = inativos;
        },
      }
    );
  }

  async function cadastrarConfirmacao(event) {
    event.preventDefault();

    const turmaSelecionada = turmasCarregadas.find(
      (t) => t.idTurma == sltTurmaConfirmacao.value
    );

    const textBtn = btnCadastrarConfirmacaoTurmaAluno.innerHTML;
    btnCadastrarConfirmacaoTurmaAluno.disabled = true;
    btnCadastrarConfirmacaoTurmaAluno.innerHTML = `<span class='pr-3' >Validando...</span> <i class="fas fa-spinner fa-spin"></i>`;

    const rota = alunoSelecionado?.confirmacao?.terminado
      ? "confirmacoes"
      : "confirmacoes/trocar-turma";

    AppService.postData(
      rota,
      {
        idAluno: alunoSelecionado.idAluno,
        idTurma: turmaSelecionada?.idTurma,
      },
      {
        onSuccess: async (res) => {
          Swal.fire({
            title: res.message,
            icon: "success",
            timer: 3000,
          });

          carregarAlunos();
          carregarTurmas();
        },
        onError: onError,
        onResponse: () => {
          btnCadastrarConfirmacaoTurmaAluno.innerHTML = textBtn;
          btnCadastrarConfirmacaoTurmaAluno.disabled = false;
          window.fecharModalNexus(modalConfirmacaoTurma.id);
        },
      }
    );

    return false;
  }

  async function finalizarConfirmacao(confirmacao, callback) {
    if (!confirmacao || confirmacao.terminado) {
      Swal.fire({
        title: "Confirmação já finalizada ou inválida!",
        icon: "error",
      });
      return;
    }

    Swal.fire({
      title: "Deseja finalizar a confirmação deste aluno?",
      text: "Esta ação não poderá ser desfeita!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, finalizar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        if (callback) callback();
        const formData = new FormData();
        formData.append("idAlunoTurma", confirmacao.idAlunoTurma);

        AppService.postData("confirmacoes/encerrar", formData, {
          onSuccess: async (res) => {
            Swal.fire({
              title: res.message,
              icon: "success",
              timer: 2000,
            });
          },
          onError: onError,
          onResponse: () => {
            carregarAlunos();
          },
        });
      }
    });
  }

  async function carregarAlunos(page = 0) {
    $(preload).fadeIn();

    if (sltFitroEstadoAlunoMatricula.value == 1) {
      sltFitroEstadoConfirmacaoAlunoMatricula.value = 1;
      sltFitroEstadoConfirmacaoAlunoMatricula.disabled = true;
    } else {
      sltFitroEstadoConfirmacaoAlunoMatricula.disabled = false;
    }

    AppService.getData(
      baseUrl(),
      {
        page,
        items: paginacaoFunciomario.items,
        value: inpFiltroAlunoMatricula.value,
        eliminado: sltFitroEstadoAlunoMatricula.value,
        confirmacao_terminado: sltFitroEstadoConfirmacaoAlunoMatricula.value,
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

  async function salvarAluno(event) {
    event.preventDefault();

    // Pega a imagem do input
    const fotoFile = formNovaMatricula.inpFotoAlunoMatricula.files[0];

    // Monta o FormData
    const formDataAluno = new FormData();

    formDataAluno.append("nome", inpNomeAlunoMatricula.value);
    formDataAluno.append("identificacao", inpIdentificacaoAlunoMatricula.value);
    formDataAluno.append(
      "nomeResponsavel",
      inpNomeResponsavelAlunoMatricula.value
    );
    formDataAluno.append(
      "identificacaoResponsavel",
      inpIdentificacaoResponsavelAlunoMatricula.value
    );
    formDataAluno.append(
      "telefoneResponsavel",
      inpTelefoneResponsavelAlunoMatricula.value
    );
    formDataAluno.append(
      "dataNascimento",
      inpDataNascimentoAlunoMatricula.value
    );
    formDataAluno.append("endereco", inpEnderecoAlunoMatricula.value);
    formDataAluno.append("observacao", inpObservacaoAlunoMatricula.value);
    formDataAluno.append("genero", sltGeneroCadastroAlunoMatricula.value);

    if (
      inpNomeResponsavel2AlunoMatricula &&
      inpNomeResponsavel2AlunoMatricula.value
    ) {
      formDataAluno.append(
        "nomeResponsavel2",
        inpNomeResponsavel2AlunoMatricula.value
      );
    }
    if (
      inpTelefoneResponsavel2AlunoMatricula &&
      inpTelefoneResponsavel2AlunoMatricula.value
    ) {
      formDataAluno.append(
        "telefoneResponsavel2",
        inpTelefoneResponsavel2AlunoMatricula.value
      );
    }
    if (
      sltGrauParentescoResponsavel2Matricula &&
      sltGrauParentescoResponsavel2Matricula.value
    ) {
      formDataAluno.append(
        "grauParentesco2",
        sltGrauParentescoResponsavel2Matricula.value
      );
    }
    if (
      inpNomeResponsavel3AlunoMatricula &&
      inpNomeResponsavel3AlunoMatricula.value
    ) {
      formDataAluno.append(
        "nomeResponsavel3",
        inpNomeResponsavel3AlunoMatricula.value
      );
    }
    if (
      inpTelefoneResponsavel3AlunoMatricula &&
      inpTelefoneResponsavel3AlunoMatricula.value
    ) {
      formDataAluno.append(
        "telefoneResponsavel3",
        inpTelefoneResponsavel3AlunoMatricula.value
      );
    }
    if (
      sltGrauParentescoResponsavel3Matricula &&
      sltGrauParentescoResponsavel3Matricula.value
    ) {
      formDataAluno.append(
        "grauParentesco3",
        sltGrauParentescoResponsavel3Matricula.value
      );
    }
    if (
      inpNomeResponsavel4AlunoMatricula &&
      inpNomeResponsavel4AlunoMatricula.value
    ) {
      formDataAluno.append(
        "nomeResponsavel4",
        inpNomeResponsavel4AlunoMatricula.value
      );
    }
    if (
      inpTelefoneResponsavel4AlunoMatricula &&
      inpTelefoneResponsavel4AlunoMatricula.value
    ) {
      formDataAluno.append(
        "telefoneResponsavel4",
        inpTelefoneResponsavel4AlunoMatricula.value
      );
    }
    if (
      sltGrauParentescoResponsavel4Matricula &&
      sltGrauParentescoResponsavel4Matricula.value
    ) {
      formDataAluno.append(
        "grauParentesco4",
        sltGrauParentescoResponsavel4Matricula.value
      );
    }

    if (fotoFile) formDataAluno.append("imagem", fotoFile);
    if (alunoSelecionado)
      formDataAluno.append("idAluno", alunoSelecionado.idAluno);

    if (inpEmailResponsavelAlunoMatricula.value) {
      formDataAluno.append(
        "emailResponsavel",
        inpEmailResponsavelAlunoMatricula.value
      );
    }

    if (sltGrauParentescoResponsavelMatricula.value) {
      formDataAluno.append(
        "grauParentesco",
        sltGrauParentescoResponsavelMatricula.value
      );
    }

    const textBtn = labelBtnCadastrarAlunoMatricula.innerHTML;
    labelBtnCadastrarAlunoMatricula.parentNode.disabled = true;
    labelBtnCadastrarAlunoMatricula.innerHTML = `<span class='pr-3' >Validando...</span> <i class="fas fa-spinner fa-spin"></i>`;

    const rota = baseUrl(isEditarAluno ? "editar" : "");

    AppService.postData(rota, formDataAluno, {
      onSuccess: async (res) => {
        carregarAlunos();
        abilitarNovaMatricula(false);
        resetarFormularioNovaMatricula();

        Swal.fire({
          title: res.message,
          icon: "success",
          timer: 3000,
        });
      },
      onError: onError,
      onResponse: () => {
        labelBtnCadastrarAlunoMatricula.innerHTML = textBtn;
        labelBtnCadastrarAlunoMatricula.parentNode.disabled = false;
      },
    });

    return false;
  }

  async function modificarEstadoAluno(aluno, callbackInit) {
    const novoEstado = aluno.eliminado ? 0 : 1;

    return Swal.fire({
      title: `Deseja ${novoEstado ? "desativar" : "ativar"} este funcionário?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: novoEstado ? "Desativar" : "Ativar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        if (callbackInit) callbackInit();
        const formData = new FormData();
        formData.append("idAluno", aluno.idAluno);
        formData.append("eliminado", novoEstado);

        try {
          AppService.postData(baseUrl("editar"), formData, {
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
              carregarAlunos();
              contarAlunos();
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

  async function resetarFormularioNovaMatricula() {
    if (typeof formNovaMatricula !== "undefined" && formNovaMatricula) {
      formNovaMatricula.reset();
      if (
        typeof fotoPreviewAlunoMatricula !== "undefined" &&
        fotoPreviewAlunoMatricula
      ) {
        fotoPreviewAlunoMatricula.src =
          "./assets/img/blank-profile-picture-png.webp";
      }
    }

    inpFotoAlunoMatricula.value = "";
    labelTituloCadastroMatricula.innerHTML = "Registrar Novo Aluno";
    labelBtnCadastrarAlunoMatricula.innerHTML = "Cadastrar Aluno";
    isEditarAluno = false;
    alunoSelecionado = null;
  }

  async function abilitarNovaMatricula(status = false) {
    resetarFormularioNovaMatricula();
    if (typeof formNovaMatricula !== "undefined" && formNovaMatricula) {
      if (status) {
        $(contetMatricula).fadeOut(0);
        $(formNovaMatricula).fadeIn(300);
      } else {
        $(formNovaMatricula).fadeOut(0);
        $(contetMatricula).fadeIn(300);
      }
    }
  }

  async function abilitarEditarAluno(aluno) {
    abilitarNovaMatricula(true);
    alunoSelecionado = aluno;
    isEditarAluno = true;

    labelTituloCadastroMatricula.innerHTML = "Editar Dados do Aluno";
    labelBtnCadastrarAlunoMatricula.innerHTML = "Salvar Dados da Edição";
    inpNomeAlunoMatricula.value = aluno.nome || "";
    inpIdentificacaoAlunoMatricula.value = aluno.identificacao || "";
    inpDataNascimentoAlunoMatricula.value =
      formatarDataInput(aluno.dataNascimento) || "";
    sltGeneroCadastroAlunoMatricula.value = aluno.genero || "";
    sltGrauParentescoResponsavelMatricula.value = aluno.grauParentesco || "";
    inpEmailResponsavelAlunoMatricula.value = aluno.emailResponsavel || "";
    inpFotoAlunoMatricula.value = ""; // Limpa o input
    inpObservacaoAlunoMatricula.value = aluno.observacao || "";

    inpNomeResponsavelAlunoMatricula.value = aluno.nomeResponsavel || "";
    inpIdentificacaoResponsavelAlunoMatricula.value =
      aluno.identificacaoResponsavel || "";
    inpTelefoneResponsavelAlunoMatricula.value =
      aluno.telefoneResponsavel || "";
    inpEnderecoAlunoMatricula.value = aluno.endereco || "";


    


    inpNomeResponsavel2AlunoMatricula.value = aluno.nomeResponsavel2 || "";
    inpTelefoneResponsavel2AlunoMatricula.value =
      aluno.telefoneResponsavel2 || "";
    sltGrauParentescoResponsavel2Matricula.value = aluno.grauParentesco2 || "";

    inpNomeResponsavel3AlunoMatricula.value = aluno.nomeResponsavel3 || "";
    inpTelefoneResponsavel3AlunoMatricula.value =
      aluno.telefoneResponsavel3 || "";
    sltGrauParentescoResponsavel3Matricula.value = aluno.grauParentesco3 || "";

    inpNomeResponsavel4AlunoMatricula.value = aluno.nomeResponsavel4 || "";
    inpTelefoneResponsavel4AlunoMatricula.value =
      aluno.telefoneResponsavel4 || "";
    sltGrauParentescoResponsavel4Matricula.value = aluno.grauParentesco4 || "";

    if (
      typeof fotoPreviewAlunoMatricula !== "undefined" &&
      fotoPreviewAlunoMatricula
    ) {
      fotoPreviewAlunoMatricula.src =
        aluno.imagem || "./assets/img/blank-profile-picture-png.webp";
    }
  }

  async function renderizarTabelaAlunos(alunos = []) {
    tbodyAlunosMatricula.innerHTML = ""; // Limpa tabela

    if (alunos.length === 0) {
      tbodyAlunosMatricula.innerHTML = `<tr><td colspan="8" class="sem-dados">Nenhum funcionário encontrado.</td></tr>`;
      return;
    }

    alunos.forEach((aluno, index) => {
      const tr = document.createElement("tr");
      tr.classList.add("animar-item-lista", "p-0", "m-0");

      // Corrige a contagem de itens considerando o número de itens por página
      const itemIndex =
        (paginacaoFunciomario.page - 1) * paginacaoFunciomario.items +
        index +
        1;
      const confirmacao = aluno.confirmacoes[0];

      aluno.confirmacao = confirmacao || {};
      aluno.confirmacao.terminado = confirmacao?.terminado ?? true;

      tr.innerHTML = `
                <td class="px-4 py-3">${itemIndex}</td>
                <td class="px-4 py-3 aluno-nome">${aluno.nome}</td>
                <td class="px-4 py-3 aluno-funcao">${calcularIdade(
                  aluno.dataNascimento
                )}</td>
                <td class="px-4 py-3 aluno-turno">${aluno.matricula}</td>
                <td class="px-4 py-3 aluno-contato">${aluno.endereco}</td>
                <td class="px-4 py-3 aluno-contato">${
                  aluno.nomeResponsavel
                }</td>
                <td class="px-4 py-3 aluno-status">
                    <span class="badge  ${
                      aluno.eliminado ? "bg-danger" : "bg-success"
                    }">
                        ${aluno.eliminado ? "Inativo" : "Ativo"}
                    </span>
                    <span ${
                      !aluno.confirmacao?.terminado ? "" : "hidden"
                    } class="badge bg-primary ">
                        Confirmado
                    </span>
                </td>
                <td class="px-4 py-3 aluno-acoes">
                    <button class="botao-pequeno-nexus info btn-ver-perfil-aluno" title="Ajustes de Confirmação"><i class="fas fa-user-gear"></i></button>
                    <button ${
                      aluno.eliminado ? "disabled" : ""
                    }  class="botao-pequeno-nexus editar btn-editar-aluno"
                        title="${
                          aluno.eliminado
                            ? "Aluno Inativo"
                            : "Editar Dados do Aluno"
                        }">
                        <i class="fas fa-user-edit"></i>
                     </button>
                    <button 
                        ${!aluno.confirmacao?.terminado ? "disabled" : ""} 
                        class="botao-pequeno-nexus ${
                          !aluno.eliminado ? "perigo" : "sucesso"
                        } 
                        btn-alterar-status-aluno" 
                        title="${
                          !aluno.confirmacao?.terminado
                            ? "Aluno Possue Confirmação"
                            : !aluno.eliminado
                            ? "Desativar Aluno"
                            : "Ativar Aluno"
                        }">
                        <i class="fas ${
                          !aluno.eliminado ? "fa-user-slash" : "fa-user-check"
                        }"></i>
                    </button>  
                </td>
            `;

      tr.querySelector(".btn-editar-aluno").addEventListener("click", () =>
        abilitarEditarAluno(aluno)
      );
      tr.querySelector(".btn-alterar-status-aluno").addEventListener(
        "click",
        () => {
          if (!aluno.confirmacao?.terminado) return;
          modificarEstadoAluno(aluno, () => {
            tr.querySelector(".btn-alterar-status-aluno").innerHTML =
              '<i class="fas fa-spinner fa-spin"></i>';
          });
        }
      );

      tr.querySelector(".btn-ver-perfil-aluno").addEventListener(
        "click",
        () => {
          tr.style.background = "#e9ecef";

          // Remove qualquer linha de detalhes aberta anteriormente
          const existingDetailRow = tbodyAlunosMatricula.querySelector(
            ".aluno-detalhes-row"
          );
          if (existingDetailRow) existingDetailRow.remove();

          // Cria a linha de detalhes
          const detailTr = document.createElement("tr");
          detailTr.classList.add("aluno-detalhes-row");
          detailTr.style.background = "#e9ecef";
          const detailTd = document.createElement("td");
          detailTd.colSpan = 8;

          const isTerminadoConfirmacao = confirmacao?.terminado ?? false;

          detailTd.innerHTML = `
                    <div class="detalhes-aluno px-0 py-0" title='Toque para fechar'>
                        <div style="display: flex; align-items: center; gap: 16px;flex-wrap: wrap;">
                            <img src="${
                              aluno.imagem ||
                              "./assets/img/blank-profile-picture-png.webp"
                            }" alt="${capitalizeWords(
            aluno.nome
          )}" class="avatar-tabela-nexus shadow" style="width:150px;height:150px;border-radius:0%;">
                            <div style="align-self:start">
                                <strong>${capitalizeWords(
                                  aluno.nome
                                )}</strong> <br>
                                <span style="margin-left:16px;">Data de NAscimento: <span class="text-primary" style="color:#1976d2; margin-left:8px;">${formatarData(
                                  aluno.dataNascimento
                                )}</span></span><br>
                                <span style="margin-left:16px;">Idade: <span class="text-primary" style="color:#1976d2; margin-left:8px;">${calcularIdade(
                                  aluno.dataNascimento
                                )}</span></span><br>
                                <span style="margin-left:16px;">Genêro: <span class="text-primary" style="color:#1976d2; margin-left:8px;">${
                                  aluno.genero || "-"
                                }</span></span><br>
                                <span style="margin-left:16px;">Status: <span class="text-primary" style="color:#1976d2; margin-left:8px;">${
                                  aluno.status
                                    ? toUpperCase(aluno.status)
                                    : !aluno.eliminado
                                    ? "Ativo"
                                    : "Inativo"
                                }</span></span><br>
                            </div>


                            <!-- Dados da turma -->
                              <div class="mx-5" style="align-self:start">
                                <span style="font-weight: 400">Dados Escolares</span> :
                                <span style="font-weight: 600">${
                                  capitalizeWords(aluno.matricula) || "-"
                                }</span> <br>
                                <span style="margin-left:16px;">Turma: <span class="text-primary" style="color:#1976d2; margin-left:8px;">${
                                  confirmacao?.turma?.nome || "-"
                                }</span></span>
                                <span hidden style="margin-left:16px;">Turno: <span class="text-primary" style="color:#1976d2; margin-left:8px;">${
                                  confirmacao?.turno || "-"
                                }</span></span><br>
                                <span style="margin-left:16px;">Educador(a): <span class="text-primary" style="color:#1976d2; margin-left:8px;">${
                                  confirmacao?.turma?.educador?.nome || "-"
                                }</span></span><br>
                                <span style="margin-left:16px;">Data Matrícula: <span class="text-primary" style="color:#1976d2; margin-left:8px;">${
                                  formatarData(confirmacao?.dataCadastro) || "-"
                                }</span></span><br>
                                <div ${
                                  confirmacao && isTerminadoConfirmacao
                                    ? ""
                                    : "hidden"
                                }>
                                    <span style="margin-left:16px;"><span class="badge bg-danger" style="; margin: 3px 8px;">ENCERRADA</span></span>
                                    <span style="margin-left:16px;">Data Encerramento    : <span class="text-primary" style="color:#1976d2; margin-left:8px;">${
                                      formatarData(confirmacao?.dataTermino) ||
                                      "-"
                                    }</span></span><br>
                                    <span style="margin-left:16px;">Usuario Encerramento: <span class="text-primary" style="color:#1976d2; margin-left:8px;">${
                                      confirmacao?.usuario_termino?.nome || "-"
                                    }</span></span><br>
                                </div>
                                </div>

                            <!-- Dados do Responsável -->
                            <div class="mx-5" style="align-self:start">
                                <span style="font-weight: 400">Responsável</span> :
                                <span style="font-weight: 600">${
                                  capitalizeWords(aluno.nomeResponsavel) || "-"
                                }</span> <br>
                                <span style="margin-left:16px;">Grau Parentesco: <span class="text-primary" style="color:#1976d2; margin-left:8px;">${
                                  aluno.parentesco || "-"
                                }</span></span><br>
                                <span style="margin-left:16px;">Contato: <span class="text-primary" style="color:#1976d2; margin-left:8px;">${
                                  aluno.telefoneResponsavel || "-"
                                }</span></span><br>
                                <span style="margin-left:16px;">Email: <span class="text-primary" style="color:#1976d2; margin-left:8px;">${
                                  aluno.emailResponsavel || "-"
                                }</span></span><br>
                                <span style="margin-left:16px;">Endereço: <span class="text-primary" style="color:#1976d2; margin-left:8px;">${
                                  capitalizeWords(aluno.endereco) || "-"
                                }</span></span><br>
                            </div>
                            <div class="col-12" style="align-self:start">
                                <button hidden ${
                                  aluno.eliminado ? "disabled" : ""
                                }
                                    title=' ${
                                      aluno.eliminado
                                        ? "Aluno Inativo, Abilita Primeiro"
                                        : ""
                                    }'
                                    id='btn-restaurar-aluno'
                                    ${
                                      confirmacao && !isTerminadoConfirmacao
                                        ? "hidden"
                                        : ""
                                    }
                                    type="button" class="btn btn-sm btn-outline-success mx-1" style="font-size: 0.8rem; margin: 5px; font-weight: 600; padding:7px 7px;min-width:unset;" >
                                    <i class="fas fa-arrow-rotate-left me-1"></i>
                                    Restaurar Confirmação
                                </button>

                                <button ${aluno.eliminado ? "disabled" : ""}
                                    title=' ${
                                      aluno.eliminado
                                        ? "Aluno Inativo, Abilita Primeiro"
                                        : ""
                                    }'
                                    id='btn-confimacao-aluno'
                                    ${
                                      confirmacao && !isTerminadoConfirmacao
                                        ? "hidden"
                                        : ""
                                    }
                                    type="button" class="btn btn-sm btn-success mx-1" style="font-size: 0.8rem; margin: 5px; font-weight: 600; padding:7px 7px;min-width:unset;" >
                                    <i class="fas fa-check-circle me-1"></i>
                                    Comfirmação do Aluno (NOVA TURMA)
                                </button>
                                
                                <button  ${
                                  aluno.eliminado ? "disabled" : ""
                                }   title=' ${
            aluno.eliminado ? "Aluno Inativo, Abilita Primeiro" : ""
          }'  id='btn-trocar-turma-aluno' ${
            !confirmacao || (confirmacao && isTerminadoConfirmacao)
              ? "hidden"
              : ""
          } type="button" class="btn btn-sm btn-outline-primary mx-1" style="font-size: 0.8rem; margin: 5px; font-weight: 600; padding:7px 7px;min-width:unset;" >
                                    <i class="fas fa-exchange-alt"></i>
                                    Trocar de Turma
                                </button>

                                <button  ${
                                  aluno.eliminado ? "disabled" : ""
                                }  title=' ${
            aluno.eliminado ? "Aluno Inativo, Abilita Primeiro" : ""
          }'  id='btn-terminar-confirmacao-aluno' ${
            !confirmacao || (confirmacao && isTerminadoConfirmacao)
              ? "hidden"
              : ""
          } type="button" class="btn btn-sm btn-outline-danger mx-1" style="font-size: 0.8rem; margin: 5px; font-weight: 600; padding:7px 7px;min-width:unset;" >
                                    <i class="fas fa-times-circle"></i>
                                    Terminar a Confirmacao
                                </button>
                            </div>
                        </div>
                    </div>
                `;
          detailTr.appendChild(detailTd);

          // Insere a linha de detalhes logo após a linha do funcionário
          tr.parentNode.insertBefore(detailTr, tr.nextSibling);

          // rola até o elemento de detalhe
          detailTr.scrollIntoView({ behavior: "smooth", block: "center" });

          detailTr.querySelector(".detalhes-aluno").scrollLeft = 0;

          if (trAnterior && trAnterior != tr) trAnterior.style.background = "";
          trAnterior = tr;

          // Fecha detalhes ao clicar novamente
          detailTr.addEventListener("click", () => {
            tr.style.background = "#e0c11298";

            setTimeout(() => {
              tr.style.background = "";
            }, 750);

            detailTr.remove();
            tr.scrollIntoView({ behavior: "smooth", block: "center" });
          });

          detailTr
            .querySelector("#btn-confimacao-aluno")
            .addEventListener("click", (event) => {
              event.preventDefault();
              event.stopPropagation();
              if (aluno.eliminado) return;
              abrirModalConfirmacaoMatricula(aluno);
            });

          detailTr
            .querySelector("#btn-trocar-turma-aluno")
            .addEventListener("click", (event) => {
              event.preventDefault();
              event.stopPropagation();
              if (aluno.eliminado) return;
              abrirModalConfirmacaoMatricula(aluno, confirmacao);
            });

          detailTr
            .querySelector("#btn-terminar-confirmacao-aluno")
            .addEventListener("click", (event) => {
              event.preventDefault();
              event.stopPropagation();
              if (aluno.eliminado) return;
              detailTr.querySelector("#btn-trocar-turma-aluno").disabled = true;
              finalizarConfirmacao(confirmacao, () => {
                event.target.innerHTML =
                  '<i class="fas fa-spinner fa-spin"></i>';
              });
            });
        }
      );

      tbodyAlunosMatricula.appendChild(tr);
    });
  }

  async function mostrarTurmaSelecionada(turmas = []) {
    const turmaSelecionada = turmas.find(
      (t) => t.idTurma == sltTurmaConfirmacao.value
    );
    const totalAlunos =
      turmaSelecionada?.alunos?.length ?? turmaSelecionada?.ocupadas ?? 0;
    const capacidade = turmaSelecionada?.capacidade || 1;
    const percentualOcupacao = Math.min((totalAlunos / capacidade) * 100, 100);

    const desc = "Selecione uma turma.";

    labelNomeEducadorConfirmacao.textContent =
      turmaSelecionada?.educador?.nome ?? desc;

    dataInicioTurmaConfirmacao.textContent =
      formatarData(turmaSelecionada?.dataInicio) ?? desc;

    labelCapacidadeTurmaConfirmacao.textContent =
      turmaSelecionada?.capacidade ?? desc;

    labelFaixaEtariaTurmaConfirmacao.textContent =
      turmaSelecionada?.descFaixaEtaria ?? desc;

    labelTotalAlunosTurma.textContent = turmaSelecionada?.alunos?.length ?? 0;
    labelPercentualCapacidadeTurmaConfirmacao.textContent =
      percentualOcupacao.toFixed(0);

    progressCapacidadeTurmaConfirmacao.style.width = percentualOcupacao + "%";

    if (turmaSelecionada?.educador?.nome) {
      const nomes = turmaSelecionada.educador.nome.trim().split(/\s+/);
      const abreviacao =
        nomes.length > 1
          ? nomes[0][0].toUpperCase() + nomes[nomes.length - 1][0].toUpperCase()
          : nomes[0][0].toUpperCase();
      labelAbreviacaoNomeEducadorConfirmacao.textContent = abreviacao;
    } else {
      labelAbreviacaoNomeEducadorConfirmacao.textContent = "";
    }
  }

  function abrirModalConfirmacaoMatricula(aluno, confirmacao) {
    window.abrirModalNexus(modalConfirmacaoTurma.id);
    alunoSelecionado = aluno;

    sltTurmaConfirmacao.value = confirmacao?.idTurma ?? "";
    titulomodalConfirmacaoTurma.textContent = !confirmacao
      ? "Confirmação do Aluno (NOVA TURMA)"
      : "Trocar Aluno de Turma";
    labelMatriculaConfirmacao.textContent = aluno.matricula;
    labelNomeAlunoCOnfirmacao.textContent = aluno.nome;
    labelIdadeConfirmacao.textContent = calcularIdade(aluno.dataNascimento);
    labelNomeResponsavelConfirmacao.textContent = aluno.nomeResponsavel;
    labelContactoResponsavelConfirmacao.textContent = aluno.telefoneResponsavel;
    mostrarTurmaSelecionada(turmasCarregadas);
  }

  function onError(res) {
    Swal.fire({
      title: res.message,
      icon: "error",
    });
  }

  function inicializarModuloMatriculas() {
    if (!secaoMatriculas.classList.contains("ativa")) return;

    labelTotalAlunosMatricula.innerHTML = `<i class="fa fa-spinner" aria-hidden="true"></i>`;
    labelTotalAlunosMatriculaAtivos.innerHTML = `<i class="fa fa-spinner" aria-hidden="true"></i>`;
    labelTotalAlunosMatriculaInativos.innerHTML = `<i class="fa fa-spinner" aria-hidden="true"></i>`;

    contarAlunos();
    resetarFormularioNovaMatricula();
    abilitarNovaMatricula(false);
    carregarAlunos(0);
    carregarTurmas();
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (
          entry.isIntersecting &&
          entry.target.id === "matriculas" &&
          entry.target.classList.contains("ativa")
        ) {
          inicializarModuloMatriculas();
        }
      });
    },
    { threshold: 0.01 }
  ); // Threshold baixo para garantir ativação

  observer.observe(secaoMatriculas);
  window.inicializarModuloMatriculas = inicializarModuloMatriculas;
})();
