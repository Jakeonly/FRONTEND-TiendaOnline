import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export type DemoCompraDecision = 'pay' | 'continue';

export interface DemoCompraConfirmDialogData {
  cantidadProductos: number;
  total: number;
}

@Component({
  selector: 'app-demo-compra-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>¿Qué quieres hacer con este carrito?</h2>

    <mat-dialog-content class="dialog-body">
      <div class="dialog-info">
        <mat-icon>shopping_bag</mat-icon>
        <div>
          <p>Ya tienes {{ data.cantidadProductos }} productos seleccionados.</p>
          <strong>Total estimado: {{ data.total | number:'1.0-0' }}</strong>
        </div>
      </div>
      <p class="dialog-help">Si eliges ir a pagar, se generará el carrito en estado pendiente y pasarás a la pantalla de compra.</p>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button type="button" (click)="seguirComprando()">Seguir comprando</button>
      <button mat-flat-button color="primary" type="button" (click)="irAPagar()">Ir a pagar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-body { padding-top: 4px; }
    .dialog-info {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      padding: 14px;
      border-radius: 16px;
      background: color-mix(in srgb, var(--mat-sys-primary-container) 16%, white);
      margin-bottom: 12px;
    }
    .dialog-info mat-icon {
      color: var(--mat-sys-primary);
      margin-top: 2px;
    }
    .dialog-info p,
    .dialog-help { margin: 0; }
    .dialog-info strong {
      display: block;
      margin-top: 4px;
    }
    .dialog-help {
      color: color-mix(in srgb, var(--mat-sys-on-surface) 68%, transparent);
      line-height: 1.45;
    }
  `],
})
export class DemoCompraConfirmDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<DemoCompraConfirmDialogComponent, DemoCompraDecision | undefined>);
  readonly data = inject<DemoCompraConfirmDialogData>(MAT_DIALOG_DATA);

  seguirComprando(): void {
    this.dialogRef.close('continue');
  }

  irAPagar(): void {
    this.dialogRef.close('pay');
  }
}