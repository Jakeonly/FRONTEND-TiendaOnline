import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CategoriaRead, CategoriaCreate, CategoriaUpdate, UUID } from '../../models/api.models';

@Injectable({
  providedIn: 'root',
})
export class CategoriaService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/categorias`;

  list(): Observable<CategoriaRead[]> {
    return this.http.get<CategoriaRead[]>(this.url);
  }

  get(id: UUID): Observable<CategoriaRead> {
    return this.http.get<CategoriaRead>(`${this.url}/${id}`);
  }

  create(data: CategoriaCreate): Observable<CategoriaRead> {
    return this.http.post<CategoriaRead>(this.url, data);
  }

  update(id: UUID, data: CategoriaUpdate): Observable<CategoriaRead> {
    return this.http.put<CategoriaRead>(`${this.url}/${id}`, data);
  }

  delete(id: UUID): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}