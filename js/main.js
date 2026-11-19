/* Renderização da página: abertura, gráficos, tabela, pontos de atenção, referências e tema.
   Depende de js/dados.js (GRUPOS, RUBRICAS, REFERENCIAS, PROGRAMACAO, PONTOS). */

/* ================= Utilidades ================= */
const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const BRL2 = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0, maximumFractionDigits: 2 });
const NUM = new Intl.NumberFormat("pt-BR");
const PCT = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 1 });
const brlShort = v => v >= 1e6 ? "R$ " + (v / 1e6).toLocaleString("pt-BR", { maximumFractionDigits: 2 }) + " mi" : "R$ " + Math.round(v / 1e3).toLocaleString("pt-BR") + " mil";
const el = (tag, attrs = {}, ...kids) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") e.className = v; else if (k === "style") e.style.cssText = v; else if (k.startsWith("on")) e.addEventListener(k.slice(2), v); else e.setAttribute(k, v);
  }
  e.append(...kids.flat().filter(k => k != null));
  return e;
};
const css = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const sum = (a, f) => a.reduce((s, x) => s + f(x), 0);

const LINGUAGENS = ["Circo", "Dança", "Teatro", "Artes Visuais", "Audiovisual", "Literatura", "Música"];
const LANG_COLOR = { "Circo": "--urucum", "Dança": "--flor", "Teatro": "--river", "Artes Visuais": "--warn", "Audiovisual": "--muted", "Literatura": "--olive", "Música": "--sun-deep" };

/* ================= Tooltip ================= */
const tip = document.getElementById("tip");
function showTip(evt, title, lines) {
  tip.replaceChildren(el("strong", {}, title), ...lines.map(([k, v]) => el("div", {}, el("span", { class: "k" }, k + ": "), v)));
  tip.hidden = false;
  const r = evt.currentTarget.getBoundingClientRect();
  const x = evt.clientX ?? (r.left + r.width / 2), y = evt.clientY ?? r.top;
  const w = tip.offsetWidth, h = tip.offsetHeight;
  let left = Math.min(window.innerWidth - w - 8, Math.max(8, x + 12));
  let top = y + 16; if (top + h > window.innerHeight - 8) top = y - h - 12;
  tip.style.left = left + "px"; tip.style.top = Math.max(8, top) + "px";
}
const hideTip = () => { tip.hidden = true; };
window.addEventListener("scroll", hideTip, { passive: true });

/* ================= Totais ================= */
const TOTAL = sum(RUBRICAS, r => r.valor);
const FILMES = GRUPOS.filter(g => g.linguagem === "Audiovisual").length;
const NGRUPOS = GRUPOS.length - FILMES;
const ARTISTAS = sum(GRUPOS, g => g.integrantes);
const topRub = [...RUBRICAS].sort((a, b) => b.valor - a.valor)[0];

/* ================= Abertura ================= */
function renderHero() {
  const lead = document.getElementById("lead");
  lead.replaceChildren(
    "O orçamento soma ", el("b", {}, BRL.format(TOTAL)), " para levar ", el("b", {}, NGRUPOS + " grupos"), " e ", el("b", {}, FILMES + " filmes"),
    " a 10 regionais do Sesc. O maior gasto é o ", el("b", {}, topRub.nome.toLowerCase()), ", com ", el("b", {}, PCT.format(topRub.valor / TOTAL)), " do total."
  );
  const items = [
    ["Orçamento total", BRL.format(TOTAL), "Todas as rubricas"],
    ["Média por regional", BRL.format(TOTAL / 10), "Total dividido por 10"],
    ["Grupos e filmes", NGRUPOS + " + " + FILMES, "Grupos que circulam + filmes"],
    ["Artistas", NUM.format(ARTISTAS), "Integrantes de todos os grupos"],
  ];
  document.getElementById("kpis").replaceChildren(...items.map(([l, v, s]) => el("div", { class: "kpi" }, el("p", {}, l), el("strong", {}, v), el("p", {}, s))));
}

/* ================= Rosca das rubricas ================= */
function renderDonut() {
  const box = document.getElementById("donut"), legend = document.getElementById("legend");
  const colors = ["--river", "--urucum", "--olive", "--sun-deep", "--flor", "--bad", "--muted", "--ink"].map(css);
  const data = [...RUBRICAS].sort((a, b) => b.valor - a.valor);
  const R = 100, r = 64, cx = 100, cy = 100;
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 200 200"); svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "Gráfico de rosca das rubricas: " + data.map(d => d.nome + " " + PCT.format(d.valor / TOTAL)).join(", "));
  const center = el("div", { class: "donut-center" });
  const setCenter = d => center.replaceChildren(el("strong", {}, d ? BRL.format(d.valor) : brlShort(TOTAL)), el("span", {}, d ? d.nome + " · " + PCT.format(d.valor / TOTAL) : "orçamento total"));
  setCenter();
  let a0 = -Math.PI / 2;
  const paths = [], rows = [];
  const highlight = i => {
    paths.forEach((p, j) => p.style.opacity = i == null || i === j ? 1 : .3);
    rows.forEach((li, j) => li.classList.toggle("on", i === j));
    setCenter(i == null ? null : data[i]);
  };
  data.forEach((d, i) => {
    const a1 = a0 + (d.valor / TOTAL) * Math.PI * 2, gap = 0.012;
    const s = a0 + gap, e = a1 - gap, large = e - s > Math.PI ? 1 : 0;
    const P = (ang, rad) => [cx + rad * Math.cos(ang), cy + rad * Math.sin(ang)];
    const [x1, y1] = P(s, R), [x2, y2] = P(e, R), [x3, y3] = P(e, r), [x4, y4] = P(s, r);
    const p = document.createElementNS(ns, "path");
    p.setAttribute("d", `M${x1},${y1} A${R},${R} 0 ${large} 1 ${x2},${y2} L${x3},${y3} A${r},${r} 0 ${large} 0 ${x4},${y4}Z`);
    p.setAttribute("fill", colors[i]); p.setAttribute("tabindex", "0");
    const lines = [["Valor", BRL.format(d.valor)], ["Parte do total", PCT.format(d.valor / TOTAL)], ["O que é", d.detalhe], ["Cálculo", d.base]];
    p.addEventListener("mouseenter", ev => { highlight(i); showTip(ev, d.nome, lines); });
    p.addEventListener("mousemove", ev => showTip(ev, d.nome, lines));
    p.addEventListener("mouseleave", () => { highlight(null); hideTip(); });
    p.addEventListener("focus", () => highlight(i)); p.addEventListener("blur", () => highlight(null));
    p.addEventListener("click", () => highlight(i));
    svg.appendChild(p); paths.push(p);
    const li = el("li", { tabindex: "0", onmouseenter: () => highlight(i), onmouseleave: () => highlight(null), onfocus: () => highlight(i), onblur: () => highlight(null) },
      el("i", { style: "background:" + colors[i] }),
      el("span", {}, d.nome),
      el("span", { class: "v" }, el("b", {}, BRL.format(d.valor)), PCT.format(d.valor / TOTAL)));
    legend.appendChild(li); rows.push(li);
    a0 = a1;
  });
  box.replaceChildren(svg, center);
  legend.replaceChildren(...rows);
}

/* ================= Barras por linguagem ================= */
function porLinguagem() {
  return LINGUAGENS.map(l => {
    const gs = GRUPOS.filter(g => g.linguagem === l);
    const cache = sum(gs, g => g.cache * g.mult), producao = sum(gs, g => g.producao * g.mult), hospedagem = sum(gs, g => g.hospedagem * g.mult);
    return { l, cache, producao, hospedagem, total: cache + producao + hospedagem, artistas: sum(gs, g => g.integrantes), n: gs.length };
  }).sort((a, b) => b.total - a.total);
}
function renderLang(animate) {
  const data = porLinguagem();
  const parts = [["cache", "Cachê", css("--river")], ["producao", "Custo de produção", css("--olive")], ["hospedagem", "Hospedagem", css("--urucum")]];
  document.getElementById("keys").replaceChildren(...parts.map(([, n, c]) => el("span", {}, el("i", { style: "background:" + c }), n)));
  const max = Math.max(...data.map(d => d.total));
  const bars = data.map(d => {
    const lines = [...parts.map(([k, n]) => [n, BRL.format(d[k])]), ["Total", BRL.format(d.total)], ["Grupos ou filmes", String(d.n)]];
    const stack = el("div", { class: "stack", style: `width:${animate ? 0 : d.total / max * 100}%` },
      parts.map(([k, , c]) => el("span", { style: `width:${d[k] / d.total * 100}%;background:${c}` })));
    const row = el("div", { class: "bar", tabindex: "0", onmousemove: ev => showTip(ev, d.l, lines), onmouseleave: hideTip },
      el("span", { class: "name" }, d.l), el("span", { class: "val" }, BRL.format(d.total)), el("div", { class: "track" }, stack));
    if (animate) requestAnimationFrame(() => requestAnimationFrame(() => { stack.style.width = d.total / max * 100 + "%"; }));
    return row;
  });
  bars.forEach(b => b.querySelector(".stack").style.transition = "width .7s cubic-bezier(.2,.7,.2,1)");
  document.getElementById("langBars").replaceChildren(...bars);

  const per = [...data].map(d => ({ ...d, per: d.total / d.artistas })).sort((a, b) => b.per - a.per);
  const pmax = Math.max(...per.map(d => d.per));
  document.getElementById("perArtist").replaceChildren(...per.map(d => {
    const lines = [["Por artista", BRL.format(d.per)], ["Artistas", String(d.artistas)], ["Total da linguagem", BRL.format(d.total)]];
    return el("div", { class: "bar", tabindex: "0", onmousemove: ev => showTip(ev, d.l, lines), onmouseleave: hideTip },
      el("span", { class: "name" }, el("span", { class: "dot", style: "background:" + css(LANG_COLOR[d.l]) }), d.l),
      el("span", { class: "val" }, BRL.format(d.per)),
      el("div", { class: "track" }, el("div", { class: "stack", style: `width:${d.per / pmax * 100}%;background:${css(LANG_COLOR[d.l])}` })));
  }));
}

/* ================= Tabela ================= */
const COLS = [
  { k: "linguagem", t: "Linguagem", cls: "t-head" },
  { k: "dr", t: "Estado de origem" },
  { k: "integrantes", t: "Integrantes", f: NUM.format },
  { k: "cache", t: "Cachê", f: BRL.format },
  { k: "producao", t: "Custo de produção", f: BRL.format },
  { k: "hospedagem", t: "Hospedagem", f: BRL.format },
  { k: "regional", t: "Por regional", f: BRL.format },
  { k: "total", t: "Total da circulação", f: BRL.format, cls: "t-total" },
];
const state = { lang: "", q: "", sort: null, dir: 1 };
// Rubricas que não dependem dos grupos (custo fixo de cada regional × 10)
const DESPESAS_REGIONAIS = RUBRICAS.filter(r => !["Cachês", "Hospedagem", "Custo de produção"].includes(r.nome));
function renderChips() {
  const opts = ["", ...LINGUAGENS];
  document.getElementById("chips").replaceChildren(...opts.map(l => el("button", {
    class: "chip", type: "button", "aria-pressed": String(state.lang === l),
    onclick: () => { state.lang = l; renderChips(); renderTable(); }
  }, l || "Todas")));
}
function renderTable() {
  const tbl = document.getElementById("tbl");
  tbl.tHead.rows[0].replaceChildren(...COLS.map(c => el("th", { scope: "col", "aria-sort": state.sort === c.k ? (state.dir > 0 ? "ascending" : "descending") : "none" },
    el("button", { type: "button", onclick: () => { if (state.sort === c.k) state.dir *= -1; else { state.sort = c.k; state.dir = typeof GRUPOS[0][c.k] === "number" ? -1 : 1; } renderTable(); } }, c.t))));
  const q = state.q.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  let rows = GRUPOS.filter(g => (!state.lang || g.linguagem === state.lang) && (!q || g.dr.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().includes(q)));
  if (state.sort) rows = [...rows].sort((a, b) => { const x = a[state.sort], y = b[state.sort]; return (typeof x === "number" ? x - y : x.localeCompare(y, "pt-BR")) * state.dir; });
  const tb = tbl.tBodies[0];
  tb.replaceChildren(...(rows.length ? rows.map(g => el("tr", {}, COLS.map((c, i) => el("td", { "data-label": c.t, class: c.cls || "" },
    i === 0 ? el("span", { class: "dot", style: "background:" + css(LANG_COLOR[g.linguagem]) }) : null,
    c.f ? c.f(g[c.k]) : g[c.k]))))
    : [el("tr", {}, el("td", { colspan: String(COLS.length), class: "empty" }, "Nenhum grupo encontrado com esse filtro."))]));
  const foot = [el("tr", {},
    el("td", {}, rows.length + (rows.length === 1 ? " linha" : " linhas")), el("td"),
    el("td", { class: "num" }, NUM.format(sum(rows, g => g.integrantes)) + " artistas"), el("td"), el("td"), el("td"), el("td"),
    el("td", { class: "num" }, BRL.format(sum(rows, g => g.total))))];
  // Sem filtro: liga o subtotal dos grupos ao total do orçamento somando as despesas por regional
  if (!state.lang && !q) {
    foot.push(
      el("tr", { class: "foot-extra" },
        el("td", { colspan: String(COLS.length - 1) }, "Despesas por regional (" + DESPESAS_REGIONAIS.map(r => r.nome.toLowerCase()).join(", ") + ")"),
        el("td", { class: "num" }, BRL.format(sum(DESPESAS_REGIONAIS, r => r.valor)))),
      el("tr", { class: "foot-total" },
        el("td", { colspan: String(COLS.length - 1) }, "Total do orçamento"),
        el("td", { class: "num" }, BRL.format(TOTAL))));
  }
  tbl.tFoot.replaceChildren(...foot);
}
document.getElementById("search").addEventListener("input", e => { state.q = e.target.value; renderTable(); });

/* ================= Pontos de atenção ================= */
function renderPoints() {
  document.getElementById("points").replaceChildren(...PONTOS.map(p => el("li", { class: "card point", "data-g": p.g },
    el("div", { class: "point-head" }, el("h3", {}, p.tema), el("span", { class: "badge" }, "Prioridade " + p.g.toLowerCase())),
    el("p", {}, p.texto),
    p.impacto != null ? el("div", { class: "impact" }, el("span", { class: "k" }, p.rotulo + ": "), el("b", {}, BRL.format(p.impacto))) : null)));
}

/* ================= Referências ================= */
function refTable(id, rows, withTotal) {
  const t = document.getElementById(id);
  t.replaceChildren(
    el("thead", {}, el("tr", {}, el("th", { scope: "col" }, "Item"), el("th", { scope: "col" }, "Base"), el("th", { scope: "col" }, "Reajustado"))),
    el("tbody", {}, rows.map(([i, b, v]) => el("tr", {}, el("td", {}, i), el("td", {}, b == null ? "—" : BRL2.format(b)), el("td", {}, BRL2.format(v))))),
    withTotal ? el("tfoot", {}, el("tr", {}, el("td", {}, "Total"), el("td"), el("td", {}, BRL.format(sum(rows, r => r[2]))))) : null
  );
}

/* ================= Tema ================= */
const root = document.documentElement;
try { const saved = localStorage.getItem("aa-theme"); if (saved) root.dataset.theme = saved; } catch (e) {}
document.getElementById("themeBtn").addEventListener("click", () => {
  const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  root.dataset.theme = dark ? "light" : "dark";
  try { localStorage.setItem("aa-theme", root.dataset.theme); } catch (e) {}
  renderColors();
});
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => renderColors());

/* ================= Navegação ativa ================= */
const links = [...document.querySelectorAll(".nav a.link")];
const io = new IntersectionObserver(entries => {
  entries.forEach(en => { if (en.isIntersecting) links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id)); });
}, { rootMargin: "-40% 0px -55% 0px" });
document.querySelectorAll("main section[id]").forEach(s => io.observe(s));

/* ================= Início ================= */
function renderColors() { renderDonut(); renderLang(false); renderTable(); }
renderHero();
document.getElementById("checker").replaceChildren(...Array.from({ length: 160 }, () => document.createElement("i")));
renderDonut();
renderLang(!matchMedia("(prefers-reduced-motion: reduce)").matches);
renderChips();
renderTable();
renderPoints();
refTable("refTbl", REFERENCIAS, false);
refTable("progTbl", PROGRAMACAO, true);
