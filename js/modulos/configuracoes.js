import { AppService, getEmpresaLogada } from "./../app_service.js";

// js/modulos/configuracoes.js
(function () {
    'use strict';
    const empresaLogada = getEmpresaLogada();
    const secaoConfiguracoes = document.getElementById('configuracoes');
    if (!secaoConfiguracoes) return;

    const tabLinks = secaoConfiguracoes.querySelectorAll('.tab-link-nexus');
    const tabConteudos = secaoConfiguracoes.querySelectorAll('.tab-conteudo-nexus');

    // Forms de cada tab
    const formConfigGerais = secaoConfiguracoes.querySelector('#form-config-gerais');
    const formConfigAparencia = secaoConfiguracoes.querySelector('#form-config-aparencia');

    // Preview da logo
    const inputLogoCreche = secaoConfiguracoes.querySelector('#config-logo-creche');
    const previewLogoCreche = secaoConfiguracoes.querySelector('#preview-logo-creche');


    $(btnAbilitarEdicaoEmpresa).on('click', (e) => ablitarEdicaoEmpresa(true))
    $(btnCancelarEdicaoEmpresa).on('click', (e) => ablitarEdicaoEmpresa(false))
    //$(btnSalvarEdicaoEmpresa).on('click', salvarConfigGerais)

    function ativarTabConfig(targetId) {
        tabConteudos.forEach(tab => tab.classList.remove('ativo'));
        tabLinks.forEach(link => link.classList.remove('ativo'));

        const targetTab = secaoConfiguracoes.querySelector(targetId);
        const targetLink = secaoConfiguracoes.querySelector(`.tab-link-nexus[data-tab-target="${targetId}"]`);

        if (targetTab) targetTab.classList.add('ativo');
        if (targetLink) targetLink.classList.add('ativo');

        // Carregar dados específicos da tab ativa, se necessário
        if (targetId === "#tab-config-gerais") carregarConfigGerais();
        if (targetId === "#tab-config-aparencia") carregarConfigAparencia();
    }

    // carregar dados salvos da empresa
    function carregarConfigGerais() {

        if (formConfigGerais) {
            formConfigGerais.querySelector('#config-nome-creche').value = empresaLogada.nome;
            formConfigGerais.querySelector('#config-telefone-creche').value = empresaLogada.telefone;
            formConfigGerais.querySelector('#config-endereco-creche').value = empresaLogada.endereco;
            formConfigGerais.querySelector('#config-nif-creche').value = empresaLogada.nif;
            formConfigGerais.querySelector('#config-email-creche').value = empresaLogada.email;
            // ... carregar outros campos ...
            const logoSalva = localStorage.getItem('nexus_config_logo_url');
            if (logoSalva && previewLogoCreche) {
                previewLogoCreche.src = logoSalva;
                previewLogoCreche.style.display = 'block';
            }
        }
    }


    function ablitarEdicaoEmpresa(estado = false) {
        // Habilita ou desabilita os campos do formulário de acordo com o estado
        const campos = [
            formConfigGerais.querySelector('#config-nome-creche'),
            formConfigGerais.querySelector('#config-telefone-creche'),
            formConfigGerais.querySelector('#config-endereco-creche'),
            formConfigGerais.querySelector('#config-nif-creche'),
            formConfigGerais.querySelector('#config-email-creche')
        ];
        campos.forEach(campo => {
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

        const nome = formConfigGerais.querySelector('#config-nome-creche').value;
        const telefone = formConfigGerais.querySelector('#config-telefone-creche').value;
        const email = formConfigGerais.querySelector('#config-email-creche').value;
        const nif = formConfigGerais.querySelector('#config-nif-creche').value;
        const endereco = formConfigGerais.querySelector('#config-endereco-creche').value;

        AppService.putData('empresas',
            {
                nome, telefone, email, nif, endereco
            },
            {
                onSuccess: (body) => {
                    window.mostrarToast('sucesso', body.mesage, '');
                },
                onError: (res) => {
                    window.mostrarToast('erro', 'Falha', '');
                }
            });


        const arquivoLogo = inputLogoCreche?.files[0];
        if (arquivoLogo) {
            const reader = new FileReader();
            reader.onload = function (e) {
                localStorage.setItem('nexus_config_logo_url', e.target.result);
                if (previewLogoCreche) {
                    previewLogoCreche.src = e.target.result;
                    previewLogoCreche.style.display = 'block';
                }
                // Atualizar logo no cabeçalho principal (se houver)
                const logoCabecalho = document.querySelector('#cabecalho-app .logo-container img'); // Supondo que haja um img
                if (logoCabecalho) logoCabecalho.src = e.target.result;
            }
            reader.readAsDataURL(arquivoLogo);
        }

        window.mostrarToast('sucesso', 'Configurações Salvas', 'As configurações gerais foram atualizadas.');
        return false;
    }



    function carregarConfigAparencia() {
        if (formConfigAparencia) {
            formConfigAparencia.querySelector('#config-tema-padrao').value = localStorage.getItem('nexus_config_tema_padrao') || 'sistema';
            formConfigAparencia.querySelector('#config-cor-primaria-personalizada').value = localStorage.getItem('nexus_config_cor_primaria') || '#FF7700';
        }
    }

    function salvarConfigAparencia(event) {
        event.preventDefault();
        if (!formConfigAparencia) return;
        const temaPadrao = formConfigAparencia.querySelector('#config-tema-padrao').value;
        const corPrimaria = formConfigAparencia.querySelector('#config-cor-primaria-personalizada').value;

        localStorage.setItem('nexus_config_tema_padrao', temaPadrao);
        localStorage.setItem('nexus_config_cor_primaria', corPrimaria);

        // Aplicar cor primária dinamicamente (exemplo simplificado, requer mais lógica no CSS)
        document.documentElement.style.setProperty('--cor-primaria-claro', corPrimaria);
        // document.documentElement.style.setProperty('--cor-primaria-escuro', umaVersaoMaisEscuraDe(corPrimaria)); // Precisaria de uma função para isso

        window.mostrarToast('sucesso', 'Aparência Salva', 'As preferências de aparência foram atualizadas.');
        window.location.reload(); // Recarregar para ver todas as mudanças de tema/cor
    }


    function inicializarModuloConfiguracoes() {
        if (!secaoConfiguracoes.classList.contains('ativa')) return;
        console.log("Módulo Configurações inicializado.");

        tabLinks.forEach(link => {
            link.addEventListener('click', () => {
                const targetId = link.dataset.tabTarget;
                ativarTabConfig(targetId);
            });
        });

        const tabAtivaInicial = secaoConfiguracoes.querySelector('.tab-link-nexus.ativo');
        if (tabAtivaInicial) {
            ativarTabConfig(tabAtivaInicial.dataset.tabTarget);
        } else if (tabLinks.length > 0) {
            ativarTabConfig(tabLinks[0].dataset.tabTarget);
        }

        formConfigGerais?.addEventListener('submit', salvarConfigGerais);
        formConfigAparencia?.addEventListener('submit', salvarConfigAparencia);

        inputLogoCreche?.addEventListener('change', function () {
            if (this.files && this.files[0] && previewLogoCreche) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    previewLogoCreche.src = e.target.result;
                    previewLogoCreche.style.display = 'block';
                }
                reader.readAsDataURL(this.files[0]);
            } else if (previewLogoCreche) {
                previewLogoCreche.style.display = 'none';
                previewLogoCreche.src = '#';
            }
        });

        carregarConfigGerais()
        ablitarEdicaoEmpresa()
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.target.id === 'configuracoes' && entry.target.classList.contains('ativa')) {
                inicializarModuloConfiguracoes();
            }
        });
    }, { threshold: 0.1 });
    observer.observe(secaoConfiguracoes);
    window.inicializarModuloConfiguracoes = inicializarModuloConfiguracoes;
})();