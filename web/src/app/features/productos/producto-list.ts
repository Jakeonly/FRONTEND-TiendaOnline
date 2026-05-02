import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

import { CategoriaService } from '../../core/services/categoria.service';
import { ProductoService } from '../../core/services/producto.service';
import { CategoriaRead, ProductoRead } from '../../models/api.models';
import { ProductoDialogComponent, ProductoDialogData } from './producto-dialog';

@Component({
  selector: 'app-producto-list',
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

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  constructor() {
    this.loadCategorias();
    this.reload();
  }

  categoriaNombre(id: string | null | undefined): string {
    if (!id) return '—';
    return this.categoriasPorId.get(id) ?? '—';
  }

  private loadCategorias(): void {
    this.categoriaSvc.list().subscribe({
      next: (rows: CategoriaRead[]) => {
        this.categoriasPorId.clear();
        rows.forEach((row) => this.categoriasPorId.set(row.id, row.nombre));
      },
      error: (err: HttpErrorResponse) => {
        this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 });
      },
    });
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