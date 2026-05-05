import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenService } from './token.service';
import { Router } from '@angular/router';

interface LoginPayload {
  access_token: string;
  token_type: string;
  expires_in: number;
  id_usuario: string;
  email: string;
  es_admin: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private tokenService = inject(TokenService);
  private router = inject(Router);
  private apiUrl = `${environment.apiUrl}/usuarios`;
  
  private currentUser: { id: string; es_admin: boolean } | null = null;

  login(credentials: { email: string; contraseña: string }): Observable<LoginPayload> {
    // apiErrorInterceptor desempaqueta ApiResponse y deja solo body.data
    return this.http.post<LoginPayload>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        const token = response?.access_token;
        if (token) {
          this.tokenService.setToken(token);
          this.currentUser = {
            id: response.id_usuario,
            es_admin: response.es_admin,
          };
        }
      })
    );
  }

  logout(): void {
    this.tokenService.removeToken();
    this.currentUser = null;
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.tokenService.isValidToken();
  }

  getCurrentUser(): { id: string; es_admin: boolean } | null {
    return this.currentUser;
  }
}