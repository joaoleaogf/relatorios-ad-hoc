import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom, Observable } from 'rxjs';
import { QueryInput } from '../models/request';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  constructor(private http: HttpClient) {}
  
  gerarRelatorio(input: QueryInput): Promise<any[]> {
    return lastValueFrom(this.http.post<any[]>('http://localhost:3000/api/report', input));
  }
}
