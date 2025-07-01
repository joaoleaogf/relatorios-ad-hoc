import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { QueryInput } from '../models/request';

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

  gerarRelatorio(input: QueryInput): Observable<any[]> {
    return this.http.post<any[]>('http://localhost:3000/api/report', input);
  }
}
