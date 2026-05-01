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

import { PagoService } from '../../core/services/pago.service';
import { PedidoService } from '../../core/services/pedido.service';
import { PagoRead, PedidoRead, PagoUpdate } from '../../models/api.models';

export interface PagoDialogData {
  mode: 'create' | 'edit';
  row?: PagoRead;
}

@Component({
  selector: 'app-pago-dialog',
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
  templateUrl: './pago-dialog.html',
})
export class PagoDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly svc = inject(PagoService);
  private readonly pedidoSvc = inject(PedidoService);
  private readonly dialogRef = inject(MatDialogRef<PagoDialogComponent, boolean>);
  private readonly snack = inject(MatSnackBar);

  readonly data = inject<PagoDialogData>(MAT_DIALOG_DATA);
  readonly pedidos = signal<PedidoRead[]>([]);

  readonly form = this.fb.nonNullable.group({
    id_pedido: ['', Validators.required],
    nombre: ['', Validators.required],
    descripcion: [''],
    monto: [0, [Validators.required, Validators.min(1)]],
    referencia: ['', Validators.required],
    tipo_pago: ['', Validators.required],
    estado: ['pendiente'],
  });

  ngOnInit(): void {
    this.pedidoSvc.list().subscribe({
      next: (rows) => this.pedidos.set(rows),
      error: (err: HttpErrorResponse) => this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
    });

    if (this.data.mode === 'edit' && this.data.row) {
      const r = this.data.row;
      this.form.patchValue({
        id_pedido: r.id_pedido,
        nombre: r.nombre,
        descripcion: r.descripcion ?? '',
        monto: r.monto,
        referencia: r.referencia,
        tipo_pago: r.tipo_pago,
        estado: r.estado,
      });
      this.form.controls.id_pedido.disable();
    }
  }

  cancel(): void { this.dialogRef.close(false); }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();

    if (this.data.mode === 'create') {
      this.svc.create({
        id_pedido: v.id_pedido,
        nombre: v.nombre,
        descripcion: v.descripcion || undefined,
        monto: v.monto,
        referencia: v.referencia,
        tipo_pago: v.tipo_pago,
        estado: v.estado
      }).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err: HttpErrorResponse) => this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
      });
    } else {
      const id = this.data.row!.id_pago;
      const body: PagoUpdate = {
        nombre: v.nombre,
        descripcion: v.descripcion || undefined,
        estado: v.estado,
        referencia: v.referencia
      };

      this.svc.update(id, body).subscribe({
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