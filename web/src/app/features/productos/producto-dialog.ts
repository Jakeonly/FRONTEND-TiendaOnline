import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';

import { ProductoService } from '../../core/services/producto.service';
import { ProductoRead, ProductoUpdate } from '../../models/api.models';

export interface ProductoDialogData {
  mode: 'create' | 'edit';
  row?: ProductoRead;
}

@Component({
  selector: 'app-producto-dialog',
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
  templateUrl: './producto-dialog.html',
})
export class ProductoDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly svc = inject(ProductoService);
  private readonly dialogRef = inject(MatDialogRef<ProductoDialogComponent, boolean>);
  private readonly snack = inject(MatSnackBar);

  readonly data = inject<ProductoDialogData>(MAT_DIALOG_DATA);

  readonly form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    descripcion: [''],
    precio: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    categoria_id: ['', Validators.required],
  });

  constructor() {
    if (this.data.mode === 'edit' && this.data.row) {
      const r = this.data.row;
      this.form.patchValue({
        nombre: r.nombre,
        descripcion: r.descripcion ?? '',
        precio: r.precio,
        stock: r.stock,
        categoria_id: r.categoria_id,
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
      this.svc.create({
        nombre: v.nombre,
        descripcion: v.descripcion || undefined,
        precio: v.precio,
        stock: v.stock,
        categoria_id: v.categoria_id
      }).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err: HttpErrorResponse) => this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
      });
      return;
    }

    const id = this.data.row!.id;
    const body: ProductoUpdate = {
      nombre: v.nombre,
      descripcion: v.descripcion || undefined,
      precio: v.precio,
      stock: v.stock,
      categoria_id: v.categoria_id
    };

    this.svc.update(id, body).subscribe({
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