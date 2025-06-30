import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  constructor(private http: HttpClient) {}

  getMarcas(): Observable<any[]> {
    return this.http.get<any[]>('/assets/mock-data/marcas.json');
  }

  getModelos(): Observable<any[]> {
    return this.http.get<any[]>('/assets/mock-data/modelos.json');
  }

  getAnos(): Observable<number[]> {
    return this.http.get<number[]>('/assets/mock-data/anos.json');
  }

  gerarRelatorio(filtro: any): Observable<any[]> {
    // Simula uma resposta com filtro aplicado
    return this.http.get<any[]>('/assets/mock-data/modelos.json').pipe(
      delay(500),
      // Aqui você pode filtrar manualmente depois
    );
  }
}
