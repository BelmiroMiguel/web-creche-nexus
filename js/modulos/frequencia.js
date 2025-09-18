import { AppService } from "../app_service.js";
import {
  capitalizeWords,
  formatarData,
  formatarDataInput,
  fotoPreview,
  renderPaginacao,
  toUpperCase,
} from "../utils.js";

// js/modulos/frequencia.js
(function () {
  "use strict";

  const secaoFrequencia = document.getElementById("frequencia");
  if (!secaoFrequencia) {
    console.warn("Seção Frequência não encontrada.");
    return;
  }

  let turmaSelecionada = null;
  let turmasCarregadas = [];
  let confirmacoesTurmaSelecionada = [];
  let totalItemsPorPagina = 15;

  let paginacaoFrequencia = {
    page: 0,
    totalPages: 0,
    totalItems: 0,
    items: 15,
  };

  $(sltFiltroTurmaFrequencia).on("change", () => renderizarConfirmacoes());
  $(sltFiltroStatusFrequencia).on("input", () => renderizarConfirmacoes());
  $(inpFiltroDataFrequencia).on("input", () => renderizarConfirmacoes());
  $(inpFiltroNomeMatriculaFrequencia).on("input", () =>
    renderizarConfirmacoes()
  );

  function renderizarConfirmacoes(pagina = 1) {
    tbodyFrequencia.innerHTML = "";
    const turmaSelecionada = turmasCarregadas.find(
      (turma) => turma.idTurma == sltFiltroTurmaFrequencia.value
    );
    const dataFiltro = inpFiltroDataFrequencia.value || new Date();

    labelTotalAlunosFrequencia.textContent =
      turmaSelecionada?.confirmacoes?.length ?? 0;
    labelTotalMeninosFrequencia.textContent =
      turmaSelecionada.confirmacoes?.filter((c) => c.aluno.genero === "m")
        .length ?? 0;
    labelTotalMeninasFrequencia.textContent =
      turmaSelecionada.confirmacoes?.filter((c) => c.aluno.genero === "f")
        .length ?? 0;

    $(preload).fadeIn();

    AppService.getData(
      "confirmacoes",
      {
        idTurma: turmaSelecionada.idTurma,
        statusFrequencia: sltFiltroStatusFrequencia.value,
        dataFiltro: dataFiltro,
        items: totalItemsPorPagina,
        page: pagina,
      },
      {
        onSuccess: (res) => {
          const confirmacoesCarregadas = res.body;
          paginacaoFrequencia = res.paginacao;

          renderPaginacao({
            container: containerPaginacaoFrequencia,
            totalPaginas: paginacaoFrequencia.totalPages,
            paginaAtual: paginacaoFrequencia.page,
            totalItens: paginacaoFrequencia.totalItems,
            onPageClick: (pagina) => renderizarConfirmacoes(pagina),
          });

          confirmacoesCarregadas.forEach((confirmacao, index) => {
            //frequencia = confirmacao?.frequencias?.[0];
            let frequencia = confirmacao?.frequencias.find(
              (freq) =>
                formatarDataInput(freq.dataFrequencia) ==
                formatarDataInput(dataFiltro)
            );
            const template = templateLinhaFrequencia.content.cloneNode(true);

            template.querySelector("#labelNomeAlunoFrequencia").textContent =
              capitalizeWords(confirmacao.aluno.nome);

            const labelStatusAlunoFrequencia = template.querySelector(
              "#labelStatusAlunoFrequencia"
            );

            labelStatusAlunoFrequencia.textContent = frequencia
              ? "Presente"
              : "Ausente";
            labelStatusAlunoFrequencia.classList.add(
              frequencia ? "bg-success" : "bg-danger"
            );

            template.querySelector("#labelDataEntradaFrequencia").textContent =
              formatarData(frequencia?.dataEntrada ?? dataFiltro);

            template.querySelector("#labelDataSaidaFrequencia").textContent =
              formatarData(frequencia?.dataSaida ?? dataFiltro);

            const inputHorarioEntradaFrequencia = template.querySelector(
              "#inputHorarioEntradaFrequencia"
            );
            inputHorarioEntradaFrequencia.value = frequencia?.horaEntrada;

            const inputHorarioSaidaFrequencia = template.querySelector(
              "#inputHorarioSaidaFrequencia"
            );
            inputHorarioSaidaFrequencia.value = frequencia?.horaSaida;

            const inputObservacaoEntradaFrequencia = template.querySelector(
              "#inputObservacaoEntradaFrequencia"
            );
            inputObservacaoEntradaFrequencia.value =
              frequencia?.observacaoEntrada ?? "";

            const inputObservacaoSaidaFrequencia = template.querySelector(
              "#inputObservacaoSaidaFrequencia"
            );
            inputObservacaoSaidaFrequencia.value =
              frequencia?.observacaoSaida ?? "";

            const sltResponsavelEntradaFrequencia = template.querySelector(
              "#sltResponsavelEntradaFrequencia"
            );
            const sltResponsavelSaidaFrequencia = template.querySelector(
              "#sltResponsavelSaidaFrequencia"
            );

            template.querySelector("#labelQuantidade").innerText = (index + 1 + ((pagina - 1) * totalItemsPorPagina)).toString();

            // Cria um array de responsáveis a partir dos campos disponíveis em frequencia
            const responsaveis = [];
            for (let i = 1; i <= 4; i++) {
              const nome =
                confirmacao.aluno[`nomeResponsavel${i == 1 ? "" : i}`];
              const telefone =
                confirmacao.aluno[`telefoneResponsavel${i == 1 ? "" : i}`];

              const grauParentesco =
                confirmacao.aluno[`grauParentesco${i == 1 ? "" : i}`];
              if (nome) {
                responsaveis.push({
                  nome,
                  telefone,
                  grauParentesco,
                });
              }
            }

            // adiciona os nomes antigos dos responsavei se ja foram editados
            if (
              frequencia &&
              !responsaveis.some(
                (r) => r.nome == frequencia.nomeResponsavelEntrega?.split('-')[0]
              )
            ) {
              const nome = frequencia.nomeResponsavelEntrega.split('-')[0];
              const telefone = frequencia.nomeResponsavelEntrega.split('-')?.[1] ?? "sem";
              const grauParentesco = frequencia.nomeResponsavelEntrega.split('-')?.[2] ?? "sem";
              responsaveis.push({
                nome,
                telefone,
                grauParentesco,
                disabled: true// como o nome ja fo editado para nao se escolher novamente
              });
            }

            if (
              frequencia &&
              frequencia.nomeResponsavelBusca?.split('-')[0] &&
              frequencia.horaSaida &&
              !responsaveis.some(
                (r) => r.nome == frequencia.nomeResponsavelBusca
              )
            ) {
              const nome = frequencia.nomeResponsavelBusca.split('-')[0];
              const telefone = frequencia.nomeResponsavelBusca.split('-')?.[1] ?? "sem";
              const grauParentesco = frequencia.nomeResponsavelBusca.split('-')?.[2] ?? "sem";
              responsaveis.push({
                nome,
                telefone,
                grauParentesco,
                disabled: true
              });
            }

            sltResponsavelEntradaFrequencia.innerHTML = "";
            sltResponsavelEntradaFrequencia.innerHTML =
              '<option value="" selected>Selecionar...</option>';

            sltResponsavelSaidaFrequencia.innerHTML = "";
            sltResponsavelSaidaFrequencia.innerHTML =
              '<option value="" selected>Selecionar...</option>';

            responsaveis.forEach((resp) => {
              const option = document.createElement("option");
              const option2 = document.createElement("option");
              option2.value = option.value = resp.nome;

              option.setAttribute("data-disabled", resp.disabled);
              option2.setAttribute("data-disabled", resp.disabled);

              option2.textContent = option.textContent = `${capitalizeWords(
                resp.nome
              )} (${capitalizeWords(resp.grauParentesco)})`;
              if (resp.telefone) {
                option.setAttribute("data-telefone", resp.telefone);
                option2.setAttribute("data-telefone", resp.telefone);
              }
              option.setAttribute("data-grau-parentesco", resp.grauParentesco);
              option2.setAttribute(
                "data-grau-parentesco",
                resp.grauParentesco
              );

              sltResponsavelEntradaFrequencia.appendChild(option);
              sltResponsavelSaidaFrequencia.appendChild(option2);
            });


            sltResponsavelEntradaFrequencia.value =
              frequencia?.nomeResponsavelEntrega?.split('-')?.[0] ?? "";
            sltResponsavelSaidaFrequencia.value =
              frequencia?.nomeResponsavelBusca?.split('-')?.[0] ?? "";
            console.log("tetse");

            const labelTelefoneResponsavelEntradaFrequencia = template.querySelector(
              "#labelTelefoneResponsavelEntradaFrequencia"
            );
            labelTelefoneResponsavelEntradaFrequencia.innerText = sltResponsavelEntradaFrequencia.options[sltResponsavelEntradaFrequencia.selectedIndex].dataset.telefone ?? '';

            const labelTelefoneResponsavelSaidaFrequencia = template.querySelector(
              "#labelTelefoneResponsavelSaidaFrequencia"
            );
            labelTelefoneResponsavelSaidaFrequencia.innerText = sltResponsavelSaidaFrequencia.options[sltResponsavelSaidaFrequencia.selectedIndex].dataset.telefone ?? '';


            const btnRegistrarEntradaFrequencia = template.querySelector(
              "#btnRegistrarEntradaFrequencia"
            );

            const btnRegistrarSaidaFrequencia = template.querySelector(
              "#btnRegistrarSaidaFrequencia"
            );

            btnRegistrarEntradaFrequencia.disabled = true
            $(sltResponsavelEntradaFrequencia).on('change', () => {
              const option = sltResponsavelEntradaFrequencia.options[sltResponsavelEntradaFrequencia.selectedIndex];
              labelTelefoneResponsavelEntradaFrequencia.innerText = option.dataset.telefone ?? '';
              btnRegistrarEntradaFrequencia.disabled = !option.dataset.disabled || option.dataset.disabled == 'true'
            })

            btnRegistrarSaidaFrequencia.disabled = true
            $(sltResponsavelSaidaFrequencia).on('change', () => {
              const option = sltResponsavelSaidaFrequencia.options[sltResponsavelSaidaFrequencia.selectedIndex];
              labelTelefoneResponsavelSaidaFrequencia.innerText = option.dataset.telefone ?? '';
              btnRegistrarSaidaFrequencia.disabled = !option.dataset.disabled || option.dataset.disabled == 'true'
            })

            const onSuccessFrequencia = (res) => {
              const frequencia = res.body;
              const turma = turmasCarregadas.find(
                (t) => t.idTurma == sltFiltroTurmaFrequencia.value
              );
              if (turma) {
                const conf = turma.confirmacoes.find(
                  (c) => c.idAlunoTurma == confirmacao.idAlunoTurma
                );
                if (conf) {
                  // Remove frequência do mesmo dia, se existir
                  conf.frequencias = conf.frequencias.filter(
                    (f) =>
                      formatarDataInput(f.dataFrequencia) !=
                      formatarDataInput(frequencia.dataFrequencia)
                  );
                  // Adiciona a nova frequência
                  conf.frequencias.push(frequencia);
                }
              }

              renderizarConfirmacoes();
              Swal.fire({
                title: res.message,
                icon: "success",
                timer: 3000,
              });
            };

            let loadEntrada = false;
            $(btnRegistrarEntradaFrequencia).on("click", () => {
              const campos = [
                inputHorarioEntradaFrequencia,
                sltResponsavelEntradaFrequencia,
              ];

              let erro = false;
              for (let i = 0; i < campos.length; i++) {
                if (!campos[i].checkValidity()) {
                  campos[i].reportValidity();
                  erro = true;
                  break;
                }
              }

              if (loadEntrada || erro) return;
              loadEntrada = true;

              btnRegistrarEntradaFrequencia.innerHTML =
                '<i class="fas fa-spinner fa-spin my-3 mx-1"></i>';

              const option = sltResponsavelEntradaFrequencia.options[sltResponsavelEntradaFrequencia.selectedIndex];

              if (!erro) {
                AppService.postData(
                  "frequencia/entrada",
                  {
                    idAlunoTurma: confirmacao.idAlunoTurma,
                    horaEntrada: inputHorarioEntradaFrequencia.value,
                    dataFrequencia: dataFiltro,
                    observacaoEntrada: inputObservacaoEntradaFrequencia.value,
                    nomeResponsavelEntrega: `${option.value}-${option.dataset.telefone ?? ''}-${option.dataset.grauParentesco ?? ''}`
                  },
                  {
                    onSuccess: onSuccessFrequencia,
                    onError: (res) => {
                      Swal.fire({
                        title: res.message,
                        icon: "error",
                        timer: 3000,
                      });
                    },
                    onResponse: renderizarConfirmacoes,
                  }
                );
              }
            });

            let loadSaida = false;
            $(btnRegistrarSaidaFrequencia).on("click", () => {
              const campos = [
                inputHorarioSaidaFrequencia,
                sltResponsavelSaidaFrequencia,
              ];

              let erro = false;
              for (let i = 0; i < campos.length; i++) {
                if (!campos[i].checkValidity()) {
                  campos[i].reportValidity();
                  erro = true;
                  break;
                }
              }

              if (loadSaida || erro) return;
              loadSaida = true;

              btnRegistrarSaidaFrequencia.innerHTML =
                '<i class="fas fa-spinner fa-spin my-3 mx-1"></i>';

              const option = sltResponsavelSaidaFrequencia.options[sltResponsavelSaidaFrequencia.selectedIndex];

              if (!erro) {
                AppService.postData(
                  "frequencia/saida",
                  {
                    idFrequenciaAlunoTurma: frequencia?.idFrequenciaAlunoTurma,
                    horaSaida: inputHorarioSaidaFrequencia.value,
                    observacaoSaida: inputObservacaoSaidaFrequencia.value,
                    nomeResponsavelBusca: `${option.value}-${option.dataset.telefone ?? ''}-${option.dataset.grauParentesco ?? ''}`
                  },
                  {
                    onSuccess: onSuccessFrequencia,
                    onError: (res) => {
                      Swal.fire({
                        title: res.message,
                        icon: "error",
                        timer: 3000,
                      });
                    },
                    onResponse: renderizarConfirmacoes,
                  }
                );
              }
            });

            tbodyFrequencia.appendChild(template);
          });
        },
        onResponse: () => $(preload).fadeOut(),
      }
    );
  }

  async function carregarTurmas() {
    AppService.getData(
      "turmas",
      { eliminado: false, items: 500000 },
      {
        onSuccess: (res) => {
          turmasCarregadas = res.body;
          sltFiltroTurmaFrequencia.innerHTML = "";
          sltFiltroTurmaFrequencia.innerHTML = `<option value="" selected disabled>Selecione uma turma...</option>`;
          turmasCarregadas.forEach((turma) => {
            const option = document.createElement("option");
            option.value = turma.idTurma;
            option.textContent = `${turma.nome} (${turma.descFaixaEtaria})`;
            sltFiltroTurmaFrequencia.appendChild(option);
          });
        },
        onError: (res) => {
          console.error(res);
        },
      }
    );
  }

  function inicializarModuloFrequencia() {
    if (!secaoFrequencia.classList.contains("ativa")) return;

    carregarTurmas();
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (
          entry.isIntersecting &&
          entry.target.id === "frequencia" &&
          entry.target.classList.contains("ativa")
        ) {
          inicializarModuloFrequencia();
        }
      });
    },
    { threshold: 0.01 }
  );
  observer.observe(secaoFrequencia);
  window.inicializarModuloFrequencia = inicializarModuloFrequencia;
})();
