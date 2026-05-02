import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PagoRead, PagoCreate, PagoUpdate, UUID } from '../../models/api.models';

@Injectable({
  providedIn: 'root',
})
export class PagoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/pagos`;

  list(): Observable<PagoRead[]> {
    return this.http.get<PagoRead[]>(this.url);
  }

  get(id: UUID): Observable<PagoRead> {
    return this.http.get<PagoRead>(`${this.url}/${id}`);
  }

  create(data: PagoCreate): Observable<PagoRead> {
    return this.http.post<PagoRead>(this.url, data);
  }

  update(id: UUID, data: PagoUpdate): Observable<PagoRead> {
    return this.http.put<PagoRead>(`${this.url}/${id}`, data);
  }

  delete(id: UUID): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}