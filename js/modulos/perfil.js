import { getUsuarioLogado } from "../app_service.js";

// js/modulos/perfil.js
(function () {
    'use strict';

    const secaoPerfil = document.getElementById('perfil');
    if (!secaoPerfil) return;

    const formMeuPerfil = secaoPerfil.querySelector('#form-meu-perfil');
    const avatarPerfilGrande = secaoPerfil.querySelector('#avatar-perfil-grande');
    const uploadAvatarPerfil = secaoPerfil.querySelector('#upload-avatar-perfil');
    const btnTrocarAvatarPerfil = secaoPerfil.querySelector('#btn-trocar-avatar-perfil');

    // dados do usuário logado
    let usuarioLogado = getUsuarioLogado();

    function carregarDadosPerfil() {
        if (!formMeuPerfil) return;
        formMeuPerfil.querySelector('#perfil-nome-usuario').value = usuarioLogado.nome;
        formMeuPerfil.querySelector('#perfil-email-usuario').value = usuarioLogado.email;
        formMeuPerfil.querySelector('#perfil-telefone-usuario').value = usuarioLogado.telefone;
        formMeuPerfil.querySelector('#perfil-funcao-usuario').value = usuarioLogado.funcao;
        formMeuPerfil.querySelector('#perfil-nivel-usuario').value = usuarioLogado.nivel;
        if (avatarPerfilGrande) avatarPerfilGrande.src = usuarioLogado.avatarUrl;
    }

    function handleSalvarPerfil(event) {
        event.preventDefault();
        const email = formMeuPerfil.querySelector('#perfil-email-usuario').value;
        const senhaAtual = formMeuPerfil.querySelector('#perfil-senha-atual').value;
        const novaSenha = formMeuPerfil.querySelector('#perfil-nova-senha').value;
        const confirmaNovaSenha = formMeuPerfil.querySelector('#perfil-confirma-nova-senha').value;

        // Validação básica
        if (novaSenha && novaSenha !== confirmaNovaSenha) {
            window.mostrarToast('erro', 'Erro de Senha', 'As novas senhas não coincidem.');
            return;
        }
        if (novaSenha && !senhaAtual) {
            window.mostrarToast('aviso', 'Senha Atual Necessária', 'Informe sua senha atual para definir uma nova.');
            return;
        }

        console.log("Salvando perfil (simulado):", { email, temNovaSenha: !!novaSenha });
        window.mostrarToast('info', 'Processando...', 'Atualizando seu perfil...');

        setTimeout(() => {
            usuarioLogado.email = email; // Atualiza email simulado
            // Lógica de alteração de senha iria aqui (comunicação com backend)
            window.mostrarToast('sucesso', 'Perfil Atualizado', 'Suas informações foram salvas.');
            // Limpar campos de senha
            formMeuPerfil.querySelector('#perfil-senha-atual').value = '';
            formMeuPerfil.querySelector('#perfil-nova-senha').value = '';
            formMeuPerfil.querySelector('#perfil-confirma-nova-senha').value = '';

            // Atualizar email no cabeçalho se o nome do usuário for exibido (ou se o email for)
            const nomeUsuarioCabecalho = document.querySelector('#cabecalho-app .nome-usuario-admin');
            if (nomeUsuarioCabecalho && nomeUsuarioCabecalho.textContent.includes('@')) { // Se o email estiver visível
                // Atualizar o email exibido no cabeçalho, se aplicável.
            }

        }, 1500);
    }

    function inicializarModuloPerfil() {
        if (!secaoPerfil.classList.contains('ativa')) return;
        console.log("Módulo Perfil inicializado.");

        carregarDadosPerfil();

        formMeuPerfil?.addEventListener('submit', handleSalvarPerfil);

        btnTrocarAvatarPerfil?.addEventListener('click', () => {
            uploadAvatarPerfil?.click();
        });

        uploadAvatarPerfil?.addEventListener('change', function () {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    if (avatarPerfilGrande) avatarPerfilGrande.src = e.target.result;
                    // Simular upload e atualização do avatar
                    usuarioLogado.avatarUrl = e.target.result; // Atualiza URL simulada
                    // Atualizar avatar no cabeçalho principal
                    const avatarCabecalho = document.getElementById('avatar-admin');
                    if (avatarCabecalho) avatarCabecalho.src = e.target.result;
                    window.mostrarToast('sucesso', 'Avatar Alterado', 'Sua foto de perfil foi atualizada (simulado).');
                }
                reader.readAsDataURL(this.files[0]);
            }
        });
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.target.id === 'perfil' && entry.target.classList.contains('ativa')) {
                inicializarModuloPerfil();
            }
        });
    }, { threshold: 0.1 });

    // Adicionar o observer apenas se a seção de perfil existir
    if (secaoPerfil) {
        observer.observe(secaoPerfil);
    }

    window.inicializarModuloPerfil = inicializarModuloPerfil;
})();