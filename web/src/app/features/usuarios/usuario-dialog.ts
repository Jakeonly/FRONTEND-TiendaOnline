import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';

import { UsuarioService } from '../../core/services/usuario.service';
import { UsuarioRead, UsuarioUpdate } from '../../models/api.models';

export interface UsuarioDialogData {
  mode: 'create' | 'edit';
  row?: UsuarioRead;
}

@Component({
  selector: 'app-usuario-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatSnackBarModule,
  ],
  templateUrl: './usuario-dialog.html',
})
export class UsuarioDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly svc = inject(UsuarioService);
  private readonly dialogRef = inject(MatDialogRef<UsuarioDialogComponent, boolean>);
  private readonly snack = inject(MatSnackBar);

  readonly data = inject<UsuarioDialogData>(MAT_DIALOG_DATA);

  readonly form = this.fb.nonNullable.group({
    nombre_completo: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    contraseña: ['', Validators.minLength(6)],
    telefono: [''],
    direccion: [''],
    es_admin: [false],
    activo: [true],
  });

  constructor() {
    if (this.data.mode === 'edit' && this.data.row) {
      const r = this.data.row;
      this.form.patchValue({
        nombre_completo: r.nombre_completo,
        email: r.email,
        telefono: r.telefono ?? '',
        direccion: r.direccion ?? '',
        es_admin: r.es_admin,
        activo: r.activo,
      });
      // En edición la contraseña es opcional, quitamos requerimiento si existe
      this.form.controls.contraseña.clearValidators();
      this.form.controls.contraseña.updateValueAndValidity();
    } else {
      // En creación la contraseña sí es obligatoria
      this.form.controls.contraseña.setValidators([Validators.required, Validators.minLength(6)]);
    }
  }

  cancel(): void { this.dialogRef.close(false); }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();

    if (this.data.mode === 'create') {
      this.svc.create({
        nombre_completo: v.nombre_completo,
        email: v.email,
        contraseña: v.contraseña,
        telefono: v.telefono || undefined,
        direccion: v.direccion || undefined,
        es_admin: v.es_admin,
      }).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err: HttpErrorResponse) => this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
      });
    } else {
      const id = this.data.row!.id;
      const body: UsuarioUpdate = {
        nombre_completo: v.nombre_completo,
        email: v.email,
        contraseña: v.contraseña || undefined,
        telefono: v.telefono || undefined,
        direccion: v.direccion || undefined,
        es_admin: v.es_admin,
        activo: v.activo,
      };

      this.svc.update(id, body).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err: HttpErrorResponse) => this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
      });
    }
  }

  private msg(err: HttpErrorResponse): string {
    const d = err.error?.detail;
    if (typeof d === 'string') return d;
    if (Array.isArray(d)) return d.map((x: any) => x.msg ?? JSON.stringify(x)).join('; ');
    return err.message;
  }
}