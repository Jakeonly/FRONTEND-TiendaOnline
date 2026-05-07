import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

import { DetalleCarritoService } from '../../core/services/detalle-carrito.service';
import { DetalleCarritoRead } from '../../models/api.models';
import { DetalleCarritoDialogComponent, DetalleCarritoDialogData } from './detalle-carrito-dialog';
import { PricePipe } from '../../shared/price.pipe';
import { AuthService } from '../../core/auth/auth.service';
import { createTextFilterPredicate } from '../../shared/table-search';

@Component({
  selector: 'app-detalle-carrito-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    PricePipe,
  ],
  templateUrl: './detalle-carrito-list.html',
  styleUrl: './detalle-carrito-list.scss',
})
export class DetalleCarritoListComponent implements AfterViewInit {
  private readonly detalleService = inject(DetalleCarritoService);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);
  readonly canManage = this.authService.isAdmin();

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
        case 'id':
          return row.id ?? '';
        case 'carrito_id':
          return row.carrito_id ?? '';
        case 'producto_id':
          return row.producto_id ?? '';
        case 'cantidad':
          return Number(row.cantidad) || 0;
        case 'precio_unitario':
          return Number(row.precio_unitario) || 0;
        default:
          return '';
      }
    };

    this.dataSource.paginator = this.paginatorRef;
    this.dataSource.sort = this.sortRef;
  }

  constructor() {
    this.dataSource.filterPredicate = createTextFilterPredicate((row) => this.buildSearchText(row));
    this.reload();
  }

  filtrarTabla(event: Event): void {
    const value = (event.target as HTMLInputElement | null)?.value ?? '';
    this.dataSource.filter = value.trim();
    this.dataSource.paginator?.firstPage();
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
    if (!this.canManage) return;
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

  private buildSearchText(row: DetalleCarritoRead): string {
    return [
      row.id,
      row.carrito_id,
      row.producto_id,
      row.cantidad,
      row.precio_unitario,
    ].join(' ');
  }

  private msg(err: HttpErrorResponse): string {
    const d = err.error?.detail;
    if (typeof d === 'string') return d;
    if (Array.isArray(d)) return d.map((x: any) => x.msg ?? JSON.stringify(x)).join('; ');
    return err.message;
  }
}