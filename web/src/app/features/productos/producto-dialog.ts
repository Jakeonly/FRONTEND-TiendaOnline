import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';

import { CategoriaService } from '../../core/services/categoria.service';
import { ProductoService } from '../../core/services/producto.service';
import { CategoriaRead, ProductoRead, ProductoUpdate } from '../../models/api.models';

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
    MatSelectModule,
    MatInputModule,
    MatSnackBarModule,
  ],
  templateUrl: './producto-dialog.html',
})
export class ProductoDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly categoriaSvc = inject(CategoriaService);
  private readonly svc = inject(ProductoService);
  private readonly dialogRef = inject(MatDialogRef<ProductoDialogComponent, boolean>);
  private readonly snack = inject(MatSnackBar);

  readonly data = inject<ProductoDialogData>(MAT_DIALOG_DATA);
  readonly categorias: CategoriaRead[] = [];

  readonly form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    descripcion: [''],
    precio: ['', Validators.required],
    stock: ['', Validators.required],
    categoria_id: ['', Validators.required],
  });

  constructor() {
    this.loadCategorias();

    if (this.data.mode === 'edit' && this.data.row) {
      const r = this.data.row;
      this.form.patchValue({
        nombre: r.nombre,
        descripcion: r.descripcion ?? '',
        precio: this.formatNumber(r.precio),
        stock: this.formatNumber(r.stock, 0),
        categoria_id: r.categoria_id,
      });
    }
  }

  private formatNumber(value: number | null | undefined, minFrac = 0): string {
    if (value === null || value === undefined) return '';
    try {
      return new Intl.NumberFormat('es-ES', { minimumFractionDigits: minFrac, maximumFractionDigits: 2 }).format(value);
    } catch {
      return String(value);
    }
  }

  private parseNumber(value: string): number | null {
    if (!value) return null;
    // remove thousands separator dots, replace decimal comma with dot
    const cleaned = value.replace(/\./g, '').replace(/,/g, '.');
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : null;
  }

  private loadCategorias(): void {
    this.categoriaSvc.list().subscribe({
      next: (rows: CategoriaRead[]) => {
        this.categorias.splice(0, this.categorias.length, ...rows);
      },
      error: (err: HttpErrorResponse) => this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
    });
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  save(): void {
    const raw = this.form.getRawValue();

    const precioNum = this.parseNumber(raw.precio);
    const stockNum = this.parseNumber(raw.stock);

    if (precioNum === null || stockNum === null) {
      this.snack.open('Precio o stock inválido', 'Cerrar', { duration: 6000 });
      return;
    }

    if (precioNum < 0 || stockNum < 0) {
      this.snack.open('Precio y stock deben ser >= 0', 'Cerrar', { duration: 6000 });
      return;
    }

    const payload = {
      nombre: raw.nombre,
      descripcion: raw.descripcion || undefined,
      precio: precioNum,
      stock: Math.trunc(stockNum),
      categoria_id: raw.categoria_id,
    } as ProductoUpdate;

    if (this.data.mode === 'create') {
      this.svc.create(payload as any).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err: HttpErrorResponse) => this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
      });
      return;
    }

    const id = this.data.row!.id;
    this.svc.update(id, payload).subscribe({
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