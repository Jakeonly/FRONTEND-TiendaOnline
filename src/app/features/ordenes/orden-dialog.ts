import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { OrdenService } from '../../core/services/orden.service';
import { OrdenRead } from '../../models/api.models';

export interface OrdenDialogData {
  mode: 'create' | 'edit';
  row?: OrdenRead;
}

@Component({
  selector: 'app-orden-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatSnackBarModule,
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
    usuario_id: ['', Validators.required], // UUID
    descuento_id: [null as string | null], // UUID opcional
    total: [0, [Validators.required, Validators.min(0)]],
    estado: ['pendiente', Validators.required],
  });

  constructor() {
    if (this.data.mode === 'edit' && this.data.row) {
      this.form.patchValue({
        usuario_id: this.data.row.usuario_id,
        descuento_id: this.data.row.descuento_id,
        total: this.data.row.total,
        estado: this.data.row.estado
      });
    }
  }

  cancel(): void { this.dialogRef.close(false); }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    
    const v = this.form.getRawValue();
    const obs$ = this.data.mode === 'create' 
      ? this.ordenService.create(v)
      : this.ordenService.update(this.data.row!.id, v); 

    obs$.subscribe({
      next: () => this.dialogRef.close(true),
      error: (err: HttpErrorResponse) => {
        this.snack.open(err.error?.detail || 'Error al guardar', 'Cerrar', { duration: 5000 });
      }
    });
  }
}