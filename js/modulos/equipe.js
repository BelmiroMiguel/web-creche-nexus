import { AppService } from "../app_service.js";
import { capitalizeWords, formatarData, formatarDataInput, fotoPreview, renderPaginacao, toUpperCase } from "../utils.js";

// js/modulos/equipe.js
(function () {
    'use strict';
    const secaoEquipe = document.getElementById('equipe');
    if (!secaoEquipe) return;
    const tabelaFuncionariosCorpo = document.querySelector('#tabela-funcionarios-corpo');

    function baseUrl(url = '') {
        if (url && !url.startsWith('/')) {
            url = '/' + url;
        }
        return `usuarios${url}`
    }

    fotoPreview({
        inputFileImagem: inpFotoFuncionario,
        docImg: fotoPreviewFuncionario
    });


    $(btnAbilitarNovoFuncionario).on('click', () => abilitarNovoFuncionaario(true))
    $(btnCancelarNovoFuncionario).on('click', () => abilitarNovoFuncionaario(false))
    $(inpFiltroFuncionario).on('input', () => carregarFuncionarios(0))
    $(sltFitroEstadoFuncionario).on('input', () => carregarFuncionarios(0))
    $(formNovoFuncionario).on('submit', salvarFuncionario);

    let funcionarioSelecionado = null;

    let paginacaoFunciomario = {
        page: 0,
        totalPages: 0,
        totalItems: 0,
        items: 15,
    }

    let isEditarFuncionario = false;
    let funcionariosCarregados = [];


    function contarFuncionarios() {
        AppService.getData(baseUrl('count'), {}, {
            onSuccess: (res) => {
                const { total, ativos, inativos } = res.body;
                labelTotalFuncionarios.textContent = total
                labelTotalFuncionariosAtivos.textContent = ativos
                labelTotalFuncionariosInativos.textContent = inativos
            }
        })
    }

    function carregarFuncionarios(page = 0) {
        $(preload).fadeIn()
        //$(contetFuncionario).fadeOut()

        AppService.getData('usuarios', {
            page,
            items: paginacaoFunciomario.items,
            value: inpFiltroFuncionario.value,
            eliminado: sltFitroEstadoFuncionario.value
        }, {
            onSuccess: (res) => {
                paginacaoFunciomario = res.paginacao
                renderPaginacao({
                    container: containerPaginacaoFuncionario,
                    totalPaginas: paginacaoFunciomario.totalPages,
                    paginaAtual: paginacaoFunciomario.page,
                    totalItens: paginacaoFunciomario.totalItems,
                    onPageClick: (pagina) => carregarFuncionarios(pagina)
                })
                funcionariosCarregados = res.body;
                renderizarTabelaFuncionarios(funcionariosCarregados)
            },
            onEroor: (res) => {
                console.log(res);
            },
            onResponse: () => {
                $(contetFuncionario).fadeIn()
                $(preload).fadeOut()
            }
        })
    }

    function salvarFuncionario(event) {
        event.preventDefault();

        const nome = formNovoFuncionario.inpNomeFuncionario.value;
        const dataNascimento = formNovoFuncionario.inpDataNascimentoFuncionario.value;
        const genero = formNovoFuncionario.sltGeneroFuncionario.value;
        const telefone = formNovoFuncionario.inpTelefoneFuncionario.value;
        const email = formNovoFuncionario.inpEmailFuncionario.value;
        const funcao = formNovoFuncionario.sltFuncaoFuncionario.value;
        const nivel = formNovoFuncionario.sltNivelFuncionario.value;
        const endereco = formNovoFuncionario.inpEnderecoFuncionario.value;

        // Pega a imagem do input
        const fotoFile = formNovoFuncionario.inpFotoFuncionario.files[0];

        // Monta o FormData
        const formDataFuncionario = new FormData();
        formDataFuncionario.append('nome', nome);
        formDataFuncionario.append('dataNascimento', dataNascimento);
        formDataFuncionario.append('genero', genero);
        formDataFuncionario.append('telefone', telefone);
        formDataFuncionario.append('email', email);
        formDataFuncionario.append('funcao', funcao);
        formDataFuncionario.append('nivel', nivel);
        formDataFuncionario.append('endereco', endereco);
        if (fotoFile) formDataFuncionario.append('imagem', fotoFile);
        if (funcionarioSelecionado) formDataFuncionario.append('idUsuario', funcionarioSelecionado.idUsuario);

        const textBtn = btnCadastrarFuncionario.innerHTML;
        btnCadastrarFuncionario.disabled = true;
        btnCadastrarFuncionario.innerHTML = `<span class='pr-3' >Validando...</span> <i class="fas fa-spinner fa-spin"></i>`;

        const rota = isEditarFuncionario ? 'usuarios/editar' : 'usuarios'

        AppService.postData(rota, formDataFuncionario,
            {
                onSuccess: (res) => {
                    carregarFuncionarios()

                    Swal.fire({
                        title: res.message,
                        icon: "success",
                        timer: 3000
                    });

                    abilitarNovoFuncionaario(false)
                    resetarFormularioFuncionario()
                },
                onError: (res) => {
                    Swal.fire({
                        title: res.message,
                        icon: "error"
                    });
                },
                onResponse: () => { btnCadastrarFuncionario.innerHTML = textBtn; btnCadastrarFuncionario.disabled = false; }
            }
        )

        return false;
    }

    async function modificarEstadoFuncionario(funcionario, callbackInit) {
        const novoEstado = funcionario.eliminado ? 0 : 1;

        return Swal.fire({
            title: `Deseja ${novoEstado ? 'desativar' : 'ativar'} este funcionário?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: novoEstado ? 'Desativar' : 'Ativar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            
            if (result.isConfirmed) {
                if (callbackInit) callbackInit()
                const formData = new FormData();
                formData.append('idUsuario', funcionario.idUsuario);
                formData.append('eliminado', novoEstado);

                try {
                    AppService.postData('usuarios/editar', formData, {
                        onSuccess: async (res) => {
                            Swal.fire({
                                title: res.message || 'Status alterado com sucesso!',
                                icon: 'success',
                                timer: 2000
                            });
                        },
                        onError: async (res) => {
                            Swal.fire({
                                title: res && res.message ? res.message : 'Erro ao alterar status!',
                                icon: 'error'
                            });
                        },
                        onResponse: () => {
                            carregarFuncionarios()
                            contarFuncionarios()
                        }
                    });
                } catch (e) {
                    Swal.fire({
                        title: 'Erro ao alterar status!',
                        icon: 'error'
                    });
                }
            }
        });
    }


    async function resetarFormularioFuncionario() {
        if (typeof formNovoFuncionario !== 'undefined' && formNovoFuncionario) {
            formNovoFuncionario.reset();
            if (typeof fotoPreviewFuncionario !== 'undefined' && fotoPreviewFuncionario) {
                fotoPreviewFuncionario.src = './assets/img/blank-profile-picture-png.webp';
            }
        }

        inpFotoFuncionario.value = ''
        labelTituloCadastroFuncionario.innerHTML = 'Registrar Novo Funcionário'
        labelBtnCadastrarFuncionario.innerHTML = 'Cadastrar Funcionário'
        labelIdadeFuncionario.innerHTML = ''
        isEditarFuncionario = false;
        funcionarioSelecionado = null;
    }


    async function abilitarNovoFuncionaario(status = false) {
        resetarFormularioFuncionario()
        if (typeof formNovoFuncionario !== 'undefined' && formNovoFuncionario) {
            if (status) {
                $(contetFuncionario).fadeOut(0);
                $(formNovoFuncionario).fadeIn(300);
            } else {
                $(formNovoFuncionario).fadeOut(0);
                $(contetFuncionario).fadeIn(300);
            }
        }
    }

    async function abilitarEditarFuncionario(funcionario) {
        abilitarNovoFuncionaario(true);
        funcionarioSelecionado = funcionario;
        isEditarFuncionario = true;

        labelTituloCadastroFuncionario.innerHTML = 'Editar Dados do Funcionário'
        labelBtnCadastrarFuncionario.innerHTML = 'Salvar Dados da Edição'
        formNovoFuncionario.inpNomeFuncionario.value = funcionario.nome || '';
        formNovoFuncionario.inpDataNascimentoFuncionario.value = formatarDataInput(funcionario.dataNascimento) || '';
        formNovoFuncionario.sltGeneroFuncionario.value = funcionario.genero || '';
        formNovoFuncionario.inpTelefoneFuncionario.value = funcionario.telefone || '';
        formNovoFuncionario.inpEmailFuncionario.value = funcionario.email || '';
        formNovoFuncionario.sltFuncaoFuncionario.value = funcionario.funcao || '';
        formNovoFuncionario.sltNivelFuncionario.value = funcionario.nivel || '';
        formNovoFuncionario.inpEnderecoFuncionario.value = funcionario.endereco || '';

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
        } else labelIdadeFuncionario.innerHTML = ''

        if (typeof fotoPreviewFuncionario !== 'undefined' && fotoPreviewFuncionario) {
            fotoPreviewFuncionario.src = funcionario.imagem || './assets/img/blank-profile-picture-png.webp';
        }

        /*
        buque de flores, anel, vestido, tenes, bolo, 
        */
    }

    async function renderizarTabelaFuncionarios(funcionarios = []) {
        tabelaFuncionariosCorpo.innerHTML = ''; // Limpa tabela


        if (funcionarios.length === 0) {
            tabelaFuncionariosCorpo.innerHTML = `<tr><td colspan="7" class="sem-dados">Nenhum funcionário encontrado.</td></tr>`;
            return;
        }

        funcionarios.forEach((funcionario, index) => {
            const tr = document.createElement('tr');
            tr.classList.add('animar-item-lista', 'p-0', 'm-0')

            // Corrige a contagem de itens considerando o número de itens por página
            const itemIndex = ((paginacaoFunciomario.page - 1) * paginacaoFunciomario.items) + index + 1;

            tr.innerHTML = `
                <td class="px-4 py-3">${itemIndex}</td>
                <td class="px-4 py-3 funcionario-nome">${funcionario.nome}</td>
                <td class="px-4 py-3 funcionario-funcao">${funcionario.funcao}</td>
                <td class="px-4 py-3 funcionario-turno">${funcionario.email}</td>
                <td class="px-4 py-3 funcionario-contato">${funcionario.telefone}</td>
                <td class="px-4 py-3 funcionario-status">
                    <span class="badge  ${funcionario.eliminado ? 'bg-danger' : 'bg-success'}">
                        ${funcionario.eliminado ? 'Inativo' : 'Ativo'}
                    </span>
                </td>
                <td class="px-4 py-3 funcionario-acoes">
                    <button class="botao-pequeno-nexus info btn-ver-perfil-funcionario" title="Ver Perfil Completo"><i class="fas fa-user-circle"></i></button>
                    <button class="botao-pequeno-nexus editar btn-editar-funcionario" title="Editar Cadastro"><i class="fas fa-user-edit"></i></button>
                    <button class="botao-pequeno-nexus ${!funcionario.eliminado ? 'perigo' : 'sucesso'} btn-alterar-status-funcionario" title="${!funcionario.eliminado ? 'Desativar' : 'Ativar'}">
                        <i class="fas ${!funcionario.eliminado ? 'fa-user-slash' : 'fa-user-check'}"></i>
                    </button>  
                </td>
            `


            tr.querySelector('.btn-editar-funcionario').addEventListener('click', () => abilitarEditarFuncionario(funcionario))
            tr.querySelector('.btn-alterar-status-funcionario').addEventListener('click', () => modificarEstadoFuncionario(funcionario, () => {
                tr.querySelector('.btn-alterar-status-funcionario').innerHTML = '<i class="fas fa-spinner fa-spin"></i>'
            }))

            tr.querySelector('.btn-ver-perfil-funcionario').addEventListener('click', () => {
                tr.style.background = '#e9ecef'

                // Remove qualquer linha de detalhes aberta anteriormente
                const existingDetailRow = tabelaFuncionariosCorpo.querySelector('.funcionario-detalhes-row');
                if (existingDetailRow) existingDetailRow.remove();

                // Cria a linha de detalhes
                const detailTr = document.createElement('tr');
                detailTr.classList.add('funcionario-detalhes-row');
                detailTr.style.background = '#e9ecef'
                const detailTd = document.createElement('td');
                detailTd.colSpan = 7;


                detailTd.innerHTML = `
                    <div class="detalhes-funcionario px-0 py-0" title='Toque para fechar'>
                        <div style="display: flex; align-items: center; gap: 16px;">
                            <img src="${funcionario.imagem}" alt="${capitalizeWords(funcionario.nome)}" class="avatar-tabela-nexus shadow" style="width:150px;height:150px;border-radius:0%;">
                            <div>
                                <strong>${capitalizeWords(funcionario.nome)}</strong><br>
                                <span style="margin-left:16px;">Função: <span class="text-primary" style="color:#1976d2; margin-left:8px;">${toUpperCase(funcionario.funcao)}</span></span><br>
                                <span style="margin-left:16px;">Nível de Acesso no Sistema: <span class="text-primary" style="color:#1976d2; margin-left:8px;">${toUpperCase(funcionario.nivel) || '-'}</span></span><br>
                                <span style="margin-left:16px;">Contato: <span class="text-primary" style="color:#1976d2; margin-left:8px;">${funcionario.telefone || '-'}</span></span><br>
                                <span style="margin-left:16px;">Email: <span class="text-primary" style="color:#1976d2; margin-left:8px;">${funcionario.email || '-'}</span></span><br>
                                <span style="margin-left:16px;">Status: <span class="text-primary" style="color:#1976d2; margin-left:8px;">${funcionario.status ? toUpperCase(funcionario.status) : (!funcionario.eliminado ? 'Ativo' : 'Inativo')}</span></span><br>
                                <span style="margin-left:16px;">Endereço: <span class="text-primary" style="color:#1976d2; margin-left:8px;">${capitalizeWords(funcionario.endereco) || '-'}</span></span><br>
                                <span style="margin-left:16px;">Data de Cadastro: <span class="text-primary" style="color:#1976d2; margin-left:8px;">${formatarData(funcionario.dataCadastro) || '-'}</span></span><br>
                            </div>
                        </div>
                    </div>
                `;
                detailTr.appendChild(detailTd);

                // Insere a linha de detalhes logo após a linha do funcionário
                tr.parentNode.insertBefore(detailTr, tr.nextSibling);

                // rola até o elemento de detalhe
                detailTr.scrollIntoView({ behavior: 'smooth', block: 'center' });
                detailTr.querySelector('.detalhes-funcionario').scrollLeft = 0;

                // Fecha detalhes ao clicar novamente
                detailTr.addEventListener('click', () => {
                    tr.style.background = ''
                    detailTr.remove()
                    tr.scrollIntoView({ behavior: 'smooth', block: 'center' });
                });
            });

            tabelaFuncionariosCorpo.appendChild(tr)
        });
    }

    function inicializarModuloEquipe() {
        if (!secaoEquipe.classList.contains('ativa')) return;

        labelTotalFuncionarios.innerHTML = `<i class="fa fa-spinner" aria-hidden="true"></i>`
        labelTotalFuncionariosAtivos.innerHTML = `<i class="fa fa-spinner" aria-hidden="true"></i>`
        labelTotalFuncionariosInativos.innerHTML = `<i class="fa fa-spinner" aria-hidden="true"></i>`

        contarFuncionarios()
        resetarFormularioFuncionario()
        abilitarNovoFuncionaario(false)
        carregarFuncionarios(0)
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.target.id === 'equipe' && entry.target.classList.contains('ativa')) {
                inicializarModuloEquipe();
            }
        });
    }, { threshold: 0.1 });
    observer.observe(secaoEquipe);
    window.inicializarModuloEquipe = inicializarModuloEquipe;
})();