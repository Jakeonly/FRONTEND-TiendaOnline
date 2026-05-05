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
import { forkJoin } from 'rxjs';

import { CategoriaService } from '../../core/services/categoria.service';
import { ProductoService } from '../../core/services/producto.service';
import { CategoriaRead, ProductoRead } from '../../models/api.models';
import { ProductoDialogComponent, ProductoDialogData } from './producto-dialog';
import { PricePipe } from '../../shared/price.pipe';

@Component({
  selector: 'app-producto-list',
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
  templateUrl: './producto-list.html',
  styleUrl: './producto-list.scss',
})
export class ProductoListComponent implements AfterViewInit {
  private readonly categoriaSvc = inject(CategoriaService);
  private readonly svc = inject(ProductoService);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);

  readonly displayedColumns = ['nombre', 'descripcion', 'precio', 'stock', 'categoria_id', 'acciones'];
  readonly dataSource = new MatTableDataSource<ProductoRead>([]);
  readonly categoriasPorId = new Map<string, string>();
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
    // No llamar nuevamente aquí, los setters ya lo hacen
  }

  private attachTableHelpers(): void {
    // Solo ejecutar si tenemos ambos referencias
    if (!this.paginatorRef || !this.sortRef) return;

    this.dataSource.sortingDataAccessor = (row: any, columnName: string) => {
      switch (columnName) {
        case 'nombre':
          return row.nombre ?? '';
        case 'descripcion':
          return row.descripcion ?? '';
        case 'precio':
          return Number(row.precio) || 0;
        case 'stock':
          return Number(row.stock) || 0;
        case 'categoria_id':
          return row.categoria_id ?? '';
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
    forkJoin({
      productos: this.svc.list(),
      categorias: this.categoriaSvc.list(),
    }).subscribe({
      next: ({ productos, categorias }) => {
        this.categoriasPorId.clear();
        categorias.forEach((cat: CategoriaRead) => this.categoriasPorId.set(cat.id, cat.nombre));
        this.dataSource.data = productos;
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 });
      },
    });
  }

  categoriaNombre(id: string | null | undefined): string {
    if (!id) return '—';
    return this.categoriasPorId.get(id) ?? '—';
  }

  nuevo(): void {
    this.openDialog({ mode: 'create' });
  }

  editar(row: ProductoRead): void {
    this.openDialog({ mode: 'edit', row });
  }

  private openDialog(data: ProductoDialogData): void {
    this.dialog
      .open(ProductoDialogComponent, { width: '550px', data })
      .afterClosed()
      .pipe(filter(Boolean))
      .subscribe(() => this.reload());
  }

  eliminar(row: ProductoRead): void {
    if (!confirm(`¿Eliminar producto ${row.nombre}?`)) return;
    this.svc.delete(row.id).subscribe({
      next: () => {
        this.snack.open('Producto eliminado', 'OK', { duration: 3000 });
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