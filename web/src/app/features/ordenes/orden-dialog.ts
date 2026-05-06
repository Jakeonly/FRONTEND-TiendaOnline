import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { OrdenService } from '../../core/services/orden.service';
import { DescuentoService } from '../../core/services/descuento.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { DescuentoRead, OrdenRead, OrdenUpdate, UsuarioRead } from '../../models/api.models'; 

export interface OrdenDialogData {
  mode: 'create' | 'edit';
  row?: OrdenRead;
}

@Component({
  selector: 'app-orden-dialog',
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
  templateUrl: './orden-dialog.html',
})
export class OrdenDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly ordenService = inject(OrdenService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly descuentoService = inject(DescuentoService);
  private readonly dialogRef = inject(MatDialogRef<OrdenDialogComponent, boolean>);
  private readonly snack = inject(MatSnackBar);

  readonly data = inject<OrdenDialogData>(MAT_DIALOG_DATA);
  readonly usuarios: UsuarioRead[] = [];
  readonly cuponVerificando = false;


  readonly form = this.fb.nonNullable.group({
    usuario_id: ['', Validators.required],
    total: ['', [Validators.required, this.numberValidator.bind(this)]],
    estado: ['Pendiente', Validators.required],
    descuento_codigo: [''],
  });

  constructor() {
    this.usuarioService.list().subscribe({
      next: (rows) => this.usuarios.splice(0, this.usuarios.length, ...rows),
      error: (err: HttpErrorResponse) => this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
    });

    if (this.data.mode === 'edit' && this.data.row) {
      const r = this.data.row;
      this.form.patchValue({
        usuario_id: r.usuario_id,
        total: this.formatNumber(r.total),
        estado: r.estado,
      });
      this.form.controls.usuario_id.disable();

      if (r.descuento_id) {
        this.descuentoService.get(r.descuento_id).subscribe({
          next: (descuento: DescuentoRead) => this.form.patchValue({ descuento_codigo: descuento.codigo }),
          error: (err: HttpErrorResponse) => this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
        });
      }
    }
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  private numberValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const parsed = this.parseNumber(String(control.value));
    return parsed !== null ? null : { invalidNumber: true };
  }

  private formatNumber(value: number | null | undefined): string {
    if (value === null || value === undefined) return '';
    try {
      return new Intl.NumberFormat('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(value);
    } catch {
      return String(value);
    }
  }

  private parseNumber(value: string): number | null {
    if (!value) return null;
    const cleaned = value.replace(/\./g, '').replace(/,/g, '.');
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : null;
  }

  verificarCupon(): void {
    const codigo = this.form.controls.descuento_codigo.value.trim();
    if (!codigo) {
      this.snack.open('Ingresa un código de cupón para verificarlo', 'Cerrar', { duration: 3000 });
      return;
    }

    this.buscarCuponVigentePorCodigo(codigo, (descuento) => {
      this.snack.open(`Cupón válido: ${descuento.codigo}`, 'OK', { duration: 3000 });
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const totalNum = this.parseNumber(String(v.total));

    if (totalNum === null) {
      this.snack.open('Total inválido', 'Cerrar', { duration: 6000 });
      return;
    }

    if (totalNum <= 0) {
      this.snack.open('El total debe ser mayor a 0', 'Cerrar', { duration: 6000 });
      return;
    }

    if (this.data.mode === 'create') {
      const descuentoCodigo = v.descuento_codigo.trim();
      if (!descuentoCodigo) {
        this.ordenService.create({
          usuario_id: v.usuario_id,
          total: totalNum,
          estado: v.estado,
        }).subscribe({
          next: () => this.dialogRef.close(true),
          error: (err: HttpErrorResponse) => this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
        });
        return;
      }

      this.buscarCuponVigentePorCodigo(descuentoCodigo, (descuento) => {
        this.ordenService.create({
          usuario_id: v.usuario_id,
          total: totalNum,
          estado: v.estado,
          descuento_id: descuento.id,
        }).subscribe({
          next: () => this.dialogRef.close(true),
          error: (err: HttpErrorResponse) => this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
        });
      });
      return;
    }


    const id = this.data.row!.id; 
    const descuentoCodigo = v.descuento_codigo.trim();

    if (!descuentoCodigo) {
      const body: OrdenUpdate = {
        total: totalNum,
        estado: v.estado,
      };

      this.ordenService.update(id, body).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err: HttpErrorResponse) => this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
      });
      return;
    }

    this.buscarCuponVigentePorCodigo(descuentoCodigo, (descuento) => {
      const body: OrdenUpdate = {
        total: totalNum,
        estado: v.estado,
        descuento_id: descuento.id,
      };

      this.ordenService.update(id, body).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err: HttpErrorResponse) => this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
      });
    });
  }

  private msg(err: HttpErrorResponse): string {
    const d = err.error?.detail;
    if (typeof d === 'string') return d;
    if (Array.isArray(d)) return d.map((x) => x.msg ?? JSON.stringify(x)).join('; ');
    return err.message;
  }

  private cuponEstaVigente(descuento: DescuentoRead): boolean {
    const ahora = new Date();
    const inicio = new Date(descuento.fecha_inicio);
    const fin = new Date(descuento.fecha_fin);
    return ahora >= inicio && ahora <= fin;
  }

  private buscarCuponVigentePorCodigo(
    codigo: string,
    onFound: (descuento: DescuentoRead) => void,
  ): void {
    this.descuentoService.list().subscribe({
      next: (descuentos) => {
        const descuento = descuentos.find((item) => item.codigo === codigo);
        if (!descuento) {
          this.snack.open(`No se encontró el cupón ${codigo}`, 'Cerrar', { duration: 4000 });
          return;
        }

        if (!this.cuponEstaVigente(descuento)) {
          this.snack.open(`El cupón ${codigo} no está vigente`, 'Cerrar', { duration: 4000 });
          return;
        }

        onFound(descuento);
      },
      error: (err: HttpErrorResponse) => this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
    });
  }
}