import { CommonModule } from '@angular/common';
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
import { MatTooltipModule } from '@angular/material/tooltip';
import { forkJoin } from 'rxjs';
import { filter } from 'rxjs/operators';

import { OrdenService } from '../../core/services/orden.service';
import { OrdenRead, UsuarioRead } from '../../models/api.models';
import { OrdenDialogComponent, OrdenDialogData } from './orden-dialog';
import { shortId } from '../../shared/ids';
import { UsuarioService } from '../../core/services/usuario.service';
import { PricePipe } from '../../shared/price.pipe';

@Component({
  selector: 'app-orden-list',
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
    MatTooltipModule,
    PricePipe,
  ],
  templateUrl: './orden-list.html',
  styleUrl: './orden-list.scss',
})
export class OrdenListComponent implements AfterViewInit {
  private readonly ordenService = inject(OrdenService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);
  readonly shortId = shortId;
  readonly usuariosPorId = new Map<string, string>();

  // Columnas ajustadas a tu dominio real
  readonly displayedColumns = [
    'id',
    'usuario_nombre',
    'total',
    'estado',
    'fecha_creacion',
    'acciones',
  ];
  
  readonly dataSource = new MatTableDataSource<OrdenRead>([]);

  loading = true;

  private paginatorRef?: MatPaginator;
  private sortRef?: MatSort;

  @ViewChild(MatPaginator)
  set paginator(value: MatPaginator | undefined) {
    this.paginatorRef = value;
    this.attachTableHelpers();
  }

  @ViewChild(MatSort)
  set sort(value: MatSort | undefined) {
    this.sortRef = value;
    this.attachTableHelpers();
  }

  ngAfterViewInit(): void {
    this.attachTableHelpers();
  }

  private attachTableHelpers(): void {
    this.dataSource.sortingDataAccessor = (row: any, columnName: string) => {
      switch (columnName) {
        case 'id':
          return row.id ?? '';
        case 'usuario_nombre':
          return this.getUsuarioNombre(row.usuario_id);
        case 'total':
          return this.normalizeTotal(row.total);
        case 'estado':
          return row.estado ?? '';
        case 'fecha_creacion':
          return new Date(row.fecha_creacion ?? 0).getTime();
        default:
          return '';
      }
    };

    if (this.paginatorRef) {
      this.dataSource.paginator = this.paginatorRef;
    }
    if (this.sortRef) {
      this.dataSource.sort = this.sortRef;
    }
  }

  private normalizeTotal(total: unknown): number {
    if (typeof total === 'number') return total;
    if (typeof total === 'string') {
      const normalized = total.replace(/[^\d.-]/g, '');
      const parsed = Number(normalized);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
  }

  constructor() {
    this.reload();
  }

  reload(): void {
    this.loading = true;
    forkJoin({
      ordenes: this.ordenService.list(),
      usuarios: this.usuarioService.list(),
    }).subscribe({
      next: ({ ordenes, usuarios }) => {
        this.usuariosPorId.clear();
        usuarios.forEach((usuario: UsuarioRead) => this.usuariosPorId.set(usuario.id, usuario.nombre_completo));
        this.dataSource.data = ordenes;
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

  editar(row: OrdenRead): void {
    this.openDialog({ mode: 'edit', row });
  }

  copiarId(row: OrdenRead): void {
    const texto = String(row.id ?? '');
    if (!texto) return;

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(texto)
        .then(() => this.snack.open('ID de orden copiado', 'OK', { duration: 2500 }))
        .catch(() => this.snack.open('No se pudo copiar el ID de orden', 'Cerrar', { duration: 4000 }));
      return;
    }

    const textarea = document.createElement('textarea');
    textarea.value = texto;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    try {
      document.execCommand('copy');
      this.snack.open('ID de orden copiado', 'OK', { duration: 2500 });
    } catch {
      this.snack.open('No se pudo copiar el ID de orden', 'Cerrar', { duration: 4000 });
    } finally {
      document.body.removeChild(textarea);
    }
  }

  getUsuarioNombre(usuarioId: string): string {
    return this.usuariosPorId.get(usuarioId) ?? shortId(usuarioId);
  }

  estadoClass(estado: string | null | undefined): string {
    const normalized = this.normalizeEstado(estado);
    if (normalized === 'pagada') return 'pagada';
    if (normalized === 'pendiente') return 'pendiente';
    if (normalized === 'cancelado') return 'cancelado';
    return '';
  }

  estadoLabel(estado: string | null | undefined): string {
    const normalized = this.normalizeEstado(estado);
    if (normalized === 'pagada') return 'Pagada';
    if (normalized === 'pendiente') return 'Pendiente';
    if (normalized === 'cancelado') return 'Cancelada';
    return String(estado ?? '');
  }

  private normalizeEstado(estado: string | null | undefined): string {
    return String(estado ?? '').trim().toLowerCase();
  }

  private openDialog(data: OrdenDialogData): void {
    this.dialog
      .open(OrdenDialogComponent, { width: '520px', data })
      .afterClosed()
      .pipe(filter(Boolean)) // Solo recarga si el diálogo retornó true
      .subscribe(() => this.reload());
  }

  eliminar(row: OrdenRead): void {
    // Usamos el ID corto para el mensaje como el profe
    if (!confirm(`¿Eliminar orden ${shortId(row.id)}?`)) return;
    
    this.ordenService.delete(row.id).subscribe({
      next: () => {
        this.snack.open('Orden eliminada', 'OK', { duration: 3000 });
        this.reload();
      },
      error: (err: HttpErrorResponse) => this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
    });
  }

  /** Lógica de mensajes de error idéntica a la del profe */
  private msg(err: HttpErrorResponse): string {
    const d = err.error?.detail;
    if (typeof d === 'string') return d;
    if (Array.isArray(d)) return d.map((x) => x.msg ?? JSON.stringify(x)).join('; ');
    return err.message;
  }
}