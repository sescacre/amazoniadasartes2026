/* Utilidades sem relação com o orçamento: formatação, criação de elementos, tooltip e tabelas simples. */

/* ================= Formatação ================= */
const FMT = {
  brl: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format,
  brlCentavos: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0, maximumFractionDigits: 2 }).format,
  num: new Intl.NumberFormat("pt-BR").format,
  pct: new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 1 }).format,
  // R$ 2,39 mi · R$ 735 mil
  brlCurto: v => v >= 1e6
    ? "R$ " + (v / 1e6).toLocaleString("pt-BR", { maximumFractionDigits: 2 }) + " mi"
    : "R$ " + Math.round(v / 1e3).toLocaleString("pt-BR") + " mil",
};

/* ================= Dados ================= */
const soma = (lista, f) => lista.reduce((s, x) => s + f(x), 0);
const maiorPrimeiro = campo => (a, b) => b[campo] - a[campo];
// Separa letra e acento (NFD) e apaga as marcas combinantes (\p{Mn}): "Rondônia" → "rondonia"
const semAcento = t => t.normalize("NFD").replace(/\p{Mn}/gu, "").toLowerCase();

/* ================= DOM ================= */
const $ = id => document.getElementById(id);
// Referência a uma cor do tema. Como é resolvida pelo CSS, acompanha a troca de tema sem redesenhar nada.
const cor = token => `var(${token})`;

// el("div", { class: "x", onclick: fn }, filhos...) — atributos "on*" viram eventos; null/undefined são ignorados.
function el(tag, attrs = {}, ...filhos) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null) continue;
    if (k === "class") node.className = v;
    else if (k === "style") node.style.cssText = v;
    else if (k.startsWith("on")) node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v);
  }
  node.append(...filhos.flat(Infinity).filter(f => f != null));
  return node;
}

function svgEl(tag, attrs = {}) {
  const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

// Monta uma tabela simples: cabeçalho, linhas e rodapé opcional. Células podem ser texto ou elementos.
function preencherTabela(tabela, { cabecalho, linhas, rodape }) {
  const linha = (celulas, tag) => el("tr", {}, celulas.map(c => el(tag, tag === "th" ? { scope: "col" } : {}, c)));
  const partes = [el("thead", {}, linha(cabecalho, "th")), el("tbody", {}, linhas.map(l => linha(l, "td")))];
  if (rodape) partes.push(el("tfoot", {}, linha(rodape, "td")));
  tabela.replaceChildren(...partes);
}

/* ================= Tooltip ================= */
const Tooltip = (() => {
  const caixa = $("tip");

  function mostrar(evt, titulo, linhas) {
    caixa.replaceChildren(el("strong", {}, titulo), linhas.map(([k, v]) => el("div", {}, el("span", { class: "k" }, k + ": "), v)));
    caixa.hidden = false;
    // Foco pelo teclado não tem posição do ponteiro: usa o centro do elemento
    const r = (evt.currentTarget || evt.target).getBoundingClientRect();
    const x = evt.clientX || r.left + r.width / 2, y = evt.clientY || r.top + r.height / 2;
    const w = caixa.offsetWidth, h = caixa.offsetHeight;
    const left = Math.min(innerWidth - w - 8, Math.max(8, x + 12));
    const top = y + 16 + h > innerHeight - 8 ? y - h - 12 : y + 16;
    caixa.style.left = left + "px";
    caixa.style.top = Math.max(8, top) + "px";
  }
  const esconder = () => { caixa.hidden = true; };

  addEventListener("scroll", esconder, { passive: true });
  document.addEventListener("keydown", e => { if (e.key === "Escape") esconder(); });
  // Toque fora de um elemento com tooltip fecha o tooltip
  document.addEventListener("pointerdown", e => { if (!e.target.closest("[data-tip]")) esconder(); });

  // Liga o tooltip a um elemento por mouse, foco (teclado) e clique (toque).
  // aoEntrar/aoSair permitem destacar o item correspondente em outro lugar (ex.: fatia e legenda).
  function ligar(node, titulo, linhas, { aoEntrar, aoSair } = {}) {
    const abrir = ev => { aoEntrar?.(); mostrar(ev, titulo, linhas); };
    const fechar = () => { aoSair?.(); esconder(); };
    node.dataset.tip = "";
    if (!node.hasAttribute("tabindex")) node.setAttribute("tabindex", "0");
    node.addEventListener("mouseenter", abrir);
    node.addEventListener("mousemove", ev => mostrar(ev, titulo, linhas));
    node.addEventListener("mouseleave", fechar);
    node.addEventListener("focus", abrir);
    node.addEventListener("blur", fechar);
    node.addEventListener("click", abrir);
    return node;
  }

  return { ligar, esconder };
})();
