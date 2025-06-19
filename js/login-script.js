// login-script.js - Nexus OS Login Interactivity
'use strict';

import { AppService, armazenamento } from "./app_service.js";

document.addEventListener('DOMContentLoaded', () => {

    if (armazenamento.getItem('nexus-usuario')) {
        mostrarToastGlobal('Já estás logado', 'sucesso');
        setTimeout(() => window.location.href = 'index.html', 3000);
    }


    // === Slideshow de Background e Info ===
    let slideIndex = 0;
    const bgSlides = document.querySelectorAll(".background-slideshow .bg-slide");
    const dots = document.querySelectorAll(".dots-container .dot");
    const slideInfoTextEl = document.getElementById("slide-info-text");
    const slideInfos = [ // Textos correspondentes aos slides
        "Painel de Controle Abrangente",
        "Matrículas e Alunos Organizados",
        "Comunicação Direta com Responsáveis",
        "Relatórios Detalhados e Análises"
    ];
    let slideTimeout;

    function showSlide(n) {
        if (!bgSlides.length || !dots.length) return;

        slideIndex = n;
        if (slideIndex >= bgSlides.length) { slideIndex = 0; }
        if (slideIndex < 0) { slideIndex = bgSlides.length - 1; }

        bgSlides.forEach((slide, index) => {
            slide.classList.toggle('ativo', index === slideIndex);
            // Adicionar/Remover classe Ken Burns se quiser controlar por slide
            // slide.classList.toggle('ken-burns', index === slideIndex); 
        });
        dots.forEach((dot, index) => {
            dot.classList.toggle('ativo', index === slideIndex);
        });

        if (slideInfoTextEl && slideInfos[slideIndex]) {
            slideInfoTextEl.classList.remove('visivel');
            setTimeout(() => {
                slideInfoTextEl.textContent = slideInfos[slideIndex];
                slideInfoTextEl.classList.add('visivel');
            }, 250); // Pequeno delay para transição do texto
        }

        clearTimeout(slideTimeout);
        slideTimeout = setTimeout(() => showSlide(slideIndex + 1), 7000); // Próximo slide após 7 segundos
    }

    if (bgSlides.length > 0) {
        showSlide(0); // Inicia o slideshow
        dots.forEach(dot => {
            dot.addEventListener('click', function () {
                showSlide(parseInt(this.dataset.slideIndex));
            });
        });
        // Adiciona a classe Ken Burns ao primeiro slide ativo se desejar
        // if(bgSlides[0]) bgSlides[0].classList.add('ken-burns'); 
    }


    // === Toggle de Senha Visível ===
    document.querySelectorAll('.toggle-senha').forEach(btn => {
        btn.addEventListener('click', function () {
            const inputSenha = this.closest('.campo-form-login').querySelector('input[type="password"], input[type="text"]');
            const icone = this.querySelector('i');
            if (inputSenha.type === 'password') {
                inputSenha.type = 'text';
                icone.classList.remove('fa-eye');
                icone.classList.add('fa-eye-slash');
                this.setAttribute('aria-label', 'Ocultar Senha');
            } else {
                inputSenha.type = 'password';
                icone.classList.remove('fa-eye-slash');
                icone.classList.add('fa-eye');
                this.setAttribute('aria-label', 'Mostrar Senha');
            }
        });
    });

    // === Troca entre Formulário de Login e Recuperação ===
    const areaLogin = document.getElementById('area-login');
    const areaRecuperarSenha = document.getElementById('area-recuperar-senha');
    const linkEsqueceuSenha = document.getElementById('link-esqueceu-senha');
    const linkVoltarLogin = document.getElementById('link-voltar-login');
    const formLogin = document.getElementById('form-login');
    const formRecuperarSenha = document.getElementById('form-recuperar-senha');

    function mostrarArea(areaParaMostrar, areaParaEsconder) {
        if (areaParaMostrar && areaParaEsconder) {
            areaParaEsconder.classList.remove('ativa');
            // Esperar a animação de saída (se houver) antes de mostrar a nova
            // Ou, se a animação de entrada/saída do CSS já lida com display none, isso é suficiente.
            setTimeout(() => { // Garante que a animação de 'out' possa começar
                areaParaMostrar.classList.add('ativa');
                // Foco no primeiro input da nova área
                const primeiroInput = areaParaMostrar.querySelector('input:not([type="hidden"])');
                if (primeiroInput) primeiroInput.focus();
            }, 50); // Pequeno delay para permitir transições CSS
        }
    }

    if (linkEsqueceuSenha) {
        linkEsqueceuSenha.addEventListener('click', (e) => {
            e.preventDefault();
            mostrarArea(areaRecuperarSenha, areaLogin);
        });
    }
    if (linkVoltarLogin) {
        linkVoltarLogin.addEventListener('click', (e) => {
            e.preventDefault();
            mostrarArea(areaLogin, areaRecuperarSenha);
        });
    }

    // === Validação e Submissão de Formulários ===
    function validarCampo(input) {
        const campoForm = input.closest('.campo-form-login');
        const msgErroEl = campoForm ? campoForm.querySelector('.mensagem-erro') : null;
        let valido = true;
        let msgErro = '';

        if (input.required && input.value.trim() === '') {
            valido = false;
            msgErro = 'Este campo é obrigatório.';
        } else if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())) {
            valido = false;
            msgErro = 'Por favor, insira um email válido.';
        }
        // Adicionar mais validações (ex: tamanho mínimo de senha)

        if (msgErroEl) {
            msgErroEl.textContent = msgErro;
            input.classList.toggle('erro-validacao', !valido); // Classe para estilizar borda e mensagem
        }
        return valido;
    }

    document.querySelectorAll('.campo-form-login input[required]').forEach(input => {
        input.addEventListener('blur', () => validarCampo(input));
        input.addEventListener('input', () => { // Limpa erro ao digitar
            if (input.classList.contains('erro-validacao')) {
                validarCampo(input); // Revalida para remover o erro se corrigido
            }
        });
    });

    if (formLogin) {
        formLogin.addEventListener('submit', (e) => {
            e.preventDefault();
            let formValido = true;
            formLogin.querySelectorAll('input[required]').forEach(input => {
                if (!validarCampo(input)) formValido = false;
            });

            if (!formValido) return;

            const usuario = formLogin.usuario.value;
            const btnLogin = formLogin.querySelector('button[type="submit"]');
            const originalText = btnLogin.querySelector('span').textContent;
            const originalIcon = btnLogin.querySelector('i').outerHTML;

            btnLogin.disabled = true;
            btnLogin.innerHTML = `<span>Validando...</span> <i class="fas fa-spinner fa-spin"></i>`;


            AppService.postData(
                'usuarios/login',
                { email: usuario, senha: formLogin.senha.value, },
                {
                    onSuccess: (res) => {
                        mostrarToastGlobal(res.message, 'sucesso');
                        armazenamento.setItem('nexus-token', res.token)
                        armazenamento.setItem('nexus-usuario', JSON.stringify(res.body))
                        setTimeout(() => window.location.href = 'index.html', 1500);
                    },
                    onError: (error) => {
                        mostrarToastGlobal(error.message, 'erro');
                        btnLogin.disabled = false;
                        btnLogin.innerHTML = `<span>${originalText}</span> ${originalIcon}`;
                        // Adicionar classe de erro aos campos se a API retornar erro específico
                        formLogin.senha.classList.add('erro-validacao');
                        const msgErroSenha = formLogin.senha.closest('.campo-form-login').querySelector('.mensagem-erro');
                        if (msgErroSenha) msgErroSenha.textContent = "Credenciais inválidas.";
                    }
                }
            )
        });
    }

    if (formRecuperarSenha) {
        formRecuperarSenha.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = formRecuperarSenha['email-recuperacao'];
            if (!validarCampo(emailInput)) return;

            const btnRecuperar = formRecuperarSenha.querySelector('button[type="submit"]');
            const originalText = btnRecuperar.querySelector('span').textContent;
            const originalIcon = btnRecuperar.querySelector('i').outerHTML;

            btnRecuperar.disabled = true;
            btnRecuperar.innerHTML = `<span>Enviando...</span> <i class="fas fa-spinner fa-spin"></i>`;

            setTimeout(() => {
                // alert('Se o email estiver cadastrado, você receberá instruções.'); // Usar Toast
                mostrarToastGlobal('Se o email estiver cadastrado, você receberá instruções.', 'info');
                btnRecuperar.disabled = false;
                btnRecuperar.innerHTML = `<span>${originalText}</span> ${originalIcon}`;
                if (linkVoltarLogin) linkVoltarLogin.click();
            }, 1500);
        });
    }

    // Função Global para Toasts (se você não tiver uma no script principal)
    function mostrarToastGlobal(mensagem, tipo = 'info', duracao = 4000) {
        const toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container-login'; // ID diferente para não conflitar com o global se houver
        Object.assign(toastContainer.style, {
            position: 'fixed', top: '20px', right: '20px', zIndex: '10000',
            display: 'flex', flexDirection: 'column', gap: '10px'
        });
        document.body.appendChild(toastContainer);

        const toast = document.createElement('div');
        toast.className = `toast-notificacao ${tipo}`; // Reutiliza classes do CSS global
        // Adaptação do estilo do toast para login
        Object.assign(toast.style, {
            padding: '15px 20px', borderRadius: '8px', display: 'flex',
            alignItems: 'center', gap: '10px', minWidth: '300px',
            opacity: '0', transform: 'translateX(100%)',
            transition: 'opacity 0.3s ease, transform 0.3s ease'
        });
        // Cores baseadas no tema do body
        const isModoEscuro = document.body.classList.contains('modo-escuro');
        toast.style.backgroundColor = isModoEscuro ? '#2c3344' : '#ffffff';
        toast.style.color = isModoEscuro ? '#e0e6f1' : '#2c3e50';
        toast.style.boxShadow = isModoEscuro ? '0 5px 15px rgba(0,0,0,0.2)' : '0 5px 15px rgba(0,0,0,0.1)';

        let iconeClasse = 'fas fa-info-circle';
        if (tipo === 'sucesso') iconeClasse = 'fas fa-check-circle';
        else if (tipo === 'aviso') iconeClasse = 'fas fa-exclamation-triangle';
        else if (tipo === 'erro') iconeClasse = 'fas fa-times-circle';

        toast.innerHTML = `<i class="${iconeClasse}" style="font-size: 1.5rem; color: var(--login-cor-${tipo}-claro, inherit);"></i> <p>${mensagem}</p>`;

        toastContainer.appendChild(toast);
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        });

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            toast.addEventListener('transitionend', () => {
                toast.remove();
                if (toastContainer.childElementCount === 0) toastContainer.remove();
            }, { once: true });
        }, duracao);
    }


    // === Toggle de Tema na Tela de Login ===
    const botaoModoTemaLogin = document.getElementById('botao-modo-tema-login');

    function aplicarTemaLogin(tema) {
        document.body.className = tema; // Define a classe do body (modo-claro ou modo-escuro)
        if (botaoModoTemaLogin) {
            const icone = botaoModoTemaLogin.querySelector('i');
            icone.classList.toggle('fa-moon', tema === 'modo-claro');
            icone.classList.toggle('fa-sun', tema === 'modo-escuro');
            botaoModoTemaLogin.setAttribute('aria-label', tema === 'modo-escuro' ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro');
            botaoModoTemaLogin.setAttribute('aria-pressed', tema === 'modo-escuro');
        }
        localStorage.setItem('nexusTemaLogin', tema);
    }

    if (botaoModoTemaLogin) {
        botaoModoTemaLogin.addEventListener('click', () => {
            const temaAtual = document.body.classList.contains('modo-escuro') ? 'modo-claro' : 'modo-escuro';
            aplicarTemaLogin(temaAtual);
        });
    }

    // Carregar tema salvo ou preferência do sistema para a tela de login
    const temaSalvoLogin = localStorage.getItem('nexusTemaLogin');
    const temaGlobalApp = localStorage.getItem('nexusModoEscuro'); // Tema do app principal
    const preferenciaSistemaEscuro = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    let temaInicial = 'modo-escuro'; // Default da sua tag body
    if (temaSalvoLogin) {
        temaInicial = temaSalvoLogin;
    } else if (temaGlobalApp !== null) { // Se tema do login não salvo, mas o do app sim
        temaInicial = (temaGlobalApp === 'true') ? 'modo-escuro' : 'modo-claro';
    } else if (preferenciaSistemaEscuro) {
        temaInicial = 'modo-escuro';
    } else {
        temaInicial = 'modo-claro';
    }
    aplicarTemaLogin(temaInicial);


    // Label flutuante ( placeholder=" " é importante no HTML para :not(:placeholder-shown) )
    document.querySelectorAll('.campo-form-login input').forEach(input => {
        function checkValue() {
            // O label flutua se o input tiver valor OU estiver focado
            // O CSS já lida com o foco, aqui garantimos que flutue se houver valor no carregamento/autocomplete
            const label = input.parentElement.querySelector('.label-flutuante');
            if (label) {
                // A lógica do CSS com :not(:placeholder-shown) já deve cuidar disso.
                // Se houver problemas com autocomplete, pode ser necessário um check mais explícito aqui.
            }
        }
        checkValue(); // Checa no carregamento
        input.addEventListener('input', checkValue); // Checa ao digitar
        input.addEventListener('blur', checkValue); // Checa ao sair do campo
    });

}); // Fim do DOMContentLoaded
