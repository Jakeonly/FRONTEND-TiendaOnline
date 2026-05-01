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

import { PedidoService } from '../../core/services/pedido.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { PedidoRead, UsuarioRead, PedidoUpdate } from '../../models/api.models';

export interface PedidoDialogData {
  mode: 'create' | 'edit';
  row?: PedidoRead;
}

@Component({
  selector: 'app-pedido-dialog',
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
  templateUrl: './pedido-dialog.html',
})
export class PedidoDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly svc = inject(PedidoService);
  private readonly usuarioSvc = inject(UsuarioService);
  private readonly dialogRef = inject(MatDialogRef<PedidoDialogComponent, boolean>);
  private readonly snack = inject(MatSnackBar);

  readonly data = inject<PedidoDialogData>(MAT_DIALOG_DATA);
  readonly usuarios = signal<UsuarioRead[]>([]);

  readonly form = this.fb.nonNullable.group({
    id_usuario: ['', Validators.required],
    direccion_envio: ['', Validators.required],
    total_pedido: [0, [Validators.required, Validators.min(0)]],
    estado_pedido: ['procesando'],
  });

  ngOnInit(): void {
    // Cargar usuarios para el select
    this.usuarioSvc.list().subscribe({
      next: (rows) => this.usuarios.set(rows),
      error: (err: HttpErrorResponse) => this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
    });

    if (this.data.mode === 'edit' && this.data.row) {
      const r = this.data.row;
      this.form.patchValue({
        id_usuario: r.id_usuario,
        direccion_envio: r.direccion_envio,
        total_pedido: r.total_pedido,
        estado_pedido: r.estado_pedido,
      });
      this.form.controls.id_usuario.disable();
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
        id_usuario: v.id_usuario,
        direccion_envio: v.direccion_envio,
        total_pedido: v.total_pedido,
        estado_pedido: v.estado_pedido
      }).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err: HttpErrorResponse) => this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
      });
    } else {
      const id = this.data.row!.id_pedido;
      const body: PedidoUpdate = {
        estado_pedido: v.estado_pedido,
        direccion_envio: v.direccion_envio
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