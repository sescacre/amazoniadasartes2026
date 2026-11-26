/* Montagem do painel: indicadores, rosca das rubricas, composição, linguagens, tabela de grupos,
   pontos de atenção, referências e circulação.
   Depende de js/dados.js (FONTE, REGIONAIS, GRUPOS, RUBRICAS, REFERENCIAS, CORREDORES, TRECHOS_AEREOS,
   ROTEIRO_EXPOSICOES, PONTOS) e de js/util.js (FMT, soma, el, svgEl, cor, Tooltip...). */

/* ================= Números derivados ================= */
const TOTAL = soma(RUBRICAS, r => r.valor);
const DESPESAS_REGIONAIS = RUBRICAS.filter(r => r.regional != null); // custo fixo de cada regional
const TOTAL_FIXO = soma(DESPESAS_REGIONAIS, r => r.valor);
const TOTAL_GRUPOS = TOTAL - TOTAL_FIXO;
const RUBRICAS_ORDENADAS = [...RUBRICAS].sort(maiorPrimeiro("valor"));
const MAIOR_RUBRICA = RUBRICAS_ORDENADAS[0];

const ehExposicao = g => g.linguagem === "Artes Visuais";
const EXPOSICOES = GRUPOS.filter(ehExposicao).length;
const NGRUPOS = GRUPOS.length - EXPOSICOES;
const ARTISTAS = soma(GRUPOS, g => g.integrantes);
// Aéreo que aparece na planilha mas não entra no total geral (exposições)
const AEREO_FORA = soma(GRUPOS.filter(g => g.aereoForaDoTotal), g => g.aereo);

// Linguagens na ordem em que aparecem nos dados, cada uma com sua cor
const LINGUAGENS = [...new Set(GRUPOS.map(g => g.linguagem))];
const COR_LINGUAGEM = {
  "Circo": "--urucum", "Dança": "--flor", "Teatro": "--river", "Artes Visuais": "--warn",
  "Audiovisual": "--muted", "Literatura": "--olive", "Música": "--sun-deep",
};
const COR_RUBRICA = ["--river", "--urucum", "--olive", "--sun-deep", "--flor", "--bad", "--warn", "--muted", "--ink"]; // por ordem de valor

const parteDoTotal = v => FMT.pct(v / TOTAL);
const pontoLinguagem = l => el("span", { class: "dot", style: "background:" + cor(COR_LINGUAGEM[l]) });

/* ================= Indicadores ================= */
function renderIndicadores() {
  const itens = [
    { rotulo: "Orçamento total", valor: FMT.brl(TOTAL), legenda: RUBRICAS.length + " rubricas somadas", cor: "--river" },
    { rotulo: "Média por regional", valor: FMT.brl(TOTAL / REGIONAIS), legenda: "Total ÷ " + REGIONAIS + " regionais", cor: "--olive" },
    { rotulo: "Grupos", valor: FMT.num(NGRUPOS), legenda: "Circulam pelos " + REGIONAIS + " regionais", cor: "--urucum" },
    { rotulo: "Exposições", valor: FMT.num(EXPOSICOES), legenda: "Em 3 ou 4 regionais cada", cor: "--sun-deep" },
    { rotulo: "Artistas", valor: FMT.num(ARTISTAS), legenda: "Integrantes de grupos e exposições", cor: "--flor" },
    { rotulo: "Maior rubrica", valor: MAIOR_RUBRICA.nome, legenda: parteDoTotal(MAIOR_RUBRICA.valor) + " do total · " + FMT.brlCurto(MAIOR_RUBRICA.valor), cor: "--forest-2" },
  ];
  $("kpis").replaceChildren(...itens.map(i => el("div", { class: "kpi", style: "--accent:" + cor(i.cor) },
    el("p", { class: "k-label" }, i.rotulo),
    el("strong", { class: "k-value", title: i.valor }, i.valor),
    el("p", { class: "k-sub" }, i.legenda))));
}

/* ================= Rosca das rubricas ================= */
// Caminho SVG de uma fatia de rosca entre os ângulos a0 e a1 (radianos)
function fatia(a0, a1, R = 100, r = 64, c = 100) {
  const p = (ang, raio) => [c + raio * Math.cos(ang), c + raio * Math.sin(ang)].join(",");
  const grande = a1 - a0 > Math.PI ? 1 : 0;
  return `M${p(a0, R)} A${R},${R} 0 ${grande} 1 ${p(a1, R)} L${p(a1, r)} A${r},${r} 0 ${grande} 0 ${p(a0, r)}Z`;
}

function renderRosca() {
  const dados = RUBRICAS_ORDENADAS;
  const svg = svgEl("svg", { viewBox: "0 0 200 200", role: "img",
    "aria-label": "Gráfico de rosca das rubricas: " + dados.map(d => d.nome + " " + parteDoTotal(d.valor)).join(", ") });
  const centro = el("div", { class: "donut-center" });
  const mostrarCentro = d => centro.replaceChildren(
    el("strong", {}, d ? FMT.brl(d.valor) : FMT.brlCurto(TOTAL)),
    el("span", {}, d ? d.nome + " · " + parteDoTotal(d.valor) : "orçamento total"));

  const fatias = [], itens = [];
  const destacar = i => {
    fatias.forEach((f, j) => { f.style.opacity = i == null || i === j ? 1 : .3; });
    itens.forEach((li, j) => li.classList.toggle("on", i === j));
    mostrarCentro(dados[i]);
  };

  let angulo = -Math.PI / 2;
  const folga = 0.012;
  dados.forEach((d, i) => {
    const fim = angulo + d.valor / TOTAL * Math.PI * 2;
    const tom = cor(COR_RUBRICA[i]);
    const linhas = [["Valor", FMT.brl(d.valor)], ["Parte do total", parteDoTotal(d.valor)], ["O que é", d.detalhe], ["Cálculo", d.base]];
    const eventos = { aoEntrar: () => destacar(i), aoSair: () => destacar(null) };

    const path = svgEl("path", { d: fatia(angulo + folga, fim - folga), "aria-label": d.nome + ": " + FMT.brl(d.valor) });
    path.style.fill = tom;
    fatias.push(Tooltip.ligar(path, d.nome, linhas, eventos));

    itens.push(Tooltip.ligar(el("li", {},
      el("i", { style: "background:" + tom }),
      el("span", {}, d.nome),
      el("span", { class: "v" }, FMT.brl(d.valor)),
      el("span", { class: "p" }, parteDoTotal(d.valor)),
      el("span", { class: "lbar" }, el("i", { style: `width:${d.valor / dados[0].valor * 100}%;background:${tom}` }))),
      d.nome, linhas, eventos));

    angulo = fim;
  });

  svg.append(...fatias);
  mostrarCentro(null);
  $("donut").replaceChildren(svg, centro);
  $("legend").replaceChildren(...itens);
}

/* ================= Composição: grupos x despesas por regional ================= */
function renderComposicao() {
  const partes = [
    { nome: "Grupos e exposições", inclui: "Cachê, custo de produção, hospedagem e transfer", valor: TOTAL_GRUPOS, cor: cor("--river") },
    { nome: "Despesas por regional", inclui: DESPESAS_REGIONAIS.map(r => r.nome.toLowerCase()).join(", "), valor: TOTAL_FIXO, cor: cor("--sun-deep") },
  ];
  $("split").replaceChildren(
    el("div", { class: "split-bar", role: "img", "aria-label": partes.map(p => p.nome + " " + parteDoTotal(p.valor)).join(", ") },
      partes.map(p => Tooltip.ligar(el("span", { style: `width:${p.valor / TOTAL * 100}%;background:${p.cor}` }),
        p.nome, [["Valor", FMT.brl(p.valor)], ["Parte do total", parteDoTotal(p.valor)], ["Inclui", p.inclui]]))),
    el("div", { class: "split-legend" }, partes.map(p => el("div", {},
      el("span", { class: "s-label" }, el("i", { style: "background:" + p.cor }), p.nome),
      el("strong", {}, FMT.brl(p.valor)),
      el("span", { class: "s-pct" }, parteDoTotal(p.valor) + " do total")))));

  preencherTabela($("fixoTbl"), {
    cabecalho: ["Rubrica", "Por regional", "× " + REGIONAIS],
    linhas: [...DESPESAS_REGIONAIS].sort(maiorPrimeiro("regional")).map(r => [r.nome, FMT.brl(r.regional), FMT.brl(r.valor)]),
    rodape: ["Total", FMT.brl(soma(DESPESAS_REGIONAIS, r => r.regional)), FMT.brl(TOTAL_FIXO)],
  });
}

/* ================= Linguagens (seção opcional) ================= */
function porLinguagem() {
  return LINGUAGENS.map(l => {
    const gs = GRUPOS.filter(g => g.linguagem === l);
    const total = campo => soma(gs, g => g[campo]);
    const cache = total("cache"), producao = total("producao"), hospedagem = total("hospedagem");
    const transfer = soma(gs, g => g.terrestre + (g.aereoForaDoTotal ? 0 : g.aereo));
    const artistas = total("integrantes"), subtotal = total("total");
    return { l, cache, producao, hospedagem, transfer, artistas, n: gs.length, total: subtotal, porArtista: subtotal / artistas };
  });
}

// Linha de barra horizontal: nome, valor e trilho com o conteúdo (barra simples ou empilhada)
const linhaBarra = (nome, valor, conteudo, titulo, linhas) => Tooltip.ligar(
  el("div", { class: "bar" }, el("span", { class: "name" }, nome), el("span", { class: "val" }, valor), el("div", { class: "track" }, conteudo)),
  titulo, linhas);

function renderLinguagens() {
  const dados = porLinguagem().sort(maiorPrimeiro("total"));
  const partes = [["cache", "Cachê", cor("--river")], ["producao", "Custo de produção", cor("--olive")], ["hospedagem", "Hospedagem", cor("--urucum")], ["transfer", "Transfer", cor("--sun-deep")]];
  const animar = !matchMedia("(prefers-reduced-motion: reduce)").matches;

  $("keys").replaceChildren(...partes.map(([, nome, tom]) => el("span", {}, el("i", { style: "background:" + tom }), nome)));

  const max = dados[0].total;
  $("langBars").replaceChildren(...dados.map(d => {
    const largura = d.total / max * 100 + "%";
    const pilha = el("div", { class: "stack", style: `width:${animar ? 0 : largura};transition:width .7s cubic-bezier(.2,.7,.2,1)` },
      partes.map(([k, , tom]) => el("span", { style: `width:${d[k] / d.total * 100}%;background:${tom}` })));
    if (animar) requestAnimationFrame(() => requestAnimationFrame(() => { pilha.style.width = largura; }));
    return linhaBarra(d.l, FMT.brl(d.total), pilha, d.l,
      [...partes.map(([k, nome]) => [nome, FMT.brl(d[k])]), ["Total", FMT.brl(d.total)], ["Grupos ou exposições", String(d.n)]]);
  }));

  const porArtista = [...dados].sort(maiorPrimeiro("porArtista"));
  const pmax = porArtista[0].porArtista;
  $("perArtist").replaceChildren(...porArtista.map(d => linhaBarra(
    [pontoLinguagem(d.l), d.l], FMT.brl(d.porArtista),
    el("div", { class: "stack", style: `width:${d.porArtista / pmax * 100}%;background:${cor(COR_LINGUAGEM[d.l])}` }),
    d.l, [["Por artista", FMT.brl(d.porArtista)], ["Artistas", String(d.artistas)], ["Total da linguagem", FMT.brl(d.total)]])));
}

/* ================= Tabela de grupos ================= */
const Tabela = (() => {
  // Aéreo das exposições: aparece na planilha, mas fica fora do total (marcado com *)
  const celulaAereo = g => g.aereoForaDoTotal
    ? el("span", { class: "fora", title: "Fora do total geral da planilha" }, FMT.brl(g.aereo), el("sup", {}, "*"))
    : FMT.brl(g.aereo);
  const COLUNAS = [
    { k: "titulo", t: "Grupo", cls: "t-head", f: (v, g) => [pontoLinguagem(g.linguagem), el("span", { class: "t-name" }, v, el("small", {}, g.linguagem + " · " + g.dr))] },
    { k: "integrantes", t: "Integrantes", f: FMT.num },
    { k: "regionais", t: "Regionais", f: FMT.num },
    { k: "cache", t: "Cachê", f: FMT.brl },
    { k: "producao", t: "Custo de produção", f: FMT.brl },
    { k: "hospedagem", t: "Hospedagem", f: FMT.brl },
    { k: "aereo", t: "Transfer aéreo", f: (_, g) => celulaAereo(g) },
    { k: "terrestre", t: "Transfer terrestre", f: FMT.brl },
    { k: "total", t: "Total da circulação", f: FMT.brl, cls: "t-total" },
  ];
  const estado = { linguagem: "", busca: "", ordem: null, direcao: 1 };
  const tabela = $("tbl");

  function ordenarPor(k) {
    if (estado.ordem === k) estado.direcao *= -1;
    // Números começam do maior; textos, de A a Z
    else { estado.ordem = k; estado.direcao = typeof GRUPOS[0][k] === "number" ? -1 : 1; }
    render();
  }

  function filtrar(linguagem) {
    estado.linguagem = linguagem;
    renderFiltros();
    render();
  }

  function linhasVisiveis() {
    const busca = semAcento(estado.busca.trim());
    const casa = g => !busca || semAcento(g.dr + " " + g.titulo).includes(busca);
    const linhas = GRUPOS.filter(g => (!estado.linguagem || g.linguagem === estado.linguagem) && casa(g));
    if (!estado.ordem) return linhas;
    const k = estado.ordem;
    return [...linhas].sort((a, b) => (typeof a[k] === "number" ? a[k] - b[k] : a[k].localeCompare(b[k], "pt-BR")) * estado.direcao);
  }

  function renderFiltros() {
    $("chips").replaceChildren(...["", ...LINGUAGENS].map(l => el("button",
      { class: "chip", type: "button", "aria-pressed": String(estado.linguagem === l), onclick: () => filtrar(l) },
      l || "Todas")));
  }

  function renderCabecalho() {
    tabela.tHead.rows[0].replaceChildren(...COLUNAS.map(c => el("th", {
      scope: "col",
      "aria-sort": estado.ordem !== c.k ? "none" : estado.direcao > 0 ? "ascending" : "descending",
    }, el("button", { type: "button", onclick: () => ordenarPor(c.k) }, c.t))));
  }

  function renderCorpo(linhas) {
    tabela.tBodies[0].replaceChildren(...(linhas.length
      ? linhas.map(g => el("tr", {}, COLUNAS.map(c => el("td", { "data-label": c.t, class: c.cls },
        c.f ? c.f(g[c.k], g) : g[c.k]))))
      : [el("tr", {}, el("td", { colspan: COLUNAS.length, class: "empty" }, "Nenhum grupo encontrado com esse filtro."))]));
  }

  function renderRodape(linhas) {
    const vazias = n => Array.from({ length: n }, () => el("td"));
    const somaBrl = campo => el("td", { class: "num" }, FMT.brl(soma(linhas, campo)));
    const rodape = [el("tr", {},
      el("td", {}, linhas.length + (linhas.length === 1 ? " linha" : " linhas")),
      el("td", { class: "num" }, FMT.num(soma(linhas, g => g.integrantes)) + " artistas"), vazias(1),
      somaBrl(g => g.cache), somaBrl(g => g.producao), somaBrl(g => g.hospedagem),
      somaBrl(g => g.aereoForaDoTotal ? 0 : g.aereo), somaBrl(g => g.terrestre),
      somaBrl(g => g.total))];
    // Sem filtro: liga o subtotal dos grupos ao total do orçamento somando as despesas por regional
    if (!estado.linguagem && !estado.busca.trim()) {
      const linhaTotal = (cls, rotulo, valor) => el("tr", { class: cls },
        el("td", { colspan: COLUNAS.length - 1 }, rotulo), el("td", { class: "num" }, FMT.brl(valor)));
      rodape.push(
        linhaTotal("foot-extra", "Despesas por regional (" + DESPESAS_REGIONAIS.map(r => r.nome.toLowerCase()).join(", ") + ")", TOTAL_FIXO),
        linhaTotal("foot-total", "Total do orçamento", TOTAL));
    }
    tabela.tFoot.replaceChildren(...rodape);
    const fora = soma(linhas.filter(g => g.aereoForaDoTotal), g => g.aereo);
    $("notaTabela").hidden = !fora;
    $("notaTabela").textContent = "* Transfer aéreo das exposições (" + FMT.brl(fora) + ") aparece na planilha, mas não entra no total geral. Por isso não é somado aqui.";
  }

  function render() {
    const linhas = linhasVisiveis();
    renderCabecalho();
    renderCorpo(linhas);
    renderRodape(linhas);
  }

  function iniciar() {
    $("search").addEventListener("input", e => { estado.busca = e.target.value; render(); });
    renderFiltros();
    render();
  }

  return { iniciar };
})();

/* ================= Pontos de atenção (seção opcional) ================= */
function renderPontos() {
  $("points").replaceChildren(...PONTOS.map(p => el("li", { class: "card point", "data-g": p.g },
    el("div", { class: "point-head" }, el("h3", {}, p.tema), el("span", { class: "badge" }, "Prioridade " + p.g.toLowerCase())),
    el("p", {}, p.texto),
    p.impacto != null ? el("div", { class: "impact" }, el("span", { class: "k" }, p.rotulo + ": "), el("b", {}, FMT.brl(p.impacto))) : null)));
  $("fonteAtencao").hidden = false;
}

/* ================= Referências ================= */
function renderReferencias() {
  preencherTabela($("refTbl"), {
    cabecalho: ["Item", "Valor", "Unidade"],
    linhas: REFERENCIAS.map(([item, valor, unidade]) => [item, FMT.brlCentavos(valor), el("span", { class: "unit" }, unidade)]),
  });
}

/* ================= Circulação ================= */
function renderCirculacao() {
  const etiqueta = modo => el("span", { class: "tag tag-" + semAcento(modo) }, modo);

  preencherTabela($("corredoresTbl"), {
    cabecalho: ["Corredor", "Mês", "Regionais"],
    linhas: CORREDORES.map(c => [c.nome, c.mes,
      el("span", { class: "stops" }, c.regionais.map(([uf, modo]) => el("span", { class: "stop", title: modo }, uf, etiqueta(modo))))]),
  });

  preencherTabela($("exposTbl"), {
    cabecalho: ["Exposição", "Regional", "Período"],
    linhas: ROTEIRO_EXPOSICOES.flatMap(e => e.roteiro.map(([uf, periodo], i) => [
      i === 0 ? el("span", { class: "t-name" }, e.titulo, el("small", {}, "Origem: " + e.origem)) : "", uf, periodo])),
  });

  $("trechos").replaceChildren(...TRECHOS_AEREOS.map(t => el("li", {}, t)));
}

/* ================= Barra superior ================= */
function iniciarBarraSuperior() {
  // O tema salvo já foi aplicado por um script no <head>, antes da pintura.
  // As cores usam var(--token), então trocar o tema não exige redesenhar nada.
  const raiz = document.documentElement;
  $("themeBtn").addEventListener("click", () => {
    const escuro = raiz.dataset.theme ? raiz.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    raiz.dataset.theme = escuro ? "light" : "dark";
    try { localStorage.setItem("aa-theme", raiz.dataset.theme); } catch (e) { /* armazenamento indisponível */ }
  });
  $("printBtn").addEventListener("click", () => print());
  $("checker").replaceChildren(...Array.from({ length: 240 }, () => el("i")));
}

/* ================= Início ================= */
// Seções com o atributo hidden no HTML não são montadas
const visivel = id => !$(id).hidden;

document.querySelectorAll("[data-regionais]").forEach(e => { e.textContent = REGIONAIS; });
document.querySelectorAll("[data-fonte]").forEach(e => { e.textContent = FONTE[e.dataset.fonte]; });
iniciarBarraSuperior();
renderIndicadores();
renderRosca();
renderComposicao();
if (visivel("linguagens")) renderLinguagens();
Tabela.iniciar();
if (visivel("atencao")) renderPontos();
renderReferencias();
renderCirculacao();
