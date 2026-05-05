import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

import { DetallePedidoService } from '../../core/services/detalle-pedido.service';
import { DetallePedidoRead } from '../../models/api.models';
import { DetallePedidoDialogComponent, DetallePedidoDialogData } from './detalle-pedido-dialog';
import { shortId } from '../../shared/ids';

@Component({
  selector: 'app-detalle-pedido-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './detalle-pedido-list.html',
  styleUrl: './detalle-pedido-list.scss',
})
export class DetallePedidoListComponent implements AfterViewInit {
  private readonly svc = inject(DetallePedidoService);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);
  readonly shortId = shortId;

  readonly displayedColumns = ['nombre', 'id_pedido', 'id_producto', 'estado', 'acciones'];
  readonly dataSource = new MatTableDataSource<DetallePedidoRead>([]);
  loading = true;

  private paginatorRef?: MatPaginator;
  private sortRef?: MatSort;

  @ViewChild(MatPaginator)
  set paginator(value: MatPaginator | undefined) {
    this.paginatorRef = value;
    if (value) {
      this.attachTableHelpers();
    }
  }

  @ViewChild(MatSort)
  set sort(value: MatSort | undefined) {
    this.sortRef = value;
    if (value) {
      this.attachTableHelpers();
    }
  }

  ngAfterViewInit(): void {
    // Los setters ya configuran los helpers
  }

  private attachTableHelpers(): void {
    if (!this.paginatorRef || !this.sortRef) return;

    this.dataSource.sortingDataAccessor = (row: any, columnName: string) => {
      switch (columnName) {
        case 'nombre':
          return row.nombre ?? '';
        case 'id_pedido':
          return row.id_pedido ?? '';
        case 'id_producto':
          return row.id_producto ?? '';
        case 'estado':
          return row.estado ?? '';
        default:
          return '';
      }
    };

    this.dataSource.paginator = this.paginatorRef;
    this.dataSource.sort = this.sortRef;
  }

  constructor() {
    this.reload();
  }

  reload(): void {
    this.loading = true;
    this.svc.list().subscribe({
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

  editar(row: DetallePedidoRead): void {
    this.openDialog({ mode: 'edit', row });
  }

  private openDialog(data: DetallePedidoDialogData): void {
    this.dialog
      .open(DetallePedidoDialogComponent, { width: '520px', data })
      .afterClosed()
      .pipe(filter(Boolean))
      .subscribe(() => this.reload());
  }

  eliminar(row: DetallePedidoRead): void {
    if (!confirm(`¿Eliminar detalle "${row.nombre}"?`)) return;
    this.svc.delete(row.id_detalle_pedido).subscribe({
      next: () => {
        this.snack.open('Detalle eliminado correctamente', 'OK', { duration: 3000 });
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