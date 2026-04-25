import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TokenService {

  private readonly KEY = 'tienda_online_token';
  
  readonly hasToken = signal(this.get() !== null);


  save(token: string): void {
    localStorage.setItem(this.KEY, token);
    this.hasToken.set(true);
  }


  get(): string | null {
    return localStorage.getItem(this.KEY);
  }


  clear(): void {
    localStorage.removeItem(this.KEY);
    this.hasToken.set(false);
  }

  isLogged(): boolean {
    return this.get() !== null;
  }
}