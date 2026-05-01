import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

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
  private readonly detalleService = inject(DetalleOrdenService);
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
      const r = this.data.row;
      this.form.patchValue({
        orden_id: r.orden_id,
        producto_id: r.producto_id,
        cantidad: r.cantidad,
        precio_unitario: r.precio_unitario,
      });

      this.form.controls.orden_id.disable();
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
    } else {
      const id = this.data.row!.id;
      this.detalleService.update(id, {
        cantidad: v.cantidad,
        precio_unitario: v.precio_unitario
      }).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err: HttpErrorResponse) => this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
      });
    }
  }

  private msg(err: HttpErrorResponse): string {
    const d = err.error?.detail;
    if (typeof d === 'string') return d;
    if (Array.isArray(d)) return d.map((x) => x.msg ?? JSON.stringify(x)).join('; ');
    return err.message;
  }
}