# Amazônia das Artes 2026/27

Painel do orçamento da circulação **Sesc Amazônia das Artes 2026/27** pelos 10 departamentos regionais: indicadores principais, distribuição por rubrica, divisão entre grupos e despesas fixas de cada regional, lista de grupos e exposições, valores de referência e circulação (corredores, roteiro das exposições e rota aérea).

## Estrutura

```
.
├── index.html      # estrutura do painel (cards e seções)
├── css/
│   └── style.css   # identidade visual, grade do painel, tema claro/escuro, impressão
├── js/
│   ├── dados.js    # dados do orçamento (copiados da planilha) — único arquivo a editar para atualizar números
│   ├── util.js     # utilidades genéricas: formatação, criação de elementos, tooltip, tabelas simples
│   └── main.js     # monta cada seção do painel a partir dos dados
└── img/            # logos e ilustrações da arte do evento (WebP)
```

Os scripts são carregados em ordem (`dados.js` → `util.js` → `main.js`) como scripts comuns, sem módulos, para que o painel funcione abrindo o `index.html` direto do disco.

## Como abrir

É um site estático, sem build e sem dependências. Abra o `index.html` no navegador ou publique a pasta no GitHub Pages (Settings → Pages → branch `main`, pasta `/`).

## Atualizar os números

Todos os valores ficam em [`js/dados.js`](js/dados.js). Totais, percentuais e gráficos são calculados a partir desses dados quando a página carrega.

- `FONTE`: nome do arquivo, versão e abas da planilha (aparecem no cabeçalho e no rodapé).
- `REGIONAIS`: número de departamentos regionais. Muda os cálculos e os textos da página.
- `GRUPOS`: uma linha por grupo ou exposição, com os **totais da circulação** (cachê, custo de produção, hospedagem, transfer aéreo e terrestre), integrantes e número de regionais. As rubricas ligadas aos grupos são somadas daqui. O aéreo das exposições é marcado como fora do total, como na planilha.
- `RUBRICAS`: as despesas fixas são informadas como valor por regional e multiplicadas por `REGIONAIS`.
- `REFERENCIAS`: preços unitários (sem reajuste).
- `CORREDORES`, `TRECHOS_AEREOS`, `ROTEIRO_EXPOSICOES`: card de circulação.
- `PONTOS`: pontos de atenção da planilha (seção escondida por padrão).

## Seções opcionais

As seções "Linguagens" e "Pontos de atenção" estão escondidas com o atributo `hidden` no `index.html`. Para mostrá-las, basta remover o `hidden` da seção; o `main.js` só monta as seções visíveis.

## Tema

As cores são definidas uma vez em `css/style.css` com `light-dark(claro, escuro)`. O painel segue o tema do sistema, e o botão da barra superior força claro ou escuro (a escolha fica salva no navegador). Os gráficos usam `var(--cor)`, então acompanham a troca de tema sem precisar ser redesenhados. A impressão sai sempre no tema claro, em A4 paisagem.

## Fonte

Planilha “SESC AMAZONIA DAS ARTES 202627 v2.xlsx” (26/11/2026), abas ORÇAMENTO, Detalhamento e AÉREOS.
