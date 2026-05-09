import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly loginForm = this.fb.group({
    correo_electronico: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  isSubmitting = false;
  errorMessage = '';
  showPassword = false;

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onLogin() {
    if (this.isSubmitting) return;

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.errorMessage = 'Completa un correo válido y la contraseña antes de iniciar sesión.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const { correo_electronico, password } = this.loginForm.getRawValue();
    const credentials = {
      email: correo_electronico,
      contraseña: password,
    };

    this.authService.login(credentials).subscribe({
      next: () => {
        this.isSubmitting = false;
        void this.router.navigate(['/app/demo-compra']);
      },
      error: (err: HttpErrorResponse) => {
        this.isSubmitting = false;
        this.errorMessage = this.resolveLoginErrorMessage(err);
      }
    });
  }

  private resolveLoginErrorMessage(err: HttpErrorResponse): string {
    const fallbackMessage = 'No se pudo iniciar sesión. Verifica tus datos e inténtalo otra vez.';
    const body = err.error;

    if (typeof body === 'string' && body.trim()) {
      return body;
    }

    if (!body || typeof body !== 'object') {
      return err.message || fallbackMessage;
    }

    const payload = body as Record<string, unknown>;

    const messageCandidates = [
      payload['message'],
      payload['detail'],
      typeof payload['error'] === 'object' && payload['error'] !== null
        ? (payload['error'] as Record<string, unknown>)['message']
        : undefined,
    ];

    for (const candidate of messageCandidates) {
      if (typeof candidate === 'string' && candidate.trim()) {
        return candidate;
      }
    }

    const nestedError = payload['error'];
    if (nestedError && typeof nestedError === 'object') {
      const nested = nestedError as Record<string, unknown>;
      const details = nested['details'];

      if (Array.isArray(details) && details.length > 0) {
        const firstDetail = details[0];
        if (firstDetail && typeof firstDetail === 'object') {
          const detailObject = firstDetail as Record<string, unknown>;
          const detailMessage = detailObject['msg'] ?? detailObject['message'];
          if (typeof detailMessage === 'string' && detailMessage.trim()) {
            return detailMessage;
          }
        }
      }
    }

    return fallbackMessage;
  }
}