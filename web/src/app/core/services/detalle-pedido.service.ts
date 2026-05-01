import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DetallePedidoRead, DetallePedidoCreate, DetallePedidoUpdate, UUID } from '../../models/api.models';

@Injectable({
  providedIn: 'root',
})
export class DetallePedidoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/detalle-pedido`;

  list(): Observable<DetallePedidoRead[]> {
    return this.http.get<DetallePedidoRead[]>(this.url);
  }

  listByPedido(idPedido: UUID): Observable<DetallePedidoRead[]> {
    return this.http.get<DetallePedidoRead[]>(`${this.url}/pedido/${idPedido}`);
  }

  create(data: DetallePedidoCreate): Observable<DetallePedidoRead> {
    return this.http.post<DetallePedidoRead>(this.url, data);
  }

  update(id: UUID, data: DetallePedidoUpdate): Observable<DetallePedidoRead> {
    return this.http.patch<DetallePedidoRead>(`${this.url}/${id}`, data);
  }

  delete(id: UUID): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}