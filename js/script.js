// js/script.js - Script Principal do Nexus OS
'use strict'; // Modo estrito para melhor qualidade de código

document.addEventListener('DOMContentLoaded', () => {
    // --- Seletores Globais ---
    const body = document.body;
    const loadingOverlay = document.getElementById('loading-overlay');
    const appWrapper = document.getElementById('app-wrapper');

    // Cabeçalho
    const cabecalhoApp = document.getElementById('cabecalho-app');
    const dataAtualEl = document.getElementById('data-atual');
    const horaAtualEl = document.getElementById('hora-atual');
    const botaoModoTema = document.getElementById('botao-modo-tema');
    const botaoDropdownUsuario = document.getElementById('botao-dropdown-usuario'); // Atualizado
    const menuUsuario = document.querySelector('.dropdown-menu-usuario'); // Elemento do menu

    // App Launcher
    const botaoToggleLauncher = document.getElementById('botao-toggle-launcher');
    const appLauncherMenu = document.getElementById('app-launcher-menu');
    const launcherBotaoFechar = document.getElementById('launcher-botao-fechar');
    const appItensMenu = appLauncherMenu ? appLauncherMenu.querySelectorAll('.app-item') : [];

    // Conteúdo Principal
    const conteudoPrincipalApp = document.getElementById('conteudo-principal-app');
    const todasSecoes = conteudoPrincipalApp ? Array.from(conteudoPrincipalApp.querySelectorAll('.secao-app')) : []; // Convertido para Array para usar .find

    // --- Estado da Aplicação ---
    let modoEscuroAtivo = localStorage.getItem('nexusModoEscuro') === 'true';
    let secaoAtivaAtual = 'dashboard'; // Padrão
    let activeModalId = null; // Rastreia o modal atualmente aberto

    // --- INICIALIZAÇÃO ---
    function inicializarNexusOS() {
        if (loadingOverlay) configurarOverlayCarregamento();
        configurarModoTema();
        
        if (dataAtualEl && horaAtualEl) {
            atualizarDataHora();
            setInterval(atualizarDataHora, 1000 * 30); // Atualiza a cada 30 segundos
        } else {
            console.warn("Elementos de data/hora não encontrados.");
        }

        if (conteudoPrincipalApp && todasSecoes.length > 0) {
            configurarNavegacaoSecoes();
            const hashInicial = window.location.hash.substring(1);
            const secaoDoHash = todasSecoes.find(s => s.id === hashInicial);

            if (secaoDoHash) {
                secaoAtivaAtual = hashInicial;
            } else if (hashInicial) { // Hash existe mas não é uma seção válida
                history.replaceState(null, '', window.location.pathname + window.location.search);
                // secaoAtivaAtual permanece 'dashboard'
            }
            mostrarSecao(secaoAtivaAtual, false); // false para não criar novo estado no histórico na carga inicial
            if (appItensMenu.length > 0) ativarItemMenu(secaoAtivaAtual);
        } else {
            console.warn("Conteúdo principal ou seções não encontradas. Navegação limitada.");
        }

        if (botaoDropdownUsuario && menuUsuario) configurarDropdownUsuario(); else console.warn("Dropdown do usuário não encontrado.");
        if (botaoToggleLauncher && appLauncherMenu) configurarAppLauncher(); else console.warn("App Launcher não encontrado.");
        
        configurarAnimacaoContadores();
        configurarTabsGlobais();
        configurarModaisGlobais();
        configurarInteracoesFormulariosEspecificas();
        configurarVanillaTilt();

    }

    // 1. Overlay de Carregamento
    function configurarOverlayCarregamento() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                loadingOverlay.setAttribute('hidden', ''); // Usa hidden para semântica e CSS
                if (appWrapper) appWrapper.classList.add('carregado');
            }, 250); // Reduzido um pouco mais
        });
    }

    // 2. Modo Claro/Escuro
    function configurarModoTema() {
        const aplicarTema = () => {
            body.classList.toggle('modo-escuro', modoEscuroAtivo);
            if (botaoModoTema) {
                const icone = modoEscuroAtivo ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
                const label = modoEscuroAtivo ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro';
                botaoModoTema.innerHTML = icone;
                botaoModoTema.setAttribute('aria-label', label);
                botaoModoTema.setAttribute('aria-pressed', modoEscuroAtivo.toString());
            }
        };
        aplicarTema(); // Aplica na carga

        if (botaoModoTema) {
            botaoModoTema.addEventListener('click', () => {
                modoEscuroAtivo = !modoEscuroAtivo;
                localStorage.setItem('nexusModoEscuro', modoEscuroAtivo.toString());
                aplicarTema();
                document.dispatchEvent(new CustomEvent('temaAlterado', { detail: { modoEscuro: modoEscuroAtivo } }));
                // mostrarToast(`Tema alterado para modo ${modoEscuroAtivo ? 'escuro' : 'claro'}.`, 'info', 2000); // Feedback opcional
            });
        }
    }

    // 3. Atualizar Data e Hora
    function atualizarDataHora() {
        const agora = new Date();
        const opcoesData = { day: '2-digit', month: '2-digit', year: 'numeric' };
        const opcoesHora = { hour: '2-digit', minute: '2-digit' };
        if (dataAtualEl) dataAtualEl.textContent = agora.toLocaleDateString('pt-BR', opcoesData);
        if (horaAtualEl) horaAtualEl.textContent = agora.toLocaleTimeString('pt-BR', opcoesHora);
    }
    
    // Ano atual no footer do Launcher
    function configurarAnoAtualFooter() {
        const anoAtualFooterEl = document.getElementById('ano-atual-footer');
        if (anoAtualFooterEl) {
            anoAtualFooterEl.textContent = new Date().getFullYear();
        }
    }

    // 4. Navegação entre Seções
    function mostrarSecao(idSecao, adicionarAoHistorico = true) {
        const secaoAlvo = document.getElementById(idSecao);

        if (!secaoAlvo) {
            console.warn(`Seção inválida: "${idSecao}". Redirecionando para o dashboard.`);
            if (idSecao !== 'dashboard' && document.getElementById('dashboard')) {
                mostrarSecao('dashboard', adicionarAoHistorico);
            } else if (idSecao !== 'dashboard') {
                console.error("Seção 'dashboard' também não encontrada. Verifique o HTML.");
                if (todasSecoes.length > 0) { // Mostra a primeira seção disponível como fallback final
                    mostrarSecao(todasSecoes[0].id, adicionarAoHistorico);
                }
            }
            return;
        }

        todasSecoes.forEach(secao => {
            const isTarget = secao.id === idSecao;
            secao.classList.toggle('ativa', isTarget);
            secao.hidden = !isTarget; // Usar atributo hidden para controle semântico
        });

        secaoAtivaAtual = idSecao;
        if (conteudoPrincipalApp) conteudoPrincipalApp.scrollTop = 0; // Scroll para o topo

        const nomeSecaoFormatado = idSecao.charAt(0).toUpperCase() + idSecao.slice(1).replace(/-/g, ' ');
        const novoTitulo = `Nexus OS - ${nomeSecaoFormatado}`;

        if (adicionarAoHistorico && window.history && window.history.pushState) {
            if (document.title !== novoTitulo || window.location.hash !== `#${idSecao}`) {
                try {
                    document.title = novoTitulo;
                    history.pushState({ secao: idSecao }, novoTitulo, `#${idSecao}`);
                } catch (e) {
                    console.warn("Não foi possível usar history.pushState:", e);
                    window.location.hash = idSecao; // Fallback
                }
            }
        } else if (adicionarAoHistorico) {
            window.location.hash = idSecao;
            document.title = novoTitulo; // Atualiza título mesmo com fallback de hash
        } else { // Apenas atualiza o título se não estiver adicionando ao histórico (ex: popstate)
            document.title = novoTitulo;
        }
    }

    function configurarNavegacaoSecoes() {
        document.querySelectorAll('[data-secao]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const idSecao = link.dataset.secao;
                if (idSecao && idSecao !== secaoAtivaAtual) { // Só navega se for diferente da atual
                    mostrarSecao(idSecao);
                    if (appItensMenu.length > 0) ativarItemMenu(idSecao);
                    if (appLauncherMenu?.classList.contains('aberto')) toggleLauncherState(true);
                    if (botaoDropdownUsuario?.getAttribute('aria-expanded') === 'true') {
                        botaoDropdownUsuario.setAttribute('aria-expanded', 'false');
                    }
                } else if (idSecao && idSecao === secaoAtivaAtual) { // Se clicou na seção ativa, fecha menus
                    if (appLauncherMenu?.classList.contains('aberto')) toggleLauncherState(true);
                    if (botaoDropdownUsuario?.getAttribute('aria-expanded') === 'true') {
                        botaoDropdownUsuario.setAttribute('aria-expanded', 'false');
                    }
                }
            });
        });

        window.addEventListener('popstate', (event) => {
            let idSecaoDestino = 'dashboard'; // Padrão
            if (event.state && event.state.secao && document.getElementById(event.state.secao)) {
                idSecaoDestino = event.state.secao;
            } else {
                const hash = window.location.hash.substring(1);
                if (hash && document.getElementById(hash)) {
                    idSecaoDestino = hash;
                }
            }
            mostrarSecao(idSecaoDestino, false); // false para não criar novo estado no histórico
            if (appItensMenu.length > 0) ativarItemMenu(idSecaoDestino);
        });
    }

    // 5. Dropdown do Usuário (Refatorado)
    function configurarDropdownUsuario() {
        botaoDropdownUsuario.addEventListener('click', (e) => {
            e.stopPropagation();
            const isExpanded = botaoDropdownUsuario.getAttribute('aria-expanded') === 'true';
            botaoDropdownUsuario.setAttribute('aria-expanded', !isExpanded);
            // CSS controla a visibilidade do menu baseado em [aria-expanded]
        });

        document.addEventListener('click', (e) => {
            if (botaoDropdownUsuario.getAttribute('aria-expanded') === 'true' &&
                !botaoDropdownUsuario.contains(e.target) &&
                (menuUsuario && !menuUsuario.contains(e.target))) { // Verifica se menuUsuario existe
                botaoDropdownUsuario.setAttribute('aria-expanded', 'false');
            }
        });
        // Fechar com ESC também
        document.addEventListener('keydown', (e) => {
            if (e.key === "Escape" && botaoDropdownUsuario.getAttribute('aria-expanded') === 'true') {
                botaoDropdownUsuario.setAttribute('aria-expanded', 'false');
                botaoDropdownUsuario.focus(); // Devolve o foco ao botão
            }
        });
    }

    // 6. App Launcher (Refatorado)
    const toggleLauncherState = (forceClose = false) => {
        if (!appLauncherMenu || !botaoToggleLauncher) return;
        const isOpen = appLauncherMenu.classList.contains('aberto');

        if (forceClose || isOpen) {
            appLauncherMenu.classList.remove('aberto');
            botaoToggleLauncher.classList.remove('aberto');
            botaoToggleLauncher.setAttribute('aria-expanded', 'false');
            body.classList.remove('launcher-overlay-ativo');
        } else {
            appLauncherMenu.classList.add('aberto');
            botaoToggleLauncher.classList.add('aberto');
            botaoToggleLauncher.setAttribute('aria-expanded', 'true');
            body.classList.add('launcher-overlay-ativo');
            // Foco no botão de fechar ou primeiro item do launcher para acessibilidade
            const firstFocusableInLauncher = launcherBotaoFechar || appLauncherMenu.querySelector('.app-item');
            if (firstFocusableInLauncher) firstFocusableInLauncher.focus();
        }
    };

    function configurarAppLauncher() {
        botaoToggleLauncher.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleLauncherState();
        });
        if (launcherBotaoFechar) {
            launcherBotaoFechar.addEventListener('click', () => toggleLauncherState(true));
        }

        // Fechar ao clicar no overlay (body com classe .launcher-overlay-ativo)
        document.addEventListener('click', (event) => {
            if (appLauncherMenu.classList.contains('aberto') &&
                body.classList.contains('launcher-overlay-ativo') &&
                !appLauncherMenu.contains(event.target) &&
                event.target !== botaoToggleLauncher &&
                !botaoToggleLauncher.contains(event.target)
            ) {
                toggleLauncherState(true);
            }
        });
        // Fechar com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === "Escape" && appLauncherMenu.classList.contains('aberto')) {
                toggleLauncherState(true);
                botaoToggleLauncher.focus(); // Devolve foco ao botão do launcher
            }
        });
    }

    function ativarItemMenu(idSecao) {
        if (!appItensMenu || appItensMenu.length === 0) return;
        appItensMenu.forEach(item => {
            item.classList.toggle('ativo', item.dataset.secao === idSecao);
            item.setAttribute('aria-current', item.dataset.secao === idSecao ? 'page' : 'false');
        });
    }

    // 7. Animação de Contadores
    function configurarAnimacaoContadores() {
        const contadores = document.querySelectorAll('.animar-contador');
        if (contadores.length === 0) return;

        const animateValue = (el, start, end, duration) => {
            let startTimestamp = null;
            const step = (timestamp) => {
                if (!startTimestamp) startTimestamp = timestamp;
                const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                el.textContent = Math.floor(progress * (end - start) + start);
                if (progress < 1) {
                    window.requestAnimationFrame(step);
                } else {
                    el.textContent = end; // Garante valor final exato
                }
            };
            window.requestAnimationFrame(step);
        };
        
        if (typeof IntersectionObserver !== 'undefined') {
            const observer = new IntersectionObserver((entries, observerInstance) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const contador = entry.target;
                        const target = +contador.dataset.target || 0;
                        animateValue(contador, 0, target, 1200);
                        observerInstance.unobserve(contador);
                    }
                });
            }, { threshold: 0.1 }); // Inicia quando 10% visível
            contadores.forEach(contador => observer.observe(contador));
        } else { // Fallback
            contadores.forEach(contador => {
                 const target = +contador.dataset.target || 0;
                 contador.textContent = target;
            });
        }
    }

    // 8. Funcionalidade de Tabs Globais (Refatorado)
    function configurarTabsGlobais() {
        document.querySelectorAll('[role="tablist"]').forEach(tablist => {
            const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
            const panels = [];
            tabs.forEach(tab => {
                const panelId = tab.getAttribute('aria-controls');
                if (panelId) {
                    const panel = document.getElementById(panelId);
                    if (panel) panels.push(panel);
                }
            });

            if (tabs.length === 0 || panels.length === 0) return;

            tablist.addEventListener('click', (e) => {
                const clickedTab = e.target.closest('[role="tab"]');
                if (!clickedTab || !tabs.includes(clickedTab)) return;
                e.preventDefault();
                activateTab(clickedTab, tabs, panels);
            });

            tablist.addEventListener('keydown', (e) => {
                const currentIndex = tabs.findIndex(tab => tab.matches('[aria-selected="true"]'));
                let newIndex = currentIndex;

                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    newIndex = (currentIndex + 1) % tabs.length;
                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    newIndex = (currentIndex - 1 + tabs.length) % tabs.length;
                } else if (e.key === 'Home') {
                    newIndex = 0;
                } else if (e.key === 'End') {
                    newIndex = tabs.length - 1;
                } else {
                    return; // Não é uma tecla de navegação de aba
                }
                e.preventDefault();
                tabs[newIndex].focus(); // Move o foco, não ativa ainda
                // Para ativar ao focar com setas (comportamento opcional): activateTab(tabs[newIndex], tabs, panels);
            });
            // Opcional: Ativar ao pressionar Enter/Space quando a aba está focada
             tabs.forEach(tab => {
                tab.addEventListener('keydown', e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        activateTab(tab, tabs, panels);
                    }
                });
            });

        });
    }
    function activateTab(selectedTab, allTabs, allPanels) {
        allTabs.forEach(tab => {
            const isSelected = tab === selectedTab;
            tab.classList.toggle('ativo', isSelected);
            tab.setAttribute('aria-selected', isSelected.toString());
            tab.setAttribute('tabindex', isSelected ? '0' : '-1'); // Apenas aba ativa é focável diretamente
        });
        allPanels.forEach(panel => {
            const isSelectedPanel = panel.id === selectedTab.getAttribute('aria-controls');
            panel.hidden = !isSelectedPanel;
            panel.classList.toggle('ativo', isSelectedPanel);
            if (isSelectedPanel) {
                 // Foco no painel pode ser útil, mas pode ser desorientador.
                 // panel.focus();
            }
        });
    }


    // 9. Modais Globais (Refatorado)
    function configurarModaisGlobais() {
        document.addEventListener('click', (e) => {
            const abrirBtn = e.target.closest('[data-modal-abrir]');
            const fecharBtn = e.target.closest('[data-modal-fechar], .modal-botao-fechar');
            const overlay = e.target.classList.contains('modal-overlay') ? e.target : null;

            if (abrirBtn) {
                e.preventDefault();
                abrirModalNexus(abrirBtn.dataset.modalAbrir);
            } else if (fecharBtn) {
                e.preventDefault();
                const modalId = fecharBtn.dataset.modalId || fecharBtn.closest('.modal-overlay')?.id;
                if(modalId) fecharModalNexus(modalId);
            } else if (overlay) {
                fecharModalNexus(overlay.id);
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === "Escape" && activeModalId) {
                fecharModalNexus(activeModalId);
            }
        });
    }

    window.abrirModalNexus = (modalId) => {
        if (activeModalId) fecharModalNexus(activeModalId, false); // Fecha modal anterior se houver, sem animar saída
        
        const modal = document.getElementById(modalId);
        
        if (!modal || !modal.hasAttribute('hidden')) return; // Modal não existe ou já está aberto

        modal.removeAttribute('hidden');
        activeModalId = modalId; // Define o modal ativo

        // Compensação da scrollbar
        const scrollbarWidth = getScrollbarWidth();
        body.style.overflowY = 'hidden';
        if (scrollbarWidth > 0) { // Aplica padding apenas se houver scrollbar
            body.style.paddingRight = scrollbarWidth + 'px';
            if (cabecalhoApp && getComputedStyle(cabecalhoApp).position === 'sticky') { // Ajusta header sticky
                 cabecalhoApp.style.paddingRight = scrollbarWidth + 'px';
            }
        }
        
        const modalContainer = modal.querySelector('.modal-container');
        // Força reflow para garantir que a transição de entrada ocorra
        if(modalContainer) void modalContainer.offsetWidth; 
        modal.classList.add('modal-visivel-anim'); // Classe para animação de entrada do overlay e container

        modal.setAttribute('aria-hidden', 'false');
        const firstFocusable = modal.querySelector('button, [href], input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) setTimeout(() => firstFocusable.focus(), 0); // Timeout para garantir que o elemento esteja focável
    };

    window.fecharModalNexus = (modalId, animateExit = false) => {
        const modal = document.getElementById(modalId);
        
        if (!modal) return;

        const onModalClose = () => {
            modal.setAttribute('hidden', '');
            activeModalId = null;
            // Restaura scroll e padding do body apenas se não houver outros modais abertos
            // (Esta lógica simplificada assume apenas um modal por vez)
            body.style.overflowY = '';
            body.style.paddingRight = '';
            if (cabecalhoApp) cabecalhoApp.style.paddingRight = '';
        };

        modal.classList.remove('modal-visivel-anim'); // Inicia animação de saída
        
        if (animateExit) {
            // Espera a transição de opacidade do overlay terminar
            modal.addEventListener('transitionend', function handler(event) {
                if (event.propertyName === 'opacity' && event.target === modal) {
                    onModalClose();
                    modal.removeEventListener('transitionend', handler);
                }
            });
        } else {
            onModalClose();
        }
    };
    
    function getScrollbarWidth() {
        // Cria um div invisível
        const outer = document.createElement('div');
        outer.style.visibility = 'hidden';
        outer.style.overflow = 'scroll'; // Força scrollbar
        document.body.appendChild(outer);
        // Cria um div interno
        const inner = document.createElement('div');
        outer.appendChild(inner);
        // Calcula a diferença
        const scrollbarWidth = (outer.offsetWidth - inner.offsetWidth);
        // Remove os divs
        outer.parentNode.removeChild(outer);
        return scrollbarWidth;
    }


    // 10. Toast Notifications (Refatorado)
    window.mostrarToast = function(mensagem, tipo = 'info', duracao = 5000) {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            console.warn('Toast container #toast-container não encontrado. Usando alert().');
            alert(`${tipo.toUpperCase()}: ${mensagem}`);
            return;
        }

        const toastId = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        const toast = document.createElement('div');
        toast.id = toastId;
        toast.className = `toast-notificacao ${tipo}`; // CSS já trata tipo com .sucesso, .erro etc.
        toast.setAttribute('role', tipo === 'erro' || tipo === 'aviso' ? 'alert' : 'status');
        toast.setAttribute('aria-live', tipo === 'erro' ? 'assertive' : 'polite');
        
        let iconeClasse = 'fas fa-info-circle';
        if (tipo === 'sucesso') iconeClasse = 'fas fa-check-circle';
        else if (tipo === 'aviso') iconeClasse = 'fas fa-exclamation-triangle';
        else if (tipo === 'erro') iconeClasse = 'fas fa-times-circle';

        toast.innerHTML = `
            <i class="${iconeClasse} toast-icone" aria-hidden="true"></i>
            <div class="toast-conteudo">
                <p class="toast-mensagem">${mensagem}</p>
            </div>
            <button class="toast-botao-fechar" aria-label="Fechar notificação" data-toast-id="${toastId}">×</button>`;
        
        toastContainer.appendChild(toast);

        // Força reflow e animação de entrada
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });
        
        const removerToast = () => {
            toast.classList.remove('show'); // Inicia transição de saída
            toast.classList.add('hide');    // Aciona CSS para .hide
            toast.addEventListener('transitionend', (event) => {
                 // Esperar a transição de opacidade/transform terminar
                if ((event.propertyName === 'opacity' || event.propertyName === 'transform') && toast.classList.contains('hide')) {
                    if (toast.parentElement) toast.remove();
                }
            }, { once: true });
        };

        const timerId = setTimeout(removerToast, duracao);

        toast.querySelector('.toast-botao-fechar').addEventListener('click', (e) => {
            e.stopPropagation();
            clearTimeout(timerId);
            removerToast();
        });
    };


    // 11. Interações de Formulário Específicas
    function configurarInteracoesFormulariosEspecificas() {
        // Lógica para 'frequentou-outra-creche-matricula'
        const selectFrequentouCreche = document.getElementById('frequentou-outra-creche-matricula');
        const campoCrecheAnterior = document.getElementById('campo-historico-creche-anterior');
        const inputCrecheAnterior = document.getElementById('nome-creche-anterior');
        if (selectFrequentouCreche && campoCrecheAnterior && inputCrecheAnterior) {
            const toggleCrecheAnterior = () => {
                const mostrar = selectFrequentouCreche.value === 'sim';
                campoCrecheAnterior.hidden = !mostrar;
                inputCrecheAnterior.required = mostrar; // Torna obrigatório se visível
                inputCrecheAnterior.disabled = !mostrar;
                if (!mostrar) inputCrecheAnterior.value = ''; // Limpa se oculto
            };
            selectFrequentouCreche.addEventListener('change', toggleCrecheAnterior);
            toggleCrecheAnterior();
        }

        // Lógica para 'tipo-destinatario-comunicado'
        const selectTipoDestinatario = document.getElementById('tipo-destinatario-comunicado');
        const containerDestEspecifico = document.getElementById('container-destinatario-especifico');
        const selectTurmaComunicado = document.getElementById('select-turma-especifica-comunicado'); // Corrigido ID
        const selectAlunoComunicado = document.getElementById('select-aluno-especifico-comunicado'); // Corrigido ID

        if (selectTipoDestinatario && containerDestEspecifico && selectTurmaComunicado && selectAlunoComunicado) {
            const atualizarVisibilidadeDestinatario = () => {
                const valor = selectTipoDestinatario.value;
                const mostrarContainer = valor === 'turma' || valor === 'aluno';
                
                containerDestEspecifico.hidden = !mostrarContainer;
                // CSS pode usar [hidden] ou classes para animar a visibilidade
                
                selectTurmaComunicado.hidden = (valor !== 'turma' && valor !== 'aluno');
                selectTurmaComunicado.required = (valor === 'turma' || valor === 'aluno');
                selectTurmaComunicado.disabled = (valor !== 'turma' && valor !== 'aluno');

                selectAlunoComunicado.hidden = (valor !== 'aluno');
                selectAlunoComunicado.required = (valor === 'aluno');
                selectAlunoComunicado.disabled = (valor !== 'aluno');

                if (valor !== 'turma' && valor !== 'aluno') selectTurmaComunicado.value = '';
                if (valor !== 'aluno') selectAlunoComunicado.value = '';
                // TODO: Popular selects de turma/aluno aqui via JS se eles forem dinâmicos
            };
            selectTipoDestinatario.addEventListener('change', atualizarVisibilidadeDestinatario);
            atualizarVisibilidadeDestinatario();
        }

        // Função para preview de imagem e clique em botão para input file
        function setupImagePreviewAndClick(inputId, previewId, buttonId) {
            const input = document.getElementById(inputId);
            const preview = document.getElementById(previewId);
            const button = document.getElementById(buttonId);

            if (input && preview) {
                input.addEventListener('change', function(event) {
                    const file = event.target.files[0];
                    if (file && file.type.startsWith('image/')) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            preview.src = e.target.result;
                            preview.hidden = false; // Usa hidden
                            preview.setAttribute('aria-hidden', 'false');
                        }
                        reader.readAsDataURL(file);
                    } else {
                        preview.src = '#';
                        preview.hidden = true;
                        preview.setAttribute('aria-hidden', 'true');
                        if (file) mostrarToast('Por favor, selecione um arquivo de imagem válido.', 'aviso');
                        input.value = '';
                    }
                });
            }
            if (button && input) { // Associa o botão ao clique do input
                button.addEventListener('click', () => input.click());
                // Se o botão for um label, o 'for' no HTML já faz isso.
                // Se for um button, adicionar role="button" e tabindex="0" se não for nativamente focável.
            }
        }
        setupImagePreviewAndClick('config-logo-creche-input', 'preview-logo-creche', 'config-logo-creche-input'); // Assumindo que o label com ID é o trigger
        setupImagePreviewAndClick('upload-avatar-perfil-input', 'avatar-perfil-grande', 'btn-trocar-avatar-perfil');
    }

    // 12. Configurar VanillaTilt
    function configurarVanillaTilt() {
        if (typeof VanillaTilt !== 'undefined') {
            const tiltElements = document.querySelectorAll("[data-tilt]");
            if (tiltElements.length > 0) {
                VanillaTilt.init(tiltElements, {
                    max: 5, // Reduzido para ser mais sutil
                    perspective: 1000, 
                    scale: 1.01, // Reduzido
                    speed: 400, 
                    glare: true, 
                    "max-glare": 0.15 // Reduzido
                });
            }
        } else {
            console.warn("VanillaTilt não carregado.");
        }
    }

    // --- INICIAR A MÁQUINA ---
    try {
        inicializarNexusOS();
    } catch (error) {
        console.error("Erro fatal durante a inicialização do Nexus OS:", error);
        if (loadingOverlay) { // Garante que o loading overlay seja removido em caso de erro fatal
            loadingOverlay.setAttribute('hidden', '');
        }
        // Poderia mostrar uma mensagem de erro amigável para o usuário aqui
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = "position:fixed;top:0;left:0;width:100%;padding:20px;background:red;color:white;text-align:center;z-index:10001;";
        errorDiv.textContent = "Ocorreu um erro ao carregar o sistema. Por favor, tente recarregar a página ou contate o suporte.";
        document.body.prepend(errorDiv);
    }

}); // Fim do DOMContentLoaded
