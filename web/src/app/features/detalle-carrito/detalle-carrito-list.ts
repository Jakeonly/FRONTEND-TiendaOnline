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
import { CommonModule } from '@angular/common';

import { DetalleCarritoService } from '../../core/services/detalle-carrito.service';
import { DetalleCarritoRead } from '../../models/api.models';
import { DetalleCarritoDialogComponent, DetalleCarritoDialogData } from './detalle-carrito-dialog';

@Component({
  selector: 'app-detalle-carrito-list',
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
  templateUrl: './detalle-carrito-list.html',
  styleUrl: './detalle-carrito-list.scss',
})
export class DetalleCarritoListComponent implements AfterViewInit {
  private readonly detalleService = inject(DetalleCarritoService);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);

  readonly displayedColumns = [
    'id',
    'carrito_id',
    'producto_id',
    'cantidad',
    'precio_unitario',
    'acciones',
  ];
  
  readonly dataSource = new MatTableDataSource<DetalleCarritoRead>([]);
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

  editar(row: DetalleCarritoRead): void {
    this.openDialog({ mode: 'edit', row });
  }

  private openDialog(data: DetalleCarritoDialogData): void {
    this.dialog
      .open(DetalleCarritoDialogComponent, { width: '520px', data })
      .afterClosed()
      .pipe(filter(Boolean))
      .subscribe(() => this.reload());
  }

  eliminar(row: DetalleCarritoRead): void {
    if (!confirm('¿Quitar este producto del carrito?')) return;
    this.detalleService.delete(row.id).subscribe({
      next: () => {
        this.snack.open('Producto eliminado del carrito', 'OK', { duration: 3000 });
        this.reload();
      },
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