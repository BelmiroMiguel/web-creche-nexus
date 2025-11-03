import { AppService, armazenamento, getUsuarioLogado } from "../app_service.js";
import { formatarDataInput, fotoPreview } from "../utils.js";

// js/modulos/perfil.js
(function () {
  "use strict";

  const secaoPerfil = document.getElementById("perfil");
  if (!secaoPerfil) return;
  $(formEditarPerfil).on("submit", salvarFuncionario);
  $(btnEditarDadosPerfil).on("click", () =>
    abilitarEditarFuncionario(getUsuarioLogado())
  );
  let funcionarioSelecionado = null;

  $(btnCancelarEditarPerfil).on("click", () => abilitarNovoFuncionaario(false));
  const formMeuPerfil = secaoPerfil.querySelector("#contetPerfilFuncionario");
  const avatarPerfilGrande = secaoPerfil.querySelector("#avatar-perfil-grande");
  const uploadAvatarPerfil = secaoPerfil.querySelector("#upload-avatar-perfil");
  const btnTrocarAvatarPerfil = secaoPerfil.querySelector(
    "#btn-trocar-avatar-perfil"
  );

  fotoPreview({
    inputFileImagem: inpFotoFuncionarioEditar,
    docImg: fotoPreviewFuncionarioEditar,
  });

  // dados do usuário logado
  let usuarioLogado = getUsuarioLogado();

  function carregarDadosPerfil() {
    usuarioLogado = getUsuarioLogado();
    if (!formMeuPerfil) return;
    formMeuPerfil.querySelector("#perfil-nome-usuario").value =
      usuarioLogado.nome;
    formMeuPerfil.querySelector("#perfil-email-usuario").value =
      usuarioLogado.email;
    formMeuPerfil.querySelector("#perfil-telefone-usuario").value =
      usuarioLogado.telefone;
    formMeuPerfil.querySelector("#perfil-funcao-usuario").value =
      usuarioLogado.funcao;
    formMeuPerfil.querySelector("#perfil-nivel-usuario").value =
      usuarioLogado.nivel;
    formMeuPerfil.querySelector("#avatar-perfil-grande").src =
      usuarioLogado.imagem;
  }

  function handleSalvarPerfil(event) {
    return;
    event.preventDefault();
    const email = formMeuPerfil.querySelector("#perfil-email-usuario").value;
    const senhaAtual = formMeuPerfil.querySelector("#perfil-senha-atual").value;
    const novaSenha = formMeuPerfil.querySelector("#perfil-nova-senha").value;
    const confirmaNovaSenha = formMeuPerfil.querySelector(
      "#perfil-confirma-nova-senha"
    ).value;

    // Validação básica
    if (novaSenha && novaSenha !== confirmaNovaSenha) {
      window.mostrarToast(
        "erro",
        "Erro de Senha",
        "As novas senhas não coincidem."
      );
      return;
    }
    if (novaSenha && !senhaAtual) {
      window.mostrarToast(
        "aviso",
        "Senha Atual Necessária",
        "Informe sua senha atual para definir uma nova."
      );
      return;
    }

    console.log("Salvando perfil (simulado):", {
      email,
      temNovaSenha: !!novaSenha,
    });
    window.mostrarToast("info", "Processando...", "Atualizando seu perfil...");

    setTimeout(() => {
      usuarioLogado.email = email; // Atualiza email simulado
      // Lógica de alteração de senha iria aqui (comunicação com backend)
      window.mostrarToast(
        "sucesso",
        "Perfil Atualizado",
        "Suas informações foram salvas."
      );
      // Limpar campos de senha
      formMeuPerfil.querySelector("#perfil-senha-atual").value = "";
      formMeuPerfil.querySelector("#perfil-nova-senha").value = "";
      formMeuPerfil.querySelector("#perfil-confirma-nova-senha").value = "";

      // Atualizar email no cabeçalho se o nome do usuário for exibido (ou se o email for)
      const nomeUsuarioCabecalho = document.querySelector(
        "#cabecalho-app .nome-usuario-admin"
      );
      if (
        nomeUsuarioCabecalho &&
        nomeUsuarioCabecalho.textContent.includes("@")
      ) {
        // Se o email estiver visível
        // Atualizar o email exibido no cabeçalho, se aplicável.
      }
    }, 1500);
  }

  function salvarFuncionario(event) {
    event.preventDefault();

    const nome = formEditarPerfil.inpNomeFuncionario.value;
    const dataNascimento = formEditarPerfil.inpDataNascimentoFuncionario.value;
    const genero = formEditarPerfil.sltGeneroFuncionario.value;
    const telefone = formEditarPerfil.inpTelefoneFuncionario.value;
    const email = formEditarPerfil.inpEmailFuncionario.value;
    const funcao = formEditarPerfil.sltFuncaoFuncionario.value;
    const nivel = formEditarPerfil.sltNivelFuncionario.value;
    const endereco = formEditarPerfil.inpEnderecoFuncionario.value;

    // Pega a imagem do input
    const fotoFile = formEditarPerfil.inpFotoFuncionarioEditar.files[0];

    // Monta o FormData
    const formDataFuncionario = new FormData();
    formDataFuncionario.append("nome", nome);
    formDataFuncionario.append("dataNascimento", dataNascimento);
    formDataFuncionario.append("genero", genero);
    formDataFuncionario.append("telefone", telefone);
    formDataFuncionario.append("email", email);
    formDataFuncionario.append("funcao", funcao);
    formDataFuncionario.append("nivel", nivel);
    formDataFuncionario.append("endereco", endereco);
    if (fotoFile) formDataFuncionario.append("imagem", fotoFile);
    formDataFuncionario.append("idUsuario", funcionarioSelecionado.idUsuario);

    const textBtn = btnCadastrarFuncionario.innerHTML;
    btnCadastrarFuncionario.disabled = true;
    btnCadastrarFuncionario.innerHTML = `<span class='pr-3' >Validando...</span> <i class="fas fa-spinner fa-spin"></i>`;

    AppService.postData("usuarios/editar", formDataFuncionario, {
      onSuccess: (res) => {
        Swal.fire({
          title: res.message,
          icon: "success",
          timer: 3000,
        });
        armazenamento.setItem("nexus-usuario", JSON.stringify(res.body));
        carregarDadosPerfil();

        abilitarNovoFuncionaario(false);
        resetarFormularioFuncionario();
      },
      onError: (res) => {
        Swal.fire({
          title: res.message,
          icon: "error",
        });
      },
      onResponse: () => {
        btnCadastrarFuncionario.innerHTML = textBtn;
        btnCadastrarFuncionario.disabled = false;
      },
    });

    return false;
  }

  async function resetarFormularioFuncionario() {
    if (typeof formEditarPerfil !== "undefined" && formEditarPerfil) {
      formEditarPerfil.reset();
      if (
        typeof fotoPreviewFuncionario !== "undefined" &&
        fotoPreviewFuncionario
      ) {
        fotoPreviewFuncionario.src =
          "./assets/img/blank-profile-picture-png.webp";
      }
    }

    inpFotoFuncionario.value = "";
    labelTituloCadastroFuncionario.innerHTML = "Registrar Novo Funcionário";
    labelBtnCadastrarFuncionario.innerHTML = "Cadastrar Funcionário";
    labelIdadeFuncionario.innerHTML = "";
    funcionarioSelecionado = null;
  }

  async function abilitarNovoFuncionaario(status = false) {
    resetarFormularioFuncionario();
    if (typeof formEditarPerfil !== "undefined" && formEditarPerfil) {
      if (status) {
        $(contetPerfilFuncionario).fadeOut(0);
        $(formEditarPerfil).fadeIn(300);
      } else {
        $(formEditarPerfil).fadeOut(0);
        $(contetPerfilFuncionario).fadeIn(300);
      }
    }
  }

  async function abilitarEditarFuncionario(funcionario) {
    abilitarNovoFuncionaario(true);
    funcionarioSelecionado = funcionario;

    labelTituloCadastroFuncionario.innerHTML = "Editar Dados do Funcionário";
    labelBtnCadastrarFuncionario.innerHTML = "Salvar Dados da Edição";
    formEditarPerfil.inpNomeFuncionario.value = funcionario.nome || "";
    formEditarPerfil.inpDataNascimentoFuncionario.value =
      formatarDataInput(funcionario.dataNascimento) || "";
    formEditarPerfil.sltGeneroFuncionario.value = funcionario.genero || "";
    formEditarPerfil.inpTelefoneFuncionario.value = funcionario.telefone || "";
    formEditarPerfil.inpEmailFuncionario.value = funcionario.email || "";
    formEditarPerfil.sltFuncaoFuncionario.value = funcionario.funcao || "";
    formEditarPerfil.sltNivelFuncionario.value = funcionario.nivel || "";
    formEditarPerfil.inpEnderecoFuncionario.value = funcionario.endereco || "";

    // calcular idade.
    if (funcionario.dataNascimento) {
      const dataNasc = new Date(funcionario.dataNascimento);
      const hoje = new Date();
      let idade = hoje.getFullYear() - dataNasc.getFullYear();
      const m = hoje.getMonth() - dataNasc.getMonth();
      if (m < 0 || (m === 0 && hoje.getDate() < dataNasc.getDate())) {
        idade--;
      }
      labelIdadeFuncionario.innerHTML = ` / ${idade} anos`;
    } else labelIdadeFuncionario.innerHTML = "";

    if (
      typeof fotoPreviewFuncionarioEditar !== "undefined" &&
      fotoPreviewFuncionarioEditar
    ) {
      fotoPreviewFuncionarioEditar.src =
        funcionario.imagem || "./assets/img/blank-profile-picture-png.webp";
    }
  }

  function inicializarModuloPerfil() {
    if (!secaoPerfil.classList.contains("ativa")) return;
    console.log("Módulo Perfil inicializado.");
    carregarDadosPerfil();

    formMeuPerfil?.addEventListener("submit", handleSalvarPerfil);

    btnTrocarAvatarPerfil?.addEventListener("click", () => {
      uploadAvatarPerfil?.click();
    });

    uploadAvatarPerfil?.addEventListener("change", function () {
      if (this.files && this.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
          if (avatarPerfilGrande) avatarPerfilGrande.src = e.target.result;
          // Simular upload e atualização do avatar
          usuarioLogado.avatarUrl = e.target.result; // Atualiza URL simulada
          // Atualizar avatar no cabeçalho principal
          const avatarCabecalho = document.getElementById("avatar-admin");
          if (avatarCabecalho) avatarCabecalho.src = e.target.result;
          window.mostrarToast(
            "sucesso",
            "Avatar Alterado",
            "Sua foto de perfil foi atualizada (simulado)."
          );
        };
        reader.readAsDataURL(this.files[0]);
      }
    });
  }

  $(formEditarPerfil).fadeOut(0);
  $(contetPerfilFuncionario).fadeIn(300);
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (
          entry.isIntersecting &&
          entry.target.id === "perfil" &&
          entry.target.classList.contains("ativa")
        ) {
          inicializarModuloPerfil();
        }
      });
    },
    { threshold: 0.1 }
  );

  // Adicionar o observer apenas se a seção de perfil existir
  if (secaoPerfil) {
    observer.observe(secaoPerfil);
  }

  window.inicializarModuloPerfil = inicializarModuloPerfil;
})();
