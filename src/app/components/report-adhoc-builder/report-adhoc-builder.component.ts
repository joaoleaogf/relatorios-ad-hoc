// src/app/components/report-adhoc-builder/report-adhoc-builder.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { AccordionModule } from 'primeng/accordion';
import { ChartModule } from 'primeng/chart';
import { ReportService } from 'src/app/services/report.service';
import { TableName } from 'src/app/models/request';

type ChartType = 'bar' | 'line' | 'pie' | 'doughnut' | 'polarArea' | 'radar';

@Component({
  selector: 'app-report-adhoc-builder',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    DropdownModule,
    ButtonModule,
    InputTextModule,
    CardModule,
    InputNumberModule,
    MultiSelectModule,
    TableModule,
    AccordionModule,
    ChartModule
  ],
  templateUrl: './report-adhoc-builder.component.html',
  styleUrls: ['./report-adhoc-builder.component.scss']
})
export class ReportAdhocBuilderComponent implements OnInit {
  chartData: any;
  chartOptions: any;
  chartType: ChartType = 'bar';
  chartLabelField: string | null = null;
   chartGroupField: string | null = null;
  chartDataField: string | null = null;
  chartNumericFields: any[] = [];
  chartCategoryFields: any[] = [];
  
  tabelas = ['marca', 'modelo', 'veiculo', 'ano'] as const;

  tableRelations: Record<string, string[]> = {
    marca: ['modelo'],
    modelo: ['marca', 'veiculo', 'ano'],
    veiculo: ['modelo'],
    ano: ['modelo']
  };

  camposDisponiveis: Record<string, string[]> = {
    ano: ['codigoan', 'codigomo', 'periodo'],
    marca: ['codigoma', 'nome'],
    modelo: ['codigomo', 'nome', 'modeloma'],
    veiculo: ['codigove', 'codigomo', 'combustivel', 'tipoveiculo', 'preco', 'siglacombustivel', 'mesreferencia']
  };

  fieldTypes: Record<string, 'text' | 'number'> = {
    'ano.codigoan': 'text',
    'ano.codigomo': 'number',
    'ano.periodo': 'number',
    'marca.codigoma': 'number',
    'marca.nome': 'text',
    'modelo.codigomo': 'number',
    'modelo.nome': 'text',
    'modelo.modeloma': 'number',
    'veiculo.codigove': 'number',
    'veiculo.codigomo': 'number',
    'veiculo.combustivel': 'text',
    'veiculo.tipoveiculo': 'number',
    'veiculo.preco': 'number',
    'veiculo.siglacombustivel': 'text',
    'veiculo.mesreferencia': 'text'
  };

  fieldLabels: Record<string, string> = {
    'ano.codigoan': 'Codigoan',
    'ano.codigomo': 'Codigomo',
    'ano.periodo': 'Periodo',
    'marca.codigoma': 'Codigoma',
    'marca.nome': 'Nome',
    'modelo.codigomo': 'Codigomo',
    'modelo.nome': 'Nome',
    'modelo.modeloma': 'Modeloma',
    'veiculo.codigove': 'Codigove',
    'veiculo.codigomo': 'Codigomo',
    'veiculo.combustivel': 'Combustivel',
    'veiculo.tipoveiculo': 'Tipoveiculo',
    'veiculo.preco': 'Preco',
    'veiculo.siglacombustivel': 'Siglacombustivel',
    'veiculo.mesreferencia': 'Mesreferencia'
  };

  fromPrincipal: TableName = 'veiculo';
  camposSelecionados: Record<string, string[]> = {
    marca: [],
    modelo: [],
    veiculo: [],
    ano: []
  };
  conditions: { field: string; operator: string; value1: any; value2?: any }[] = [];
  orderField: string | null = null;
  orderDirection = 'ASC';
  resultado: any[] = [];
  resultColumns: { field: string; header: string }[] = [];

  camposRelacionadosOptions: { label: string, value: string }[] = [];

  get tabelasOptions() {
    return this.tabelas.map(t => ({ label: this.getFieldLabel(t), value: t }));
  }

  get tabelasRelacionadas(): string[] {
    const related = this.tableRelations[this.fromPrincipal] || [];
    return [...new Set([this.fromPrincipal, ...related])];
  }

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.updateCamposRelacionados();
    this.setupChartOptions();
  }

  updateCamposRelacionados(): void {
    const campos = Object.keys(this.fieldTypes).filter(field =>
      this.tabelasRelacionadas.some(t => field.startsWith(t + '.'))
    );
    this.camposRelacionadosOptions = campos.map(c => ({ label: this.getFieldLabel(c), value: c }));
  }

 
  onPrincipalTableChange() {
    this.camposSelecionados = { marca: [], modelo: [], veiculo: [], ano: [] };
    this.conditions = [];
    this.orderField = null;
    this.resultado = [];
    this.chartData = null; 
    this.updateCamposRelacionados();
  }
  
  trackByTabela(index: number, tabela: string): string {
    return tabela;
  }

  adicionarCondicao() {
    this.conditions.push({ field: '', operator: '=', value1: '' });
  }

  removerCondicao(i: number) {
    this.conditions.splice(i, 1);
  }

  getOperadoresValidos(field: string): {label: string, value: string}[] {
    const tipo = this.fieldTypes[field] || 'text';
    const operadores = tipo === 'text' ? ['=', 'like'] : ['=', '>', '<', 'between'];
    return operadores.map(op => ({label: op, value: op}));
  }
  
  async gerarRelatorio() {
    const cond: Record<string, [string, string?, string?]> = {};
    this.conditions.forEach(c => {
      if (c.field && c.value1) {
        cond[c.field] = [c.operator, c.value1, c.value2];
      }
    });

    const selectedFields: Record<string, string[]> = {};
    for (const tabela in this.camposSelecionados) {
        if (this.camposSelecionados[tabela].length > 0) {
            selectedFields[tabela] = this.camposSelecionados[tabela];
        }
    }

    const input = {
      data: {
        from_principal: this.fromPrincipal,
        ...selectedFields,
        conditions: cond,
        order: this.orderField ? { field: this.orderField, direction: this.orderDirection } : undefined
      }
    };

    console.log('Enviando para API:', JSON.stringify(input, null, 2));

    this.resultado = await this.reportService.gerarRelatorio(input);

    this.prepareResultTable();
    this.prepareChartSelectors();
  }

  prepareResultTable() {
      if (this.resultado.length > 0) {
          this.resultColumns = Object.keys(this.resultado[0]).map(field => ({
              field: field,
              header: this.getFieldLabel(field)
          }));
      }
  }

  exportarCSV() {
    if (!this.resultado.length) return;
    const header = Object.keys(this.resultado[0]);
    const csv = [
      header.map(h => this.getFieldLabel(h)).join(','),
      ...this.resultado.map(row => header.map(h => row[h]).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'relatorio_adhoc.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  
  setupChartOptions() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.chartOptions = {
        plugins: {
            legend: {
                labels: {
                    color: textColor
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder,
                    drawBorder: false
                }
            },
            x: {
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder,
                    drawBorder: false
                }
            }
        }
    };
  }

  prepareChartSelectors() {
  if (this.resultado.length === 0) return;

  const fields = Object.keys(this.resultado[0]);

  this.chartNumericFields = fields.map(f => ({
    label: this.getFieldLabel(f),
    value: f
  }));

  this.chartCategoryFields = fields.map(f => ({
    label: this.getFieldLabel(f),
    value: f
  }));

  this.chartLabelField = null;
  this.chartGroupField = null;
  this.chartDataField = null;
  this.chartData = null;
}


generateChart() {
  if (!this.chartLabelField || !this.resultado.length) {
    this.chartData = null;
    return;
  }

  const groupField = this.chartGroupField;
  const valueField = this.chartDataField;

  const aggregation = new Map<string, Map<string, number>>();

  for (const row of this.resultado) {
    const label = String(row[this.chartLabelField]);
    const group = groupField ? String(row[groupField]) : 'Todos';

    if (!aggregation.has(group)) {
      aggregation.set(group, new Map<string, number>());
    }

    const groupMap = aggregation.get(group)!;

    let valor = 1;
    if (valueField) {
      const val = parseFloat(row[valueField]);
      valor = !isNaN(val) ? val : 0;
    }

    if (groupMap.has(label)) {
      groupMap.set(label, groupMap.get(label)! + valor);
    } else {
      groupMap.set(label, valor);
    }
  }

  const xLabelsSet = new Set<string>();
  aggregation.forEach(groupMap => {
    groupMap.forEach((_, label) => xLabelsSet.add(label));
  });
  const labels = Array.from(xLabelsSet).sort();

  const backgroundColors = [
    'rgba(75, 192, 192, 0.4)',
    'rgba(54, 162, 235, 0.4)',
    'rgba(255, 205, 86, 0.4)',
    'rgba(153, 102, 255, 0.4)',
    'rgba(255, 159, 64, 0.4)',
    'rgba(201, 203, 207, 0.4)'
  ];

  const borderColors = [
    'rgb(75, 192, 192)',
    'rgb(54, 162, 235)',
    'rgb(255, 205, 86)',
    'rgb(153, 102, 255)',
    'rgb(255, 159, 64)',
    'rgb(201, 203, 207)'
  ];

  const datasets: any[] = [];
  let i = 0;
  aggregation.forEach((groupMap, groupName) => {
    const data = labels.map(l => groupMap.get(l) || 0);

    datasets.push({
      label: groupField ? `${groupName}` : 'Todos',
      data: data,
      backgroundColor: backgroundColors[i % backgroundColors.length],
      borderColor: borderColors[i % borderColors.length],
      fill: this.chartType === 'line' ? false : true,
      borderWidth: 1
    });

    i++;
  });

  this.chartData = {
    labels: labels,
    datasets: datasets
  };
}

  getFieldLabel(field: string): string {
    return this.fieldLabels[field] || field;
  }

  getCamposDisponiveisOptions(tabela: string) {
      const campos = this.camposDisponiveis[tabela] || [];
      return campos.map(c => ({
          label: this.getFieldLabel(`${tabela}.${c}`),
          value: c
      }));
  }
}
