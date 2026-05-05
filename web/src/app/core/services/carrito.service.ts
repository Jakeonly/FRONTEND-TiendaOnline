import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CarritoCreate, CarritoRead, CarritoUpdate, UUID } from '../../models/api.models';

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/carritos`;

  list(): Observable<CarritoRead[]> {
    return this.http.get<CarritoRead[]>(this.url);
  }

  create(data: CarritoCreate): Observable<CarritoRead> {
    return this.http.post<CarritoRead>(this.url, data);
  }

  update(id: UUID, data: CarritoUpdate): Observable<CarritoRead> {
    return this.http.put<CarritoRead>(`${this.url}/${id}`, data);
  }

  delete(id: UUID): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}