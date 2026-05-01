import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { CarritoService } from '../../core/services/carrito.service';
import { CarritoRead, CarritoUpdate } from '../../models/api.models';

export interface CarritoDialogData {
  mode: 'create' | 'edit';
  row?: CarritoRead;
}

@Component({
  selector: 'app-carrito-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
  ],
  templateUrl: './carrito-dialog.html',
})
export class CarritoDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly carritoService = inject(CarritoService);
  private readonly dialogRef = inject(MatDialogRef<CarritoDialogComponent, boolean>);
  private readonly snack = inject(MatSnackBar);

  readonly data = inject<CarritoDialogData>(MAT_DIALOG_DATA);

  readonly form = this.fb.nonNullable.group({
    usuario_id: ['', Validators.required],
  });

  constructor() {
    if (this.data.mode === 'edit' && this.data.row) {
      const r = this.data.row;
      this.form.patchValue({
        usuario_id: r.usuario_id,
      });
    }
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();

    if (this.data.mode === 'create') {
      this.carritoService
        .create({
          usuario_id: v.usuario_id,
        })
        .subscribe({
          next: () => this.dialogRef.close(true),
          error: (err: HttpErrorResponse) => this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
        });
      return;
    }

    const id = this.data.row!.id;
    const body: CarritoUpdate = {
      usuario_id: v.usuario_id,
    };

    this.carritoService.update(id, body).subscribe({
      next: () => this.dialogRef.close(true),
      error: (err: HttpErrorResponse) => this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
    });
  }

  private msg(err: HttpErrorResponse): string {
    const d = err.error?.detail;
    if (typeof d === 'string') return d;
    if (Array.isArray(d)) return d.map((x: any) => x.msg ?? JSON.stringify(x)).join('; ');
    return err.message;
  }
}