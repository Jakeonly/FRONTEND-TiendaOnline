import { CommonModule } from '@angular/common';
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
import { forkJoin } from 'rxjs';
import { filter } from 'rxjs/operators';

import { CarritoService } from '../../core/services/carrito.service';
import { CarritoRead, UsuarioRead } from '../../models/api.models';
import { CarritoDialogComponent, CarritoDialogData } from './carrito-dialog';
import { shortId } from '../../shared/ids';
import { UsuarioService } from '../../core/services/usuario.service';
import { AuthService } from '../../core/auth/auth.service';
import { createTextAndDateFilterPredicate, serializeSearchState } from '../../shared/table-search';

@Component({
  selector: 'app-carrito-list',
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
  templateUrl: './carrito-list.html',
  styleUrl: './carrito-list.scss',
})
export class CarritoListComponent implements AfterViewInit {
  private readonly carritoService = inject(CarritoService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);
  readonly canManage = this.authService.isAdmin();
  readonly shortId = shortId;
  readonly usuariosPorId = new Map<string, string>();

  readonly displayedColumns = ['id', 'usuario_nombre', 'estado', 'fecha_creacion', 'acciones'];
  readonly dataSource = new MatTableDataSource<CarritoRead>([]);
  loading = true;
  searchOpen = false;
  dateSearchOpen = false;
  searchValue = '';
  selectedDate = '';

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
        case 'usuario_nombre':
          return this.getUsuarioNombre(row.usuario_id);
        case 'estado':
          return row.estado ?? '';
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
    this.dataSource.filterPredicate = createTextAndDateFilterPredicate<CarritoRead>(
      (row) => [row.fecha_creacion],
      (row) => this.buildSearchText(row),
    );
    this.reload();
  }

  filtrarTabla(event: Event): void {
    this.searchValue = (event.target as HTMLInputElement | null)?.value ?? '';
    this.applyFilters();
  }

  filtrarFecha(event: Event): void {
    this.selectedDate = (event.target as HTMLInputElement | null)?.value ?? '';
    this.applyFilters();
  }

  toggleSearch(): void {
    this.searchOpen = !this.searchOpen;
  }

  toggleDateSearch(): void {
    this.dateSearchOpen = !this.dateSearchOpen;
  }

  private applyFilters(): void {
    this.dataSource.filter = serializeSearchState(this.searchValue.trim(), this.selectedDate);
    this.dataSource.paginator?.firstPage();
  }

  reload(): void {
    this.loading = true;
    forkJoin({
      carritos: this.carritoService.list(),
      usuarios: this.usuarioService.list(),
    }).subscribe({
      next: ({ carritos, usuarios }) => {
        this.usuariosPorId.clear();
        usuarios.forEach((usuario: UsuarioRead) =>
          this.usuariosPorId.set(usuario.id, usuario.nombre_completo)
        );
        this.dataSource.data = carritos;
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

  editar(row: CarritoRead): void {
    this.openDialog({ mode: 'edit', row });
  }

  getUsuarioNombre(usuarioId: string): string {
    return this.usuariosPorId.get(usuarioId) ?? shortId(usuarioId);
  }

  private buildSearchText(row: CarritoRead): string {
    return [
      row.id,
      shortId(row.id),
      row.usuario_id,
      shortId(row.usuario_id),
      this.getUsuarioNombre(row.usuario_id),
      row.estado,
    ].join(' ');
  }

  estadoClass(estado: string | null | undefined): string {
    const normalized = String(estado ?? '').trim().toLowerCase();
    if (normalized === 'pagado') return 'pagado';
    if (normalized === 'pendiente') return 'pendiente';
    return '';
  }

  private openDialog(data: CarritoDialogData): void {
    this.dialog
      .open(CarritoDialogComponent, { width: '520px', data })
      .afterClosed()
      .pipe(filter(Boolean))
      .subscribe(() => this.reload());
  }

  eliminar(row: CarritoRead): void {
    if (!confirm(`¿Eliminar carrito del usuario ${this.getUsuarioNombre(row.usuario_id)}?`)) return;
    this.carritoService.delete(row.id).subscribe({
      next: () => {
        this.snack.open('Carrito eliminado', 'OK', { duration: 3000 });
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