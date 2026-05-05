import { CommonModule } from '@angular/common';
import { Component, inject, Inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
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
    MatDialogModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

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
    if (this.loginForm.invalid || this.isSubmitting) return;

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
        void this.router.navigate(['/app/productos']);
      },
      error: (err: HttpErrorResponse) => {
        this.isSubmitting = false;
        const errorMessage = err.error?.message ?? err.error?.detail ?? 'Credenciales incorrectas. Intenta de nuevo.';
        this.showErrorDialog(errorMessage);
      }
    });
  }

  private showErrorDialog(message: string): void {
    this.dialog.open(ErrorDialogComponent, {
      width: '400px',
      disableClose: false,
      data: { message }
    });
  }
}

@Component({
  selector: 'app-error-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule],
  template: `
    <div class="error-dialog">
      <div class="error-header">
        <h2 mat-dialog-title>Error en el inicio de sesión</h2>
      </div>
      <mat-dialog-content>
        <p class="error-message">{{ data.message }}</p>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button (click)="closeDialog()">Cerrar</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .error-dialog {
      padding: 0;
    }
    .error-header h2 {
      color: #d32f2f;
      margin: 0;
    }
    .error-message {
      color: #666;
      line-height: 1.5;
      margin: 16px 0;
    }
  `]
})
export class ErrorDialogComponent {
  private dialogRef = inject(MatDialogRef<ErrorDialogComponent>);

  constructor(@Inject(MAT_DIALOG_DATA) public data: { message: string }) {}

  closeDialog(): void {
    this.dialogRef.close();
  }
}