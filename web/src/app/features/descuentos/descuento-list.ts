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
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

import { DescuentoService } from '../../core/services/descuento.service';
import { DescuentoRead } from '../../models/api.models';
import { DescuentoDialogComponent, DescuentoDialogData } from './descuento-dialog';
import { PricePipe } from '../../shared/price.pipe';

@Component({
  selector: 'app-descuento-list',
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
    PricePipe,
  ],
  templateUrl: './descuento-list.html',
  styleUrl: './descuento-list.scss',
})
export class DescuentoListComponent implements AfterViewInit {
  private readonly descuentoService = inject(DescuentoService);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);

  readonly displayedColumns = [
    'codigo',
    'porcentaje',
    'monto_fijo',
    'fecha_inicio',
    'fecha_fin',
    'acciones',
  ];
  
  readonly dataSource = new MatTableDataSource<DescuentoRead>([]);
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
        case 'codigo':
          return row.codigo ?? '';
        case 'porcentaje':
          return Number(row.porcentaje) || 0;
        case 'monto_fijo':
          return Number(row.monto_fijo) || 0;
        case 'fecha_inicio':
          return row.fecha_inicio ?? '';
        case 'fecha_fin':
          return row.fecha_fin ?? '';
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
    this.descuentoService.list().subscribe({
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

  editar(row: DescuentoRead): void {
    this.openDialog({ mode: 'edit', row });
  }

  private openDialog(data: DescuentoDialogData): void {
    this.dialog
      .open(DescuentoDialogComponent, { width: '520px', data })
      .afterClosed()
      .pipe(filter(Boolean))
      .subscribe(() => this.reload());
  }

  eliminar(row: DescuentoRead): void {
    if (!confirm(`¿Eliminar el cupón ${row.codigo}?`)) return;
    this.descuentoService.delete(row.id).subscribe({
      next: () => {
        this.snack.open('Descuento eliminado', 'OK', { duration: 3000 });
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