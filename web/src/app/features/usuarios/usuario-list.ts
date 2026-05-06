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
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

import { UsuarioService } from '../../core/services/usuario.service';
import { UsuarioRead } from '../../models/api.models';
import { UsuarioDialogComponent, UsuarioDialogData } from './usuario-dialog';
import { createTextFilterPredicate } from '../../shared/table-search';

@Component({
  selector: 'app-usuario-list',
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
  ],
  templateUrl: './usuario-list.html',
  styleUrl: './usuario-list.scss',
})
export class UsuarioListComponent implements AfterViewInit {
  private readonly svc = inject(UsuarioService);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);

  readonly displayedColumns = ['nombre_completo', 'email', 'rol', 'estado', 'acciones'];
  readonly dataSource = new MatTableDataSource<UsuarioRead>([]);
  loading = true;
  searchOpen = false;

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
        case 'nombre_completo':
          return row.nombre_completo ?? '';
        case 'email':
          return row.email ?? '';
        case 'rol':
          return row.es_admin ? 'Administrador' : 'Cliente';
        case 'estado':
          return row.activo ? 'Activo' : 'Inactivo';
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

  toggleSearch(): void {
    this.searchOpen = !this.searchOpen;
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

  nuevo(): void { this.openDialog({ mode: 'create' }); }

  editar(row: UsuarioRead): void { this.openDialog({ mode: 'edit', row }); }

  private openDialog(data: UsuarioDialogData): void {
    this.dialog
      .open(UsuarioDialogComponent, { width: '550px', data })
      .afterClosed()
      .pipe(filter(Boolean))
      .subscribe(() => this.reload());
  }

  eliminar(row: UsuarioRead): void {
    if (!confirm(`¿Eliminar al usuario ${row.nombre_completo}?`)) return;
    this.svc.delete(row.id).subscribe({
      next: () => {
        this.snack.open('Usuario eliminado', 'OK', { duration: 3000 });
        this.reload();
      },
      error: (err: HttpErrorResponse) => this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
    });
  }

  private buildSearchText(row: UsuarioRead): string {
    return [
      row.id,
      row.nombre_completo,
      row.email,
      row.es_admin ? 'administrador' : 'cliente',
      row.activo ? 'activo' : 'inactivo',
    ].join(' ');
  }

  private msg(err: HttpErrorResponse): string {
    const d = err.error?.detail;
    if (typeof d === 'string') return d;
    if (Array.isArray(d)) return d.map((x: any) => x.msg ?? JSON.stringify(x)).join('; ');
    return err.message;
  }
}