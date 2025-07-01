// report-adhoc-builder.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ReportService } from '../../services/report.service';
import { QueryInput, TableName } from 'src/app/models/request';

@Component({
  selector: 'app-report-adhoc-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './report-adhoc-builder.component.html',
  styleUrls: ['./report-adhoc-builder.component.scss']
})
export class ReportAdhocBuilderComponent {
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

  get tabelasRelacionadas(): string[] {
    return [this.fromPrincipal, ...(this.tableRelations[this.fromPrincipal] || [])];
  }

  get camposRelacionados(): string[] {
    return this.todosCamposDisponiveis.filter(field =>
      this.tabelasRelacionadas.some(t => field.startsWith(t + '.'))
    );
  }

  todosCamposDisponiveis: string[] = Object.keys(this.fieldTypes);

  fromPrincipal: TableName = 'veiculo';

  camposSelecionados: Record<string, string[]> = {};
  conditions: { field: string; operator: string; value1: string; value2?: string }[] = [];

  orderField = '';
  orderDirection = 'ASC';

  resultado: any[] = [];

  constructor(private reportService: ReportService) {}

  toggleCampo(tabela: string, campo: string) {
    const lista = this.camposSelecionados[tabela] || [];
    const index = lista.indexOf(campo);
    if (index >= 0) {
      lista.splice(index, 1);
    } else {
      lista.push(campo);
    }
    this.camposSelecionados[tabela] = [...lista];
  }

  adicionarCondicao() {
    this.conditions.push({ field: '', operator: '=', value1: '' });
  }

  removerCondicao(i: number) {
    this.conditions.splice(i, 1);
  }

  getOperadoresValidos(tipo: 'text' | 'number'): string[] {
    return tipo === 'text' ? ['=', 'like'] : ['=', '>', '<', 'between'];
  }

  gerarRelatorio() {
    const cond: Record<string, [string, string?, string?]> = {};
    for (const c of this.conditions) {
      cond[c.field] = [c.operator, c.value1, c.value2];
    }

    const input: QueryInput = {
      data: {
        from_principal: this.fromPrincipal,
        marca: this.camposSelecionados['marca'],
        modelo: this.camposSelecionados['modelo'],
        veiculo: this.camposSelecionados['veiculo'],
        ano: this.camposSelecionados['ano'],
        conditions: cond,
        order: this.orderField ? { field: this.orderField, direction: this.orderDirection } : undefined
      }
    };

    this.reportService.gerarRelatorio(input).subscribe(data => {
      this.resultado = data;
    });
  }

  exportarCSV() {
    const header = Object.keys(this.resultado[0] || {});
    const csv = [
      header.map(h => this.getFieldLabel(h)).join(','),
      ...this.resultado.map(row => header.map(h => row[h]).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'relatorio.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  getFieldLabel(field: string): string {
    return this.fieldLabels[field] || field;
  }
}
