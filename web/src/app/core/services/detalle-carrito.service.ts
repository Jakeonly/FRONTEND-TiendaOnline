import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DetalleCarritoRead, DetalleCarritoCreate, DetalleCarritoUpdate, UUID } from '../../models/api.models';

@Injectable({
  providedIn: 'root',
})
export class DetalleCarritoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/detalle-carrito`;

 
  list(): Observable<DetalleCarritoRead[]> {
    return this.http.get<DetalleCarritoRead[]>(this.url);
  }

  listByCarrito(carritoId: UUID): Observable<DetalleCarritoRead[]> {
    return this.http.get<DetalleCarritoRead[]>(`${this.url}/carrito/${carritoId}`);
  }

  create(data: DetalleCarritoCreate): Observable<DetalleCarritoRead> {
    return this.http.post<DetalleCarritoRead>(this.url, data);
  }

  update(id: UUID, data: DetalleCarritoUpdate): Observable<DetalleCarritoRead> {
    return this.http.put<DetalleCarritoRead>(`${this.url}/${id}`, data);
  }

  delete(id: UUID): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}