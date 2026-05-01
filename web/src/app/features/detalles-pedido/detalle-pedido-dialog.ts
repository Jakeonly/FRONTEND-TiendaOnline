import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';

import { DetallePedidoService } from '../../core/services/detalle-pedido.service';
import { PedidoService } from '../../core/services/pedido.service';
import { ProductoService } from '../../core/services/producto.service';
import { DetallePedidoRead, PedidoRead, ProductoRead } from '../../models/api.models';

export interface DetallePedidoDialogData {
  mode: 'create' | 'edit';
  row?: DetallePedidoRead;
}

@Component({
  selector: 'app-detalle-pedido-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
  ],
  templateUrl: './detalle-pedido-dialog.html',
})
export class DetallePedidoDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly svc = inject(DetallePedidoService);
  private readonly pedidoSvc = inject(PedidoService);
  private readonly productoSvc = inject(ProductoService);
  private readonly dialogRef = inject(MatDialogRef<DetallePedidoDialogComponent, boolean>);
  private readonly snack = inject(MatSnackBar);

  readonly data = inject<DetallePedidoDialogData>(MAT_DIALOG_DATA);

  readonly pedidos = signal<PedidoRead[]>([]);
  readonly productos = signal<ProductoRead[]>([]);

  readonly form = this.fb.nonNullable.group({
    id_pedido: ['', Validators.required],
    id_producto: ['', Validators.required],
    nombre: ['', Validators.required],
    descripcion: [''],
    estado: [''],
  });

  ngOnInit(): void {

    this.pedidoSvc.list().subscribe({
      next: (rows) => this.pedidos.set(rows),
      error: (err: HttpErrorResponse) => this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
    });
    this.productoSvc.list().subscribe({
      next: (rows) => this.productos.set(rows),
      error: (err: HttpErrorResponse) => this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
    });

    if (this.data.mode === 'edit' && this.data.row) {
      const r = this.data.row;
      this.form.patchValue({
        id_pedido: r.id_pedido,
        id_producto: r.id_producto,
        nombre: r.nombre,
        descripcion: r.descripcion ?? '',
        estado: r.estado ?? '',
      });
  
      this.form.controls.id_pedido.disable();
      this.form.controls.id_producto.disable();
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
        id_pedido: v.id_pedido,
        id_producto: v.id_producto,
        nombre: v.nombre,
        descripcion: v.descripcion || undefined,
        estado: v.estado || undefined,
      }).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err: HttpErrorResponse) => this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
      });
    } else {

      const id = this.data.row!.id_detalle_pedido;
      this.svc.update(id, {
        nombre: v.nombre,
        descripcion: v.descripcion || undefined,
        estado: v.estado || undefined,
      }).subscribe({
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