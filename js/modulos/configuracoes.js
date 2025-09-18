import { formatMoney, renderPaginacao, toastGlobal } from "../utils.js";
import {
  AppService,
  armazenamento,
  getEmpresaLogada,
  getUsuarioLogado,
} from "./../app_service.js";

// js/modulos/configuracoes.js
(function () {
  "use strict";

  const secaoConfiguracoes = document.getElementById("configuracoes");
  if (!secaoConfiguracoes) return;

  const tabelaFaixaEtariaMensalidadeCorpo = document.querySelector(
    "#tabela-faixaetaria-mensalidade-corpo"
  );
  const tabLinks = secaoConfiguracoes.querySelectorAll(".tab-link-nexus");
  const tabConteudos = secaoConfiguracoes.querySelectorAll(
    ".tab-conteudo-nexus"
  );

  // Forms de cada tab
  const formConfigGerais = secaoConfiguracoes.querySelector(
    "#form-config-gerais"
  );
  const formConfigAparencia = secaoConfiguracoes.querySelector(
    "#form-config-aparencia"
  );

  // Preview da logo
  const inputLogoCreche = secaoConfiguracoes.querySelector(
    "#config-logo-creche"
  );
  const previewLogoCreche = secaoConfiguracoes.querySelector(
    "#preview-logo-creche"
  );

  let faixaEtariaMensalidadesCarregadas = [];
  let paginacaoFaixaEtariaMensalidade = {
    page: 0,
    totalPages: 0,
    totalItems: 0,
    items: 15,
  };

  $(btnAbilitarEdicaoEmpresa).on("click", (e) => ablitarEdicaoEmpresa(true));
  $(btnCancelarEdicaoEmpresa).on("click", (e) => ablitarEdicaoEmpresa(false));
  //$(btnSalvarEdicaoEmpresa).on('click', salvarConfigGerais)

  function ativarTabConfig(targetId) {
    tabConteudos.forEach((tab) => tab.classList.remove("ativo"));
    tabLinks.forEach((link) => link.classList.remove("ativo"));

    const targetTab = secaoConfiguracoes.querySelector(targetId);
    const targetLink = secaoConfiguracoes.querySelector(
      `.tab-link-nexus[data-tab-target="${targetId}"]`
    );

    if (targetTab) targetTab.classList.add("ativo");
    if (targetLink) targetLink.classList.add("ativo");
    console.log(targetId);

    // Carregar dados específicos da tab ativa, se necessário
    if (targetId == "#tab-config-gerais") carregarConfigGerais();
    if (targetId == "tab-config-mensalidades-faixaetaria-btn")
      carregarMensalidadesfaixaEtaria();
  }

  // carregar dados salvos da empresa
  function carregarConfigGerais() {
    const empresaLogada = getEmpresaLogada();
    if (formConfigGerais) {
      formConfigGerais.querySelector("#config-nome-creche").value =
        empresaLogada.nome;
      formConfigGerais.querySelector("#config-telefone-creche").value =
        empresaLogada.telefone;
      formConfigGerais.querySelector("#config-endereco-creche").value =
        empresaLogada.endereco;
      formConfigGerais.querySelector("#config-nif-creche").value =
        empresaLogada.nif;
      formConfigGerais.querySelector("#config-email-creche").value =
        empresaLogada.email;
      // ... carregar outros campos ...
      const logoSalva = localStorage.getItem("nexus_config_logo_url");
      if (logoSalva && previewLogoCreche) {
        previewLogoCreche.src = logoSalva;
        previewLogoCreche.style.display = "block";
      }
    }
  }

  function carregarMensalidadesfaixaEtaria(page = 0) {
    $(preload).fadeIn();

    AppService.getData(
      "mensalidades",
      { page },
      {
        onSuccess: (res) => {
          paginacaoFaixaEtariaMensalidade = res.paginacao;
          renderPaginacao({
            container: containerPaginacaoFaixaEtariaMensalidade,
            totalPaginas: paginacaoFaixaEtariaMensalidade?.totalPages,
            paginaAtual: paginacaoFaixaEtariaMensalidade?.page,
            totalItens: paginacaoFaixaEtariaMensalidade?.totalItems,
            onPageClick: (pagina) => carregarMensalidadesfaixaEtaria(pagina),
          });
          faixaEtariaMensalidadesCarregadas = res.body;

          renderizarTabelaFaixaEtariaMensalidade(
            faixaEtariaMensalidadesCarregadas
          );
        },
        onError: (error) => {
          console.error(error);
        },
        onResponse: () => {
          $(preload).fadeOut();
        },
      }
    );
  }

  function renderizarTabelaFaixaEtariaMensalidade(
    faixaEtariaMensalidades = []
  ) {
    tabelaFaixaEtariaMensalidadeCorpo.innerHTML = ""; // Limpa tabela

    if (faixaEtariaMensalidades.length === 0) {
      tabelaFaixaEtariaMensalidadeCorpo.innerHTML = `<tr><td colspan="7" class="sem-dados">Nenhum funcionário encontrado.</td></tr>`;
      return;
    }

    faixaEtariaMensalidades.forEach((faixaetariaMensalidade, index) => {
      const tr = document.createElement("tr");
      tr.classList.add("animar-item-lista", "p-0", "m-0");

      // Corrige a contagem de itens considerando o número de itens por página
      const itemIndex =
        (paginacaoFaixaEtariaMensalidade?.page - 1) *
          paginacaoFaixaEtariaMensalidade?.items +
          index +
          1 || index + 1;

      tr.innerHTML = `
            <td class="px-4 py-3">${itemIndex}</td>
            <td class="px-4 py-3 funcionario-nome">
          ${faixaetariaMensalidade.descFaixaEtaria}
            </td>
            <td class="px-4 py-3 w-98 funcionario-funcao">
              <span class="mensalidade-valor">${formatMoney(
                faixaetariaMensalidade.mensalidade
              )}</span>
              
              <input  required  type="number"  min="0" placeholder="${formatMoney(
                faixaetariaMensalidade.mensalidade
              )}" 
                class="input-mensalidade w-32 px-3 py-1.5 rounded-md border-2!  w-50!
                border-orange-100! focus:border-orange-300! focus:ring-1! focus:ring-orange-600! 
                outline-none"   style="display:none;"/>

              <i hidden class="fas fa-spinner fa-spin mx-3"></i>

              <button type="button"
                class="botao-pequeno-nexus salvar btn-salvar-mensalidade mx-3"
                style="display:none; background:#4f52ff; color:#fff; border:none; border-radius:6px; padding:6px 10px; font-size:14px; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.15); transition:all 0.25s ease;"
                title="Salvar Mensalidade"
                aria-label="Salvar Mensalidade">
                <i class="fas fa-save"></i> 
              </button>

              <button type="button"
                class="botao-pequeno-nexus cancelar btn-cancelar-mensalidade"
                style="display:none; background:#f1e7e7; color:#000; border:none; border-radius:6px; padding:6px 10px; font-size:14px; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.15); transition:all 0.25s ease;"
                title="Cancelar Mensalidade"
                aria-label="Cancelar Mensalidade">
                <i class="fas fa-times"></i> 
              </button>

            </td>
            <td class="px-4 py-3 funcionario-acoes">
              <button class="botao-pequeno-nexus editar btn-editar-mensalidade" title="Editar Mensalidade"><i class="fas fa-pen-to-square"></i></button>
            </td>
        `;

      const btnEditar = tr.querySelector(".btn-editar-mensalidade");
      const btnSalvar = tr.querySelector(".btn-salvar-mensalidade");
      const btnCancelar = tr.querySelector(".btn-cancelar-mensalidade");
      const inputMensalidade = tr.querySelector(".input-mensalidade");
      const spanMensalidade = tr.querySelector(".mensalidade-valor");
      const spinner = tr.querySelector(".fa-spin");

      btnEditar.addEventListener("click", () => {
        inputMensalidade.style.display = "inline-block";
        btnSalvar.style.display = "inline-block";
        btnCancelar.style.display = "inline-block";
        spanMensalidade.style.display = "none";
        btnEditar.style.opacity = "0";
        btnEditar.disabled = true;
        inputMensalidade.disabled = false;
        $(inputMensalidade)
          .css({ transform: "scale(0.1)", opacity: 0 })
          .animate({ opacity: 1 }, 300)
          .css({ transition: "transform 0.3s ease" })
          .css("transform", "scale(1)");
      });

      btnCancelar.addEventListener("click", () => {
        inputMensalidade.style.display = "none";
        btnSalvar.style.display = "none";
        btnCancelar.style.display = "none";
        spanMensalidade.style.display = "inline-block";
        btnEditar.style.display = "inline-block";
        btnEditar.style.opacity = "1";
        btnEditar.disabled = false;
        spinner.hidden = true;
      });

      inputMensalidade.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          btnSalvar.click();
        }
      });

      btnSalvar.addEventListener("click", () => {
        const valor = inputMensalidade.value.trim();

        if (!inputMensalidade.reportValidity()) {
          return; // se inválido, o navegador mostra e já para aqui
        }

        // Validação
        if (!valor || isNaN(valor) || Number(valor) <= 0) {
          inputMensalidade.focus();
          return;
        }

        const novaMensalidade = inputMensalidade.value;
        faixaetariaMensalidade.mensalidade = novaMensalidade;
        spanMensalidade.textContent = novaMensalidade;
        spinner.hidden = false;
        inputMensalidade.disabled = true;
        btnSalvar.style.display = "none";
        btnCancelar.style.display = "none";

        // Aqui você pode adicionar a lógica para salvar a nova mensalidade no backend
        AppService.putData(
          `mensalidades`,
          {
            idFaixaEtariaMensalidade:
              faixaetariaMensalidade.idFaixaEtariaMensalidade,
            mensalidade: novaMensalidade,
          },
          {
            onSuccess: (res) => {
              // Atualiza a faixaEtariaMensalidade no array carregado
              faixaEtariaMensalidadesCarregadas =
                faixaEtariaMensalidadesCarregadas.map((item) => {
                  if (
                    item.idFaixaEtariaMensalidade ===
                    faixaetariaMensalidade.idFaixaEtariaMensalidade
                  ) {
                    return { ...item, mensalidade: novaMensalidade };
                  }
                  return item;
                });

              Swal.fire({
                title: res.message,
                icon: "success",
                timer: 3000,
              });
            },
            onError: (res) => {
              Swal.fire({
                title: res.message,
                icon: "error",
              });
            },
            onResponse: (res) => {
              btnCancelar.click();
            },
          }
        );
      });
      tabelaFaixaEtariaMensalidadeCorpo.appendChild(tr);
    });
  }

  function ablitarEdicaoEmpresa(estado = false) {
    // Habilita ou desabilita os campos do formulário de acordo com o estado
    const campos = [
      formConfigGerais.querySelector("#config-nome-creche"),
      formConfigGerais.querySelector("#config-telefone-creche"),
      formConfigGerais.querySelector("#config-endereco-creche"),
      formConfigGerais.querySelector("#config-nif-creche"),
      formConfigGerais.querySelector("#config-email-creche"),
    ];
    campos.forEach((campo) => {
      if (campo) {
        $(campo).fadeOut(150, function () {
          campo.readOnly = !estado;
          $(this).fadeIn(150);
        });
      }
    });

    if (estado) {
      $(btnAbilitarEdicaoEmpresa).fadeOut(300);
      $(contentBtnEdicaoEmpresa).fadeIn(300);
    } else {
      $(btnAbilitarEdicaoEmpresa).fadeIn(300);
      $(contentBtnEdicaoEmpresa).fadeOut(300);
    }
  }

  function salvarConfigGerais(event) {
    event.preventDefault();

    const nome = formConfigGerais.querySelector("#config-nome-creche").value;
    const telefone = formConfigGerais.querySelector(
      "#config-telefone-creche"
    ).value;
    const email = formConfigGerais.querySelector("#config-email-creche").value;
    const nif = formConfigGerais.querySelector("#config-nif-creche").value;
    const endereco = formConfigGerais.querySelector(
      "#config-endereco-creche"
    ).value;

    AppService.putData(
      "empresas",
      {
        nome,
        telefone,
        email,
        nif,
        endereco,
      },
      {
        onSuccess: (res) => {
          const usuario = getUsuarioLogado();
          usuario.empresa = res.body;

          armazenamento.setItem("nexus-usuario", JSON.stringify(usuario));

          carregarConfigGerais();
          btnCancelarEdicaoEmpresa.click();
          Swal.fire({
            title: res.message,
            icon: "success",
            timer: 3000,
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

    const arquivoLogo = inputLogoCreche?.files[0];
    if (arquivoLogo) {
      const reader = new FileReader();
      reader.onload = function (e) {
        localStorage.setItem("nexus_config_logo_url", e.target.result);
        if (previewLogoCreche) {
          previewLogoCreche.src = e.target.result;
          previewLogoCreche.style.display = "block";
        }
        // Atualizar logo no cabeçalho principal (se houver)
        const logoCabecalho = document.querySelector(
          "#cabecalho-app .logo-container img"
        ); // Supondo que haja um img
        if (logoCabecalho) logoCabecalho.src = e.target.result;
      };
      reader.readAsDataURL(arquivoLogo);
    }

    window.mostrarToast(
      "sucesso",
      "Configurações Salvas",
      "As configurações gerais foram atualizadas."
    );
    return false;
  }

  function inicializarModuloConfiguracoes() {
    if (!secaoConfiguracoes.classList.contains("ativa")) return;
    console.log("Módulo Configurações inicializado.");

    tabLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        const targetId = e.target.id;
        ativarTabConfig(targetId);
      });
    });

    const tabAtivaInicial = secaoConfiguracoes.querySelector(
      ".tab-link-nexus.ativo"
    );
    if (tabAtivaInicial) {
      ativarTabConfig(tabAtivaInicial.dataset.tabTarget);
    } else if (tabLinks.length > 0) {
      ativarTabConfig(tabLinks[0].dataset.tabTarget);
    }

    formConfigGerais?.addEventListener("submit", salvarConfigGerais);

    inputLogoCreche?.addEventListener("change", function () {
      if (this.files && this.files[0] && previewLogoCreche) {
        const reader = new FileReader();
        reader.onload = function (e) {
          previewLogoCreche.src = e.target.result;
          previewLogoCreche.style.display = "block";
        };
        reader.readAsDataURL(this.files[0]);
      } else if (previewLogoCreche) {
        previewLogoCreche.style.display = "none";
        previewLogoCreche.src = "#";
      }
    });

    carregarConfigGerais();
    ablitarEdicaoEmpresa();
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (
          entry.isIntersecting &&
          entry.target.id === "configuracoes" &&
          entry.target.classList.contains("ativa")
        ) {
          inicializarModuloConfiguracoes();
        }
      });
    },
    { threshold: 0.1 }
  );
  observer.observe(secaoConfiguracoes);
  window.inicializarModuloConfiguracoes = inicializarModuloConfiguracoes;
})();
