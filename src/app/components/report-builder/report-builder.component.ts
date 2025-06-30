import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ReportService } from '../../services/report.service';
import { ResultTableComponent } from '../result-table/result-table.component';

@Component({
  selector: 'app-report-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, ResultTableComponent],
  templateUrl: './report-builder.component.html',
  styleUrls: ['./report-builder.component.scss']
})
export class ReportBuilderComponent implements OnInit {
  marcas: any[] = [];
  modelos: any[] = [];
  modelosFiltrados: any[] = [];
  anos: number[] = [];

  selectedMarca: number | null = null;
  selectedModelo: number | null = null;
  selectedAno: number | null = null;
  nomeVeiculo: string = '';

  resultado: any[] = [];

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.reportService.getMarcas().subscribe(data => this.marcas = data);
    this.reportService.getModelos().subscribe(data => {
      this.modelos = data;
      this.modelosFiltrados = data;
    });
    this.reportService.getAnos().subscribe(data => this.anos = data);
  }

  filtrarModelos(): void {
    if (!this.selectedMarca) {
      this.modelosFiltrados = this.modelos;
    } else {
      this.modelosFiltrados = this.modelos.filter(m => m.marcaId === this.selectedMarca);
    }
  }

  gerarRelatorio(): void {
    const filtrados = this.modelos
      .filter(m => !this.selectedMarca || m.marcaId === this.selectedMarca)
      .filter(m => !this.selectedModelo || m.id === this.selectedModelo)
      .filter(m => !this.nomeVeiculo || m.nome.toLowerCase().includes(this.nomeVeiculo.toLowerCase()))
      .map(m => {
        const marca = this.marcas.find(mk => mk.id === m.marcaId)?.nome || '';
        return {
          veiculo: `${marca} ${m.nome}`,
          modelo: m.nome,
          marca,
          ano: this.selectedAno || '2023'
        };
      });

    this.resultado = filtrados;
  }

  limparFiltros(): void {
    this.selectedMarca = null;
    this.selectedModelo = null;
    this.selectedAno = null;
    this.nomeVeiculo = '';
    this.resultado = [];
    this.modelosFiltrados = this.modelos;
  }

  exportarCSV(): void {
    const header = ['Veículo', 'Modelo', 'Marca', 'Ano'];
    const csv = [
      header.join(','),
      ...this.resultado.map(r => [r.veiculo, r.modelo, r.marca, r.ano].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'relatorio.csv';
    a.click();

    window.URL.revokeObjectURL(url);
  }
}
