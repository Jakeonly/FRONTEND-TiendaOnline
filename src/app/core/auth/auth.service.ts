import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenService = inject(TokenService);
  

  private readonly apiUrl = `${environment.apiUrl}/usuarios`;


  login(credenciales: { nombre_usuario: string; clave: string }): Observable<any> {

    const payload = { 
      nombre_usuario: credenciales.nombre_usuario, 
      clave: credenciales.clave 
    };

    return this.http.post<any>(`${this.apiUrl}/login`, payload).pipe(
      tap((response) => {

        const token = response.access_token || response.data?.access_token;
        
        if (token) {
          this.tokenService.save(token);
        }
      })
    );
  }


  isLoggedIn(): boolean {
    return this.tokenService.isLogged();
  }


  logout(): void {
    this.tokenService.clear();
  }
}