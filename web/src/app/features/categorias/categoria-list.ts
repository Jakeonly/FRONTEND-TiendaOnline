import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatNativeDateModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

import { CategoriaService } from '../../core/services/categoria.service';
import { CategoriaRead } from '../../models/api.models';
import { CategoriaDialogComponent, CategoriaDialogData } from './categoria-dialog';
import { AuthService } from '../../core/auth/auth.service';
import { filterByDateRange } from '../../shared/date-range.utils';

@Component({
  selector: 'app-categoria-list',
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './categoria-list.html',
  styleUrl: './categoria-list.scss',
})
export class CategoriaListComponent implements AfterViewInit {
  private readonly svc = inject(CategoriaService);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);
  readonly canManage = this.authService.isAdmin();

  readonly displayedColumns = ['nombre', 'descripcion', 'fecha_creacion', 'acciones'];
  readonly dataSource = new MatTableDataSource<CategoriaRead>([]);
  loading = true;

  private allCategorias: CategoriaRead[] = [];
  private searchValue = '';
  private fechaFiltro: Date | null = null;

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
        case 'descripcion':
          return row.descripcion ?? '';
        case 'fecha_creacion':
          return row.fecha_creacion ?? '';
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

  onDateSelected(fecha: Date | null): void {
    this.fechaFiltro = fecha;
    this.applyFilters();
  }

  onTextSearch(value: string): void {
    this.searchValue = value.trim().toLowerCase();
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = this.fechaFiltro
      ? filterByDateRange(this.allCategorias, this.fechaFiltro, '00:00', '23:59', 'fecha_creacion')
      : [...this.allCategorias];

    if (this.searchValue) {
      filtered = filtered.filter((row) =>
        [row.nombre, row.descripcion, row.fecha_creacion]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(this.searchValue))
      );
    }

    this.dataSource.data = filtered;
    this.dataSource.paginator?.firstPage();
  }

  reload(): void {
    this.loading = true;
    this.svc.list().subscribe({
      next: (rows) => {
        this.allCategorias = rows;
        this.applyFilters();
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

  editar(row: CategoriaRead): void {
    this.openDialog({ mode: 'edit', row });
  }

  private openDialog(data: CategoriaDialogData): void {
    this.dialog
      .open(CategoriaDialogComponent, { width: '480px', data })
      .afterClosed()
      .pipe(filter(Boolean))
      .subscribe(() => this.reload());
  }

  eliminar(row: CategoriaRead): void {
    if (!confirm(`¿Eliminar categoría ${row.nombre}?`)) return;
    this.svc.delete(row.id).subscribe({
      next: () => {
        this.snack.open('Categoría eliminada', 'OK', { duration: 3000 });
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