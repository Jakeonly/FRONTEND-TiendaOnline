import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  loginData = {
    correo_electronico: '',
    password: ''
  };

  errorMessage = '';

  onLogin() {
    this.authService.login(this.loginData).subscribe({
      next: () => {
        this.router.navigate(['/productos']); // Redirige a la tienda
      },
      error: (err) => {
        this.errorMessage = 'Credenciales incorrectas. Intenta de nuevo.';
      }
    });
  }
}