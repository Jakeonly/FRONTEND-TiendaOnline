import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { DetalleCarritoService } from '../../core/services/detalle-carrito.service';
import { DetalleCarritoRead, DetalleCarritoUpdate } from '../../models/api.models';

export interface DetalleCarritoDialogData {
  mode: 'create' | 'edit';
  row?: DetalleCarritoRead;
}

@Component({
  selector: 'app-detalle-carrito-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
  ],
  templateUrl: './detalle-carrito-dialog.html',
})
export class DetalleCarritoDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly detalleService = inject(DetalleCarritoService);
  private readonly dialogRef = inject(MatDialogRef<DetalleCarritoDialogComponent, boolean>);
  private readonly snack = inject(MatSnackBar);

  readonly data = inject<DetalleCarritoDialogData>(MAT_DIALOG_DATA);

  readonly form = this.fb.nonNullable.group({
    carrito_id: ['', Validators.required],
    producto_id: ['', Validators.required],
    cantidad: [1, [Validators.required, Validators.min(1)]],
    precio_unitario: [0, [Validators.required, Validators.min(0)]],
  });

  constructor() {
    if (this.data.mode === 'edit' && this.data.row) {
      const r = this.data.row;
      this.form.patchValue({
        carrito_id: r.carrito_id,
        producto_id: r.producto_id,
        cantidad: r.cantidad,
        precio_unitario: r.precio_unitario,
      });

      this.form.controls.carrito_id.disable();
      this.form.controls.producto_id.disable();
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
      this.detalleService.create(v).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err: HttpErrorResponse) => this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
      });
      return;
    }


    const id = this.data.row!.id;
    const body: DetalleCarritoUpdate = {
      cantidad: v.cantidad
    };

    this.detalleService.update(id, body).subscribe({
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