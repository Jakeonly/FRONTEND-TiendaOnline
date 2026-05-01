import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PedidoRead, PedidoCreate, PedidoUpdate, UUID } from '../../models/api.models';

@Injectable({
  providedIn: 'root',
})
export class PedidoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/pedidos`;

  list(): Observable<PedidoRead[]> {
    return this.http.get<PedidoRead[]>(this.url);
  }

  create(data: PedidoCreate): Observable<PedidoRead> {
    return this.http.post<PedidoRead>(this.url, data);
  }

  update(id: UUID, data: PedidoUpdate): Observable<PedidoRead> {
    return this.http.patch<PedidoRead>(`${this.url}/${id}`, data);
  }

  delete(id: UUID): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}