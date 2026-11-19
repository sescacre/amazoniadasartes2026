/* Dados do orçamento, copiados da planilha "SESC AMAZONIA DAS ARTES 202627.xlsx" sem alterações. */
const GRUPOS = [
  ["Circo","Amazonas",3,3885,1188,1356,10], ["Circo","Piauí",4,4620,1584,2082,10],
  ["Dança","Amapá",7,5250,2772,3912,10],
  ["Teatro","Pará",4,4620,1584,2082,10], ["Teatro","Mato Grosso",10,5250,3960,5205,10], ["Teatro","Roraima",8,5250,3168,4164,10],
  ["Artes Visuais","Tocantins",1,3885,660,1315,10], ["Artes Visuais","Pará",1,3885,660,1315,10], ["Artes Visuais","Rondônia",1,3885,660,1315,10],
  ...["Acre","Amazonas","Maranhão","Piauí","Tocantins","Roraima","Rondônia","Mato Grosso","Pará","Amapá"].map(d => ["Audiovisual",d,1,5000,396,789,1]),
  ["Literatura","Maranhão",4,4620,1584,2082,10], ["Literatura","Rondônia",1,3885,396,789,10],
  ["Música","Acre",7,5250,2772,3912,10], ["Música","Tocantins",7,5250,2772,3912,10],
].map(([linguagem, dr, integrantes, cache, producao, hospedagem, mult]) => {
  const regional = cache + producao + hospedagem;
  return { linguagem, dr, integrantes, cache, producao, hospedagem, mult, regional, total: regional * mult };
});

const RUBRICAS = [
  { nome: "Transfer", detalhe: "Inclui excesso de bagagem e transporte de obras", valor: 735000, base: "R$ 73.500 por regional × 10" },
  { nome: "Cachês", detalhe: "Grupos, exposições e licenciamento de filmes", valor: 645350, base: "Cachê de cada grupo × 10 regionais; filmes uma vez" },
  { nome: "Hospedagem", detalhe: "Quartos single, duplo ou triplo", valor: 342300, base: "3 dias por apresentação; exposições 5 dias" },
  { nome: "Custo de produção", detalhe: "Alimentação e trânsitos dos artistas", valor: 241560, base: "R$ 132 por integrante por dia" },
  { nome: "Produção local", detalhe: "Acessibilidade, mediação, registros, materiais", valor: 157500, base: "R$ 15.750 por regional × 10" },
  { nome: "Transporte interno", detalhe: "Deslocamentos dentro de cada regional", valor: 126000, base: "R$ 12.600 por regional × 10" },
  { nome: "Divulgação", detalhe: "Comunicação da circulação", valor: 105000, base: "R$ 10.500 por regional × 10" },
  { nome: "Camarim e coquetel", detalhe: "Alimentação nos eventos", valor: 42000, base: "R$ 4.200 por regional × 10" },
];

const REFERENCIAS = [
  ["Cachê de exposição",4400,4620],["Oficina",400,420],["Custo de produção (por dia)",125,131.25],
  ["Hospedagem single (por dia)",250,262.5],["Hospedagem dupla (por dia)",330,346.5],["Hospedagem tripla (por dia)",430,451.5],
  ["Cachê, grupo de 1 a 3 integrantes",3700,3885],["Cachê, grupo de 4 a 6 integrantes",4400,4620],["Cachê, grupo de 7 ou mais",5000,5250],
  ["Licenciamento de filme (R$ 500 × 10 exibições)",5000,5250],["Transfer por regional",70000,73500],["Transporte interno por regional",12000,12600],
  ["Alimentação por regional",4000,4200],["Produção local por regional",15000,15750],["Divulgação por regional",10000,10500],
];
const PROGRAMACAO = [
  ["Cachê",4400,4620],["Palestrante",1000,1050],["Jurados",3000,9000],["Mediador",500,525],
  ["Outros (foto, comunicação etc.)",6000,6300],["Produção local do festival audiovisual",null,50000],
];

const PONTOS = [
  { tema: "Percentual de reajuste", g: "Alta", impacto: null,
    texto: "A aba REFERÊNCIAS fala em aumento de 15%, mas todas as fórmulas aplicam 5% (coluna IPCA). Se o certo for 15%, todo o orçamento está abaixo do previsto." },
  { tema: "Programação local fora do total", g: "Alta", impacto: 71495, rotulo: "Valor fora do total",
    texto: "O bloco de programação local (cachê, palestrante, jurados, mediador, outros e R$ 50 mil do festival audiovisual) não entra no total geral. Se for por regional, seriam 10 vezes esse valor." },
  { tema: "Cachê das exposições", g: "Média", impacto: 34650, rotulo: "Diferença estimada",
    texto: "As 3 exposições usam R$ 3.885 (cachê de grupo de 1 a 3 integrantes). A referência de exposição é R$ 4.620, mais R$ 420 de oficina, que não aparece no orçamento." },
  { tema: "Detalhamento por obra desatualizado", g: "Média", impacto: 391000, rotulo: "Diferença entre as abas",
    texto: "O detalhamento da aba Lista Orçamento soma R$ 838.210 para cachê, produção e hospedagem, contra R$ 1.229.210 na aba ORÇAMENTO. Usa valores sem reajuste e portes de grupo diferentes." },
  { tema: "Audiovisual sem reajuste", g: "Baixa", impacto: 2500, rotulo: "Diferença estimada",
    texto: "O licenciamento dos filmes está em R$ 5.000; o valor reajustado da tabela é R$ 5.250. Custo de produção e hospedagem do audiovisual entram uma só vez, não × 10." },
  { tema: "Valores digitados no lugar de fórmula", g: "Baixa", impacto: null,
    texto: "Alguns totais, como os de 10 regionais de Teatro e Literatura, estão digitados. Hoje estão certos, mas não se atualizam se algum valor mudar." },
];
