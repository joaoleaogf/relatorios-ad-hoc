// report-adhoc-builder.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

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
    marca: ['codigoMa', 'nomeMa'],
    modelo: ['codigoMo', 'nomeMo', 'modeloMa'],
    veiculo: ['placa', 'codigoMo'],
    ano: ['ano', 'codigoMo']
  };

  fieldTypes: Record<string, 'text' | 'number'> = {
    'marca.nomeMa': 'text',
    'modelo.nomeMo': 'text',
    'modelo.codigoMo': 'number',
    'modelo.modeloMa': 'text',
    'veiculo.placa': 'text',
    'veiculo.codigoMo': 'number',
    'ano.ano': 'number',
    'ano.codigoMo': 'number',
    'marca.codigoMa': 'number'
  };

  fieldLabels: Record<string, string> = {
    'marca.nomeMa': 'Nome da Marca',
    'marca.codigoMa': 'Código da Marca',
    'modelo.nomeMo': 'Nome do Modelo',
    'modelo.modeloMa': 'Marca do Modelo',
    'modelo.codigoMo': 'Código do Modelo',
    'veiculo.placa': 'Placa do Veículo',
    'veiculo.codigoMo': 'Código do Modelo do Veículo',
    'ano.codigoMo': 'Código do Ano do Modelo',
    'ano.ano': 'Ano'
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

  fromPrincipal: string = 'veiculo';

  camposSelecionados: Record<string, string[]> = {};
  conditions: { field: string; operator: string; value1: string; value2?: string }[] = [];

  orderField = '';
  orderDirection = 'ASC';

  resultado: any[] = [];

  constructor(private http: HttpClient) {}

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

    const input = {
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

    this.http.post<any[]>('/report', input).subscribe(data => {
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
