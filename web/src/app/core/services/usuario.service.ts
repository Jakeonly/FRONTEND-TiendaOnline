import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UsuarioRead, UsuarioCreate, UsuarioUpdate, UUID } from '../../models/api.models';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/usuarios`;

  list(): Observable<UsuarioRead[]> {
    return this.http.get<UsuarioRead[]>(this.url);
  }

  get(id: UUID): Observable<UsuarioRead> {
    return this.http.get<UsuarioRead>(`${this.url}/${id}`);
  }

  create(data: UsuarioCreate): Observable<UsuarioRead> {
    return this.http.post<UsuarioRead>(this.url, data);
  }

  update(id: UUID, data: UsuarioUpdate): Observable<UsuarioRead> {
    return this.http.put<UsuarioRead>(`${this.url}/${id}`, data);
  }

  delete(id: UUID): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}