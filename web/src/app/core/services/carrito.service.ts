import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CarritoCreate, CarritoRead, CarritoUpdate, UUID } from '../../models/api.models';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/carritos`;

  list(): Observable<CarritoRead[]> {
    return this.http.get<any>(this.url).pipe(
      map((response: any) => {
        // Soporta distintas formas de payload de listados.
        const raw =
          Array.isArray(response) ? response :
          Array.isArray(response?.data) ? response.data :
          Array.isArray(response?.items) ? response.items :
          Array.isArray(response?.carritos) ? response.carritos :
          [];

        return raw as CarritoRead[];
      }),
    );
  }

  create(data: CarritoCreate): Observable<CarritoRead> {
    return this.http.post<any>(`${this.url}/`, data).pipe(
      map((response: any) => response as CarritoRead),
    );
  }

  update(id: UUID, data: CarritoUpdate): Observable<CarritoRead> {
    return this.http.put<any>(`${this.url}/${id}`, data).pipe(
      map((response: any) => response as CarritoRead),
    );
  }

  delete(id: UUID): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}