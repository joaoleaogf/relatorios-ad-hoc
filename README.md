# Relatórios Ad-Hoc

> Construtor de relatórios **ad-hoc** em Angular + PrimeNG: monte consultas escolhendo campos, filtros e agrupamentos, e visualize o resultado em tabela dinâmica e gráficos.

![Angular](https://img.shields.io/badge/Angular-18-DD0031?logo=angular&logoColor=white)
![PrimeNG](https://img.shields.io/badge/PrimeNG-UI-007ad9)
![Chart.js](https://img.shields.io/badge/Chart.js-charts-FF6384?logo=chartdotjs&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-blue)

## Visão geral

Ferramenta que permite ao usuário montar relatórios **sob demanda** sem escrever código: seleciona dimensões e métricas, aplica filtros e obtém o resultado em uma tabela navegável (e visualizações). Útil para explorar bases tabulares de forma flexível.

- **Builder** de consulta com campos, filtros e agrupamentos;
- **Tabela de resultados** dinâmica;
- Visualizações com **Chart.js**;
- UI com **PrimeNG**.

## Stack

`Angular 18` · `TypeScript` · `PrimeNG` · `Chart.js` · `RxJS`

## Estrutura

| Caminho | Papel |
|---|---|
| `components/report-adhoc-builder` | Montagem da consulta (campos, filtros) |
| `components/result-table` | Renderização tabular do resultado |
| `services/report.service.ts` | Orquestra a requisição/montagem do relatório |
| `models/request.ts` | Contrato da requisição de relatório |

## Como rodar

```bash
npm install
ng serve
# abra http://localhost:4200
```

> Os dados em `src/assets/mock-data/` são mocks para demonstração do builder.

## Licença

[MIT](LICENSE) © João Leão
