import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core'; 
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';


import { AuthService } from '../../core/auth/auth.service';
import { AuditContextService } from '../../core/audit-context.service';

@Component({
  selector: 'app-login',
  standalone: true, 
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly audit = inject(AuditContextService);
  private readonly router = inject(Router);
  private readonly snack = inject(MatSnackBar);

  readonly loading = signal(false); 

  readonly loginForm = this.fb.nonNullable.group({
    nombre_usuario: ['', Validators.required],
    clave: ['', [Validators.required, Validators.minLength(4)]],
  });

  ingresar(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const credenciales = this.loginForm.getRawValue();

    this.authService.login(credenciales).subscribe({
      next: () => {
        this.loading.set(false);
        this.audit.logIn();
        this.snack.open('¡Bienvenido a la Tienda!', 'Cerrar', { duration: 3000 });
        void this.router.navigateByUrl('/'); 
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        const mensaje = err.status === 401 
          ? 'Usuario o contraseña incorrectos' 
          : this.msg(err);
        this.snack.open(mensaje, 'Cerrar', { duration: 5000 });
      },
    });
  }

  private msg(err: HttpErrorResponse): string {
    const d = err.error?.detail;
    if (typeof d === 'string') return d;
    if (Array.isArray(d)) return d.map((x: any) => x.msg ?? JSON.stringify(x)).join('; ');
    return 'Error de conexión con el servidor';
  }
}