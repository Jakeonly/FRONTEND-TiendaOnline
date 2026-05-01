import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CarritoRead, CarritoCreate, UUID } from '../../models/api.models';

@Injectable({
  providedIn: 'root',
})
export class CarritoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/carritos`;

  list(): Observable<CarritoRead[]> {
    return this.http.get<CarritoRead[]>(this.url);
  }

  getByUsuario(usuarioId: UUID): Observable<CarritoRead> {
    return this.http.get<CarritoRead>(`${this.url}/usuario/${usuarioId}`);
  }

  create(data: CarritoCreate): Observable<CarritoRead> {
    return this.http.post<CarritoRead>(this.url, data);
  }

  delete(id: UUID): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}