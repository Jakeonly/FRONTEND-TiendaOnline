import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { DescuentoService } from '../../core/services/descuento.service';
import { DescuentoRead, DescuentoUpdate } from '../../models/api.models';

export interface DescuentoDialogData {
  mode: 'create' | 'edit';
  row?: DescuentoRead;
}

@Component({
  selector: 'app-descuento-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
  ],
  templateUrl: './descuento-dialog.html',
})
export class DescuentoDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly descuentoService = inject(DescuentoService);
  private readonly dialogRef = inject(MatDialogRef<DescuentoDialogComponent, boolean>);
  private readonly snack = inject(MatSnackBar);

  readonly data = inject<DescuentoDialogData>(MAT_DIALOG_DATA);

  readonly form = this.fb.nonNullable.group({
    codigo: ['', Validators.required],
    porcentaje: [0],
    monto_fijo: [0],
    fecha_inicio: ['', Validators.required],
    fecha_fin: ['', Validators.required],
  });

  constructor() {
    if (this.data.mode === 'edit' && this.data.row) {
      const r = this.data.row;
      this.form.patchValue({
        codigo: r.codigo,
        porcentaje: r.porcentaje ?? 0,
        monto_fijo: r.monto_fijo ?? 0,
        fecha_inicio: r.fecha_inicio.split('T')[0], // Ajuste para input date
        fecha_fin: r.fecha_fin.split('T')[0],
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
      this.descuentoService.create(v).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err: HttpErrorResponse) => this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
      });
      return;
    }

    const id = this.data.row!.id;
    const body: DescuentoUpdate = {
      codigo: v.codigo,
      porcentaje: v.porcentaje || undefined,
      monto_fijo: v.monto_fijo || undefined,
      fecha_inicio: v.fecha_inicio,
      fecha_fin: v.fecha_fin
    };

    this.descuentoService.update(id, body).subscribe({
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