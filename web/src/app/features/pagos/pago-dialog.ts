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
import { OrdenService } from '../../core/services/orden.service';
import { PagoRead, PagoCreate, PagoUpdate, OrdenRead } from '../../models/api.models';

export interface PagoDialogData {
  mode: 'create' | 'edit';
  row?: any;
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
  private readonly ordenSvc = inject(OrdenService);
  private readonly dialogRef = inject(MatDialogRef<PagoDialogComponent, boolean>);
  private readonly snack = inject(MatSnackBar);

  readonly data = inject<PagoDialogData>(MAT_DIALOG_DATA);
  readonly ordenes = signal<OrdenRead[]>([]);

  readonly form = this.fb.nonNullable.group({
    orden_id: ['', Validators.required],
    monto: [0, [Validators.required, Validators.min(0)]],
    metodo: ['', Validators.required],
    estado: ['pendiente'],
  });

  ngOnInit(): void {
    this.ordenSvc.list().subscribe({
      next: (rows) => this.ordenes.set(rows),
      error: (err: HttpErrorResponse) => this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
    });

    if (this.data.mode === 'edit' && this.data.row) {
      const r: any = this.data.row;
      this.form.patchValue({
        orden_id: r.orden_id,
        monto: r.monto,
        metodo: r.metodo,
        estado: r.estado,
      });
      this.form.controls.orden_id.disable();
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
      const body: PagoCreate = {
        orden_id: v.orden_id,
        monto: v.monto,
        metodo: v.metodo,
        estado: v.estado,
      };

      this.svc.create(body).subscribe({ next: () => this.dialogRef.close(true), error: (err: HttpErrorResponse) => this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }) });
      return;
    }

    const rowAny: any = this.data.row;
    const id = rowAny?.id;
    const body: PagoUpdate = {
      monto: v.monto,
      metodo: v.metodo,
      estado: v.estado,
      orden_id: v.orden_id,
    };

    this.svc.update(id, body).subscribe({ next: () => this.dialogRef.close(true), error: (err: HttpErrorResponse) => this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }) });
  }

  private msg(err: HttpErrorResponse): string {
    const d = err.error?.detail;
    if (typeof d === 'string') return d;
    if (Array.isArray(d)) return d.map((x: any) => x.msg ?? JSON.stringify(x)).join('; ');
    return err.message;
  }
}
