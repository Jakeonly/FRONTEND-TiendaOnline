import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DescuentoRead, DescuentoCreate, DescuentoUpdate, UUID } from '../../models/api.models';

@Injectable({
  providedIn: 'root',
})
export class DescuentoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/descuentos`;

  list(): Observable<DescuentoRead[]> {
    return this.http.get<DescuentoRead[]>(this.url);
  }

  get(id: UUID): Observable<DescuentoRead> {
    return this.http.get<DescuentoRead>(`${this.url}/${id}`);
  }

  getByCodigo(codigo: string): Observable<DescuentoRead> {
    return this.http.get<DescuentoRead>(`${this.url}/codigo/${codigo}`);
  }

  create(data: DescuentoCreate): Observable<DescuentoRead> {
    return this.http.post<DescuentoRead>(this.url, data);
  }

  update(id: UUID, data: DescuentoUpdate): Observable<DescuentoRead> {
    return this.http.put<DescuentoRead>(`${this.url}/${id}`, data);
  }

  delete(id: UUID): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}