# Amazônia das Artes 2026/27

Página que mostra o orçamento da circulação **Sesc Amazônia das Artes 2026/27** pelos 10 departamentos regionais: para onde vai o dinheiro, o custo por linguagem artística, a lista de grupos e filmes e os pontos de atenção encontrados na planilha.

## Estrutura

```
.
├── index.html      # estrutura da página
├── css/
│   └── style.css   # identidade visual, layout, tema claro/escuro
├── js/
│   ├── dados.js    # dados do orçamento (copiados da planilha)
│   └── main.js     # gráficos, tabela, filtros, tema e navegação
└── img/            # logos, folhas e ilustração da arte do evento
```

## Como abrir

É um site estático, sem build e sem dependências. Abra o `index.html` no navegador ou publique a pasta no GitHub Pages (Settings → Pages → branch `main`, pasta `/`).

## Atualizar os números

Todos os valores ficam em [`js/dados.js`](js/dados.js). Totais, percentuais e gráficos são calculados a partir desses dados quando a página carrega.

## Fonte

Planilha “SESC AMAZONIA DAS ARTES 202627.xlsx” (versão de 18/11/2026), abas ORÇAMENTO, REFERÊNCIAS e Lista Orçamento.
