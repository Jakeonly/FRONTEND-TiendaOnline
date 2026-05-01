import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OrdenRead, OrdenCreate, OrdenUpdate, UUID } from '../../models/api.models';

@Injectable({
  providedIn: 'root',
})
export class OrdenService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/ordenes`;

  list(): Observable<OrdenRead[]> {
    return this.http.get<OrdenRead[]>(this.url);
  }

  get(id: UUID): Observable<OrdenRead> {
    return this.http.get<OrdenRead>(`${this.url}/${id}`);
  }

  create(data: OrdenCreate): Observable<OrdenRead> {
    return this.http.post<OrdenRead>(this.url, data);
  }

  update(id: UUID, data: OrdenUpdate): Observable<OrdenRead> {
    return this.http.patch<OrdenRead>(`${this.url}/${id}`, data);
  }

  delete(id: UUID): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}