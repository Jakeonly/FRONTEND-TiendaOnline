import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProductoRead, ProductoCreate, ProductoUpdate, UUID } from '../../models/api.models';

@Injectable({
  providedIn: 'root',
})
export class ProductoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/productos`;

  list(): Observable<ProductoRead[]> {
    return this.http.get<ProductoRead[]>(this.url);
  }

  get(id: UUID): Observable<ProductoRead> {
    return this.http.get<ProductoRead>(`${this.url}/${id}`);
  }

  create(data: ProductoCreate): Observable<ProductoRead> {
    return this.http.post<ProductoRead>(this.url, data);
  }

  update(id: UUID, data: ProductoUpdate): Observable<ProductoRead> {
    return this.http.patch<ProductoRead>(`${this.url}/${id}`, data);
  }

  delete(id: UUID): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}