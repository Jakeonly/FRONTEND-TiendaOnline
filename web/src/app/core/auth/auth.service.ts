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
  user?: {
    id: string;
    es_admin: boolean;
    email?: string;
    nombre?: string;
    rol?: string;
  };
  id_usuario?: string;
  es_admin?: boolean;
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
          const userId = response.user?.id ?? response.id_usuario;
          const isAdmin = response.user?.es_admin ?? response.es_admin ?? false;
          this.currentUser = {
            id: userId ?? '',
            es_admin: isAdmin,
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
    if (this.currentUser) {
      return this.currentUser;
    }

    const token = this.tokenService.getToken();
    if (!token) {
      return null;
    }

    const payload = this.decodeJwtPayload(token);
    const subject = typeof payload?.['sub'] === 'string' ? payload['sub'] : null;
    if (!subject) {
      return null;
    }

    this.currentUser = {
      id: subject,
      es_admin: payload?.['es_admin'] === true,
    };

    return this.currentUser;
  }

  isAdmin(): boolean {
    return this.getCurrentUser()?.es_admin === true;
  }

  private decodeJwtPayload(token: string): Record<string, unknown> | null {
    const parts = token.split('.');
    if (parts.length < 2) return null;

    try {
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
      const json = atob(padded);
      return JSON.parse(json) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
}