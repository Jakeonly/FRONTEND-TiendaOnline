import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';

import { DetalleOrdenService } from '../../core/services/detalle-orden.service';
import { DetalleOrdenRead } from '../../models/api.models';

export interface DetalleOrdenDialogData {
  mode: 'create' | 'edit';
  row?: DetalleOrdenRead;
}

@Component({
  selector: 'app-detalle-orden-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
  ],
  templateUrl: './detalle-orden-dialog.html',
})
export class DetalleOrdenDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(DetalleOrdenService);
  private readonly dialogRef = inject(MatDialogRef<DetalleOrdenDialogComponent, boolean>);
  private readonly snack = inject(MatSnackBar);

  readonly data = inject<DetalleOrdenDialogData>(MAT_DIALOG_DATA);

  readonly form = this.fb.nonNullable.group({
    orden_id: ['', Validators.required],
    producto_id: ['', Validators.required],
    cantidad: [1, [Validators.required, Validators.min(1)]],
    precio_unitario: [0, [Validators.required, Validators.min(0)]],
  });

  constructor() {
    if (this.data.mode === 'edit' && this.data.row) {
      this.form.patchValue({
        orden_id: this.data.row.orden_id,
        producto_id: this.data.row.producto_id,
        cantidad: this.data.row.cantidad,
        precio_unitario: this.data.row.precio_unitario,
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
    const payload = { ...v, subtotal: v.cantidad * v.precio_unitario };

    const obs$ = this.data.mode === 'create'
      ? this.service.create(payload)
      : this.service.update(this.data.row!.id, payload);

    obs$.subscribe({
      next: () => this.dialogRef.close(true),
      error: (err: HttpErrorResponse) => {
        this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 });
      },
    });
  }

  private msg(err: HttpErrorResponse): string {
    const d = err.error?.detail;
    if (typeof d === 'string') return d;
    if (Array.isArray(d)) return d.map((x) => x.msg ?? JSON.stringify(x)).join('; ');
    return err.message;
  }
}