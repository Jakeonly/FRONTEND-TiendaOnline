import { Injectable, computed, signal, inject } from '@angular/core';
import { TokenService } from './auth/token.service';

@Injectable({ providedIn: 'root' })
export class AuditContextService {
  private tokenService = inject(TokenService);

  private readonly _isAuthenticated = signal<boolean>(!!this.tokenService.getToken());

  readonly isAuthenticated = this._isAuthenticated.asReadonly();

  readonly hasUsuario = computed(() => this._isAuthenticated());

  logIn(): void {
    this._isAuthenticated.set(true);
  }

  clear(): void {
    this.tokenService.removeToken();
    this._isAuthenticated.set(false);
  }
}