import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { filter } from 'rxjs/operators';

import { DetalleOrdenService } from '../../core/services/detalle-orden.service';
import { DetalleOrdenRead } from '../../models/api.models';
import { DetalleOrdenDialogComponent, DetalleOrdenDialogData } from './detalle-orden-dialog';
import { shortId } from '../../shared/ids';

@Component({
  selector: 'app-detalle-orden-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './detalle-orden-list.html',
  styleUrl: './detalle-orden-list.scss',
})
export class DetalleOrdenListComponent implements AfterViewInit {
  private readonly detalleService = inject(DetalleOrdenService);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);
  readonly shortId = shortId;

  readonly displayedColumns = [
    'id',
    'orden_id',
    'producto_id',
    'cantidad',
    'precio_unitario',
    'subtotal',
    'acciones',
  ];
  
  readonly dataSource = new MatTableDataSource<DetalleOrdenRead>([]);
  loading = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  constructor() {
    this.reload();
  }

  reload(): void {
    this.loading = true;
    this.detalleService.list().subscribe({
      next: (rows) => {
        this.dataSource.data = rows;
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 });
      },
    });
  }

  nuevo(): void {
    this.openDialog({ mode: 'create' });
  }

  editar(row: DetalleOrdenRead): void {
    this.openDialog({ mode: 'edit', row });
  }

  private openDialog(data: DetalleOrdenDialogData): void {
    this.dialog
      .open(DetalleOrdenDialogComponent, { width: '520px', data })
      .afterClosed()
      .pipe(filter(Boolean))
      .subscribe(() => this.reload());
  }

  eliminar(row: DetalleOrdenRead): void {
    if (!confirm(`¿Eliminar este artículo de la orden?`)) return;
    this.detalleService.delete(row.id).subscribe({
      next: () => {
        this.snack.open('Artículo eliminado', 'OK', { duration: 3000 });
        this.reload();
      },
      error: (err: HttpErrorResponse) => this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
    });
  }

  private msg(err: HttpErrorResponse): string {
    const d = err.error?.detail;
    if (typeof d === 'string') return d;
    if (Array.isArray(d)) return d.map((x) => x.msg ?? JSON.stringify(x)).join('; ');
    return err.message;
  }
}