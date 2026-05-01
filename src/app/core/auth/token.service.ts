import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TokenService {

  private readonly KEY = 'tienda_online_token';
  
  readonly hasToken = signal(this.getToken() !== null);


  save(token: string): void {
    localStorage.setItem(this.KEY, token);
    this.hasToken.set(true);
  }


  getToken(): string | null { 
  return localStorage.getItem(this.KEY);
  }


  removeToken(): void { 
  localStorage.removeItem(this.KEY);
  this.hasToken.set(false);
}

  isLogged(): boolean {
    return this.getToken() !== null;
  }
}