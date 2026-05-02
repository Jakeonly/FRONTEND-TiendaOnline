import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DetalleOrdenRead, DetalleOrdenCreate, DetalleOrdenUpdate, UUID } from '../../models/api.models';

@Injectable({
  providedIn: 'root',
})
export class DetalleOrdenService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/detalle-orden`;

  list(): Observable<DetalleOrdenRead[]> {
    return this.http.get<DetalleOrdenRead[]>(this.url);
  }

  get(id: UUID): Observable<DetalleOrdenRead> {
    return this.http.get<DetalleOrdenRead>(`${this.url}/${id}`);
  }

  create(data: DetalleOrdenCreate): Observable<DetalleOrdenRead> {
    return this.http.post<DetalleOrdenRead>(this.url, data);
  }

  update(id: UUID, data: DetalleOrdenUpdate): Observable<DetalleOrdenRead> {
    return this.http.put<DetalleOrdenRead>(`${this.url}/${id}`, data);
  }

  delete(id: UUID): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}