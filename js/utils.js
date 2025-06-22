import { AppService, armazenamento } from "./app_service.js";
import { Duration, listenerSession } from "./block-secion.js";

window.onload = () => {
  $(preload).fadeOut();

  listenerSession({
    duration: Duration({ second: 60 }),
    onLocked: () => {
      armazenamento.clear();
      window.location.href = "/login.html";
    },
    onCounter: (counter) => {
      if (counter < 30) {
        let alerta = document.getElementById("alerta-inatividade");
        if (!alerta) {
          alerta = document.createElement("div");
          alerta.id = "alerta-inatividade";
          alerta.style.position = "fixed";
          alerta.style.top = "20px";
          alerta.style.right = "30px";
          alerta.style.background = "#fff3cd";
          alerta.style.color = "#856404";
          alerta.style.border = "1px solid #ffeeba";
          alerta.style.padding = "12px 20px";
          alerta.style.borderRadius = "6px";
          alerta.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
          alerta.style.zIndex = 9999;
          alerta.style.fontSize = "15px";
          alerta.textContent = `Você será bloqueado por inatividade em ${counter} segundo${
            counter === 1 ? "" : "s"
          }!`;
          document.body.appendChild(alerta);
        } else {
          alerta.textContent = `Você será bloqueado por inatividade em ${counter} segundo${
            counter === 1 ? "" : "s"
          }!`;
        }
      } else {
        const alerta = document.getElementById("alerta-inatividade");
        if (alerta) alerta.remove();
      }
    },
    onReset: () => {
      const alerta = document.getElementById("alerta-inatividade");
      if (alerta) alerta.remove();
    },
  });
};

// Função para capitalizar a primeira letra de cada palavra
export function capitalizeWords(str) {
  if (!str) return "-";
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

// Função para transformar toda a string em maiúsculas
export function toUpperCase(str) {
  if (!str) return "-";
  return str.toUpperCase();
}

/**
 * Formata uma data no formato dd/mm/aaaa.
 * Aceita Date, string ou timestamp.
 */
export function formatarData(data) {
  if (!data) return null;
  let d = data instanceof Date ? data : new Date(data);
  if (isNaN(d)) return null;
  const dia = String(d.getDate()).padStart(2, "0");
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const ano = d.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

export function formatarDataInput(data) {
  if (!data) return "-";
  let d = data instanceof Date ? data : new Date(data);
  if (isNaN(d)) return "-";
  const dia = String(d.getDate()).padStart(2, "0");
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const ano = d.getFullYear();
  data = `${ano}-${mes}-${dia}`;
  return data;
}

/**
 * Calcula a idade em anos a partir de uma data de nascimento.
 * Aceita Date, string ou timestamp.
 */
export function calcularIdade(dataNascimento) {
  if (!dataNascimento) return "-";
  let nascimento =
    dataNascimento instanceof Date ? dataNascimento : new Date(dataNascimento);
  if (isNaN(nascimento)) return "-";
  const hoje = new Date();

  let anos = hoje.getFullYear() - nascimento.getFullYear();
  let meses = hoje.getMonth() - nascimento.getMonth();
  let dias = hoje.getDate() - nascimento.getDate();

  if (dias < 0) {
    meses--;
    dias += new Date(hoje.getFullYear(), hoje.getMonth(), 0).getDate();
  }
  if (meses < 0) {
    anos--;
    meses += 12;
  }

  if (anos > 0) {
    return anos === 1 ? "1 ano" : `${anos} anos`;
  } else if (meses > 0) {
    return meses === 1 ? "1 mês" : `${meses} meses`;
  } else {
    return "Menos de 1 mês";
  }
}

export function renderPaginacao({
  totalPaginas,
  totalItens = 0,
  paginaAtual,
  onPageClick,
  container,
}) {
  // Limpa o conteúdo anterior
  container.innerHTML = "";

  if (totalItens == 0) return;

  // Garante que os valores sejam válidos
  totalPaginas = Math.max(1, totalPaginas);
  paginaAtual = Math.max(1, Math.min(paginaAtual, totalPaginas));

  const onClickPage = (page, btn) => {
    // Remove animação anterior
    const allButtons = container.querySelectorAll(".btn-paginacao-nav");
    allButtons.forEach((b) => b.classList.remove("btn-pulse"));

    if (btn) {
      btn.classList.add("btn-pulse");
    }

    if (page !== paginaAtual) {
      onPageClick(page);
    }
  };

  const createButton = (text, icon, page, disabled = false, active = false) => {
    if (totalPaginas <= 0) return;

    const btn = document.createElement("button");
    if (text) btn.textContent = text;
    btn.disabled = disabled;
    btn.style.margin = "0 4px";
    btn.style.padding = "6px 10px";
    btn.style.cursor = disabled ? "default" : "pointer";
    btn.style.border = active ? "2px solid blue" : "1px solid #ccc";
    btn.classList.add("btn-paginacao-nav");
    if (icon) btn.innerHTML = `<i class="${icon}"></i>`;

    if (!disabled && !active) {
      btn.onclick = () => onClickPage(page, btn); // passa o btn clicado
    }

    return btn;
  };

  // Botão "Anterior"
  container.appendChild(
    createButton("", "fa fa-angle-double-left", 1, paginaAtual === 1)
  );
  container.appendChild(
    createButton("", "fa fa-chevron-left", paginaAtual - 1, paginaAtual === 1)
  );

  // Cálculo da faixa de páginas a mostrar
  let start = Math.max(1, paginaAtual - 2);
  let end = Math.min(totalPaginas, start + 4);

  if (end - start < 4) {
    start = Math.max(1, end - 4);
  }

  // Botões de página
  for (let i = start; i <= end; i++) {
    container.appendChild(
      createButton(i.toString(), "", i, false, i === paginaAtual)
    );
  }

  // Botão "Próximo"
  container.appendChild(
    createButton(
      "",
      "fa fa-chevron-right",
      paginaAtual + 1,
      paginaAtual === totalPaginas
    )
  );
  container.appendChild(
    createButton(
      "",
      "fa fa-angle-double-right",
      totalPaginas,
      paginaAtual === totalPaginas
    )
  );

  const desc = document.createElement("div");
  desc.textContent = ` ${totalPaginas} página${
    totalPaginas > 1 ? "s" : ""
  } de ${totalItens} ite${totalItens > 1 ? "ns" : "m"}`;
  desc.style.display = "inline-block";
  desc.style.marginLeft = "12px";
  desc.style.fontSize = "14px";
  container.appendChild(desc);
}

export function fotoPreview({ inputFileImagem, docImg }) {
  $(docImg).on("click", () => $(inputFileImagem).trigger("click"));

  $(inputFileImagem).on("change", function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        $(docImg).attr("src", e.target.result);
      };
      reader.readAsDataURL(file);
    }
  });
}
