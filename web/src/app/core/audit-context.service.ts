import { Injectable, inject } from '@angular/core';
import { TokenService } from './auth/token.service';

@Injectable({
  providedIn: 'root'
})
export class AuditContextService {
  private tokenService = inject(TokenService);

  obtenerUsuarioId(): number {

    return 1; 
  }

  estaAutenticado(): boolean {
    return this.tokenService.isValidToken();
  }
}