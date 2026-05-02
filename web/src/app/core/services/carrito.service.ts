import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { CarritoCreate, CarritoRead, CarritoUpdate, UUID } from '../../models/api.models';
import { environment } from '../../../environments/environment'; 
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/carritos`; 


  list(): Observable<CarritoRead[]> {
  return this.http.get<any>(`${this.url}/`).pipe(
    map(response => {
      // Cubre los 3 casos más comunes de respuesta
      if (Array.isArray(response))        return response;           // lista directa
      if (Array.isArray(response?.data))  return response.data;      // { data: [...] }
      if (Array.isArray(response?.items)) return response.items;     // { items: [...] }
      return [];                                                      
    })
  );
}

  create(data: CarritoCreate): Observable<CarritoRead> {
    return this.http.post<any>(`${this.url}/`, data).pipe(
      map(response => response.data as CarritoRead)
    );
  }

  update(id: UUID, data: CarritoUpdate): Observable<CarritoRead> {
    return this.http.put<any>(`${this.url}/${id}`, data).pipe(
      map(response => response.data as CarritoRead)
    );
  }

  delete(id: UUID): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}