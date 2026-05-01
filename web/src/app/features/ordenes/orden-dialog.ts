import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { OrdenService } from '../../core/services/orden.service';
import { OrdenRead, OrdenUpdate } from '../../models/api.models'; 

export interface OrdenDialogData {
  mode: 'create' | 'edit';
  row?: OrdenRead;
}

@Component({
  selector: 'app-orden-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
  ],
  templateUrl: './orden-dialog.html',
})
export class OrdenDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly ordenService = inject(OrdenService);
  private readonly dialogRef = inject(MatDialogRef<OrdenDialogComponent, boolean>);
  private readonly snack = inject(MatSnackBar);

  readonly data = inject<OrdenDialogData>(MAT_DIALOG_DATA);


  readonly form = this.fb.nonNullable.group({
    usuario_id: ['', Validators.required],
    total: [0, [Validators.required, Validators.min(0)]],
    estado: ['pendiente', Validators.required],
    descuento_id: [''],
  });

  constructor() {
    if (this.data.mode === 'edit' && this.data.row) {
      const r = this.data.row;
      this.form.patchValue({
        usuario_id: r.usuario_id,
        total: r.total,
        estado: r.estado,
        descuento_id: r.descuento_id ?? '',
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
      this.ordenService.create({
        usuario_id: v.usuario_id,
        total: v.total,
        estado: v.estado,
        descuento_id: v.descuento_id || undefined, 
      }).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err: HttpErrorResponse) => this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
      });
      return;
    }


    const id = this.data.row!.id; 
    const body: OrdenUpdate = {
      total: v.total,
      estado: v.estado,
    };

    this.ordenService.update(id, body).subscribe({
      next: () => this.dialogRef.close(true),
      error: (err: HttpErrorResponse) => this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
    });
  }

  private msg(err: HttpErrorResponse): string {
    const d = err.error?.detail;
    if (typeof d === 'string') return d;
    if (Array.isArray(d)) return d.map((x) => x.msg ?? JSON.stringify(x)).join('; ');
    return err.message;
  }
}