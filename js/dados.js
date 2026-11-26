/* Dados do orçamento, copiados da planilha "SESC AMAZONIA DAS ARTES 202627 v2.xlsx" sem alterações
   (abas ORÇAMENTO, Detalhamento e AÉREOS). Valores sem reajuste. */

const FONTE = {
  arquivo: "SESC AMAZONIA DAS ARTES 202627 v2.xlsx",
  versao: "v2 · 26/11/2026",
  abas: "ORÇAMENTO, Detalhamento e AÉREOS",
};

// Número de departamentos regionais da circulação. Usado nos cálculos e textos.
const REGIONAIS = 10;

// Uma linha por grupo ou exposição, com os totais da circulação (soma de todos os regionais onde se apresenta).
// - Os grupos se apresentam nos 10 regionais, mas não pagam custo de produção nem hospedagem no estado de origem.
// - As exposições circulam por 3 ou 4 regionais.
// [linguagem, título, estado de origem, integrantes, regionais, cachê, custo de produção, hospedagem, transfer aéreo, transfer terrestre]
const GRUPOS = [
  ["Circo", "(I) Mundo de Sofia", "Amazonas", 3, 10, 37000, 7500, 12285, 75000, 1350],
  ["Circo", "Marias da Terra", "Piauí", 4, 10, 44000, 8500, 15840, 100000, 1800],
  ["Teatro", "Ô de Casa", "Pará", 4, 10, 44000, 9000, 15840, 100000, 1800],
  ["Teatro", "Cordel do Amor Sem Fim", "Roraima", 5, 10, 50000, 11250, 26160, 125000, 2250],
  ["Teatro", "O Amor é Apertado no Peito do Homem Torto", "Amapá", 5, 10, 50000, 11250, 21840, 125000, 2250],
  ["Teatro", "O Menino Inventador", "Mato Grosso", 4, 10, 50000, 9000, 15840, 100000, 1800],
  ["Literatura", "Bicho que vira gente, gente que vira bicho", "Maranhão", 4, 10, 44000, 9000, 18240, 100000, 1800],
  ["Literatura", "Mapinguari", "Rondônia", 1, 10, 37000, 2250, 6000, 25000, 450],
  ["Literatura", "Poesia ao Pé do Ouvido", "Tocantins", 2, 10, 37000, 4500, 7920, 50000, 900],
  ["Música", "Zenaide Parteira", "Acre", 5, 10, 44000, 11250, 18240, 125000, 2250],
  ["Artes Visuais", "Cartas para um Corpo Preto", "Tocantins", 1, 3, 13200, 1125, 1500, 7500, 0],
  ["Artes Visuais", "Guardar", "Pará", 1, 3, 13200, 1125, 1500, 7500, 0],
  ["Artes Visuais", "Cacau Ruby", "Rondônia", 1, 4, 17600, 1500, 2000, 10000, 0],
].map(([linguagem, titulo, dr, integrantes, regionais, cache, producao, hospedagem, aereo, terrestre]) => {
  // Na planilha, o total geral de transfer aéreo vem só da aba AÉREOS (os 10 grupos):
  // o aéreo das exposições aparece na aba ORÇAMENTO, mas não entra no total.
  const aereoForaDoTotal = linguagem === "Artes Visuais";
  const total = cache + producao + hospedagem + terrestre + (aereoForaDoTotal ? 0 : aereo);
  return { linguagem, titulo, dr, integrantes, regionais, cache, producao, hospedagem, aereo, terrestre, aereoForaDoTotal, total };
});

// Rubricas do orçamento.
// - As cinco ligadas aos grupos são somadas a partir de GRUPOS (respeitando o aéreo fora do total).
// - As demais são custo fixo de cada regional: têm o campo "regional" e valem regional × REGIONAIS.
const RUBRICAS = (() => {
  const somaGrupos = campo => GRUPOS.reduce((s, g) => s + (campo === "aereo" && g.aereoForaDoTotal ? 0 : g[campo]), 0);
  const doGrupo = (nome, detalhe, campo, base) => ({ nome, detalhe, valor: somaGrupos(campo), base });
  const porRegional = (nome, detalhe, regional) => ({
    nome, detalhe, regional, valor: regional * REGIONAIS,
    base: "R$ " + regional.toLocaleString("pt-BR") + " por regional × " + REGIONAIS,
  });
  return [
    doGrupo("Transfer aéreo", "Inclui excesso de bagagem e transporte de obras", "aereo", "10 trechos × R$ 2.500 × integrantes de cada grupo"),
    doGrupo("Cachês", "Grupos e exposições", "cache", "Cachê do grupo em cada um dos 10 regionais; exposições R$ 4.400 por regional"),
    doGrupo("Hospedagem", "Quartos single, duplo ou triplo", "hospedagem", "3 diárias por regional, fora o estado de origem; exposições 2 diárias single"),
    doGrupo("Custo de produção", "Alimentação e trânsitos dos artistas", "producao", "R$ 125 por integrante por dia; 2 dias por regional (3 no último de cada corredor), fora o estado de origem"),
    doGrupo("Transfer terrestre", "Deslocamentos por terra dos grupos", "terrestre", "R$ 450 por integrante (média), uma vez por grupo"),
    porRegional("Produção local", "Acessibilidade, mediação, registros, materiais", 15000),
    porRegional("Transporte interno", "Deslocamentos dentro de cada regional", 12000),
    porRegional("Divulgação", "Comunicação da circulação", 10000),
    porRegional("Camarim e coquetel", "Alimentação nos eventos", 4000),
  ];
})();

// Preços unitários da planilha (colunas de referência da aba ORÇAMENTO). [item, valor, unidade]
const REFERENCIAS = [
  ["Cachê, grupo de 1 a 3 integrantes", 3700, "por regional"],
  ["Cachê, grupo de 4 a 6 integrantes", 4400, "por regional"],
  ["Cachê, grupo de 7 ou mais", 5000, "por regional"],
  ["Cachê de exposição", 4400, "por regional"],
  ["Oficina", 400, "por regional · não usada no total"],
  ["Custo de produção", 125, "por integrante por dia"],
  ["Hospedagem single", 250, "por dia"],
  ["Hospedagem dupla", 330, "por dia"],
  ["Hospedagem tripla", 430, "por dia"],
  ["Trecho aéreo", 2500, "por integrante por trecho"],
  ["Transfer terrestre", 450, "por integrante (média)"],
  ["Transporte interno", 12000, "por regional"],
  ["Alimentação (camarim e coquetel)", 4000, "por regional"],
  ["Produção local", 15000, "por regional"],
  ["Divulgação", 10000, "por regional"],
  ["Licenciamento de filme", 5000, "por filme · audiovisual zerado"],
  ["Transfer por regional", 70000, "valor antigo · não usado"],
];

// Circulação dos grupos: dois corredores de 5 regionais. [sigla, modo de chegada]
const CORREDORES = [
  { nome: "Corredor 1", mes: "Agosto", regionais: [["TO", "Aéreo"], ["MT", "Aéreo"], ["AM", "Aéreo"], ["MA", "Terrestre"], ["PI", "Terrestre"]] },
  { nome: "Corredor 2", mes: "Setembro", regionais: [["AP", "Aéreo"], ["RR", "Aéreo"], ["PA", "Aéreo"], ["RO", "Terrestre"], ["AC", "Terrestre"]] },
];

// Trechos aéreos (aba AÉREOS): a mesma rota para todos os grupos, R$ 2.500 por integrante por trecho.
const TRECHOS_AEREOS = [
  "Macapá/AP → Palmas/TO", "Palmas/TO → Cuiabá/MT", "Cuiabá/MT → Manaus/AM", "Manaus/AM → São Luís/MA",
  "Teresina/PI → Macapá/AP", "Macapá/AP → Boa Vista/RR", "Boa Vista/RR → Belém/PA", "Belém/PA → Macapá/AP",
  "Macapá/AP → Porto Velho/RO", "Rio Branco/AC → Macapá/AP",
];

// Roteiro das exposições. [regional, período]
const ROTEIRO_EXPOSICOES = [
  { titulo: "Cartas para um Corpo Preto", origem: "TO", roteiro: [["RO", "24/03 – 22/04"], ["PA", "08/05 – 06/06"], ["PI", "06/08 – 04/09"]] },
  { titulo: "Guardar", origem: "PA", roteiro: [["AC", "24/03 – 22/04"], ["AP", "08/05 – 06/06"], ["AM", "06/08 – 04/09"]] },
  { titulo: "Cacau Ruby", origem: "RO", roteiro: [["TO", "24/03 – 22/04"], ["MA", "08/05 – 06/06"], ["MT", "06/08 – 04/09"], ["RR", "19/10 – 23/11"]] },
];

// Divergências encontradas ao analisar a planilha v2. g = prioridade (Alta, Média, Baixa).
const PONTOS = [
  { tema: "Aéreo das exposições fora do total", g: "Alta", impacto: 25000, rotulo: "Valor fora do total",
    texto: "O total geral de transfer aéreo (G26) vem só da aba AÉREOS, que tem os 10 grupos. O aéreo das 3 exposições (R$ 2.500 por regional) aparece na aba ORÇAMENTO, mas não é somado. Com ele, o total seria R$ 2.108.105." },
  { tema: "Reajuste removido", g: "Alta", impacto: null,
    texto: "A versão anterior aplicava 5% sobre todos os valores (e citava 15% numa nota). A v2 usa os valores base, sem reajuste. Confirmar se é intencional." },
  { tema: "Rota aérea única", g: "Média", impacto: null,
    texto: "Todos os grupos têm os mesmos 10 trechos, começando em Macapá. Não há o trecho da cidade de origem até Macapá nem a volta para casa." },
  { tema: "Transfer terrestre uma vez por grupo", g: "Média", impacto: 16650, rotulo: "Total atual",
    texto: "O transfer terrestre é R$ 450 por integrante, contado uma vez por grupo. Se a média for por regional, o valor fica bem maior." },
  { tema: "Hospedagem do Circo AM", g: "Média", impacto: 3375, rotulo: "Diferença estimada",
    texto: "A fórmula usa (330 + 125) × 3: o 125 é a diária de custo de produção, não a hospedagem single (250). A descrição dos quartos também foi arrastada (\"2 duplo\", \"3 duplo\"… \"10 duplo + 1 single\")." },
  { tema: "Dois cálculos para as exposições", g: "Média", impacto: 94250, rotulo: "Total no bloco auxiliar",
    texto: "O bloco auxiliar da aba ORÇAMENTO soma oficina (R$ 400) e aéreo de R$ 3.000 por regional. O orçamento usa oficina zero e aéreo de R$ 2.500." },
  { tema: "Hospedagem do Teatro RR", g: "Baixa", impacto: 4860, rotulo: "Economia possível",
    texto: "São 2 duplos + 1 triplo (7 vagas) para 5 integrantes. Com 2 duplos + 1 single, a hospedagem cairia. A própria planilha tem a alternativa calculada (Q87/Q88)." },
  { tema: "Referência errada no Mapinguari", g: "Baixa", impacto: null,
    texto: "O cachê do Mapinguari (Detalhamento!Q11) aponta para o total da Poesia ao Pé do Ouvido (E141) em vez de E126. Hoje os dois valem R$ 37.000." },
  { tema: "Nomes e posições na planilha", g: "Baixa", impacto: null,
    texto: "RR e MT aparecem como \"-\" na aba ORÇAMENTO; MT está no bloco de Música, mas é somado em Teatro; o terceiro bloco de exposição se chama \"Carta para o corpo preto\", mas é Cacau Ruby." },
  { tema: "Tabela de referência antiga", g: "Baixa", impacto: 1339000, rotulo: "Total da tabela",
    texto: "A tabela de referências da aba ORÇAMENTO ainda soma transfer de R$ 70.000 por regional e licenciamento de filmes. Ela não entra em nenhum cálculo e pode confundir." },
];
