import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ComprarConfirmDialogData {
  title: string;
  message: string;
  confirmText: string;
  cancelText?: string;
  icon?: string;
}

@Component({
  selector: 'app-comprar-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>

    <mat-dialog-content class="dialog-body">
      <div class="dialog-box" [class.dialog-box--delete]="data.icon === 'delete_forever'">
        <mat-icon>{{ data.icon ?? 'help_outline' }}</mat-icon>
        <p>{{ data.message }}</p>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button type="button" (click)="cancel()">{{ data.cancelText ?? 'Cancelar' }}</button>
      <button mat-flat-button color="primary" type="button" (click)="confirm()">{{ data.confirmText }}</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-body {
      padding-top: 4px;
    }

    .dialog-box {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      padding: 16px;
      border-radius: 16px;
      background: color-mix(in srgb, var(--mat-sys-primary-container) 16%, white);
    }

    .dialog-box mat-icon {
      color: var(--mat-sys-primary);
      margin-top: 2px;
    }

    .dialog-box--delete mat-icon {
      margin-left: -10px;
      margin-top: 0;
      align-self: center;
    }

    .dialog-box p {
      margin: 0;
      line-height: 1.5;
    }
  `],
})
export class ComprarConfirmDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ComprarConfirmDialogComponent, boolean>);
  readonly data = inject<ComprarConfirmDialogData>(MAT_DIALOG_DATA);

  cancel(): void {
    this.dialogRef.close(false);
  }

  confirm(): void {
    this.dialogRef.close(true);
  }
}