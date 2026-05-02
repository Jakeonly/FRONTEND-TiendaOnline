import { CommonModule } from '@angular/common';
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

import { OrdenService } from '../../core/services/orden.service';
import { OrdenRead } from '../../models/api.models';
import { OrdenDialogComponent, OrdenDialogData } from './orden-dialog';
import { shortId } from '../../shared/ids';

@Component({
  selector: 'app-orden-list',
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
  templateUrl: './orden-list.html',
  styleUrl: './orden-list.scss',
})
export class OrdenListComponent implements AfterViewInit {
  private readonly ordenService = inject(OrdenService);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);
  readonly shortId = shortId;

  // Columnas ajustadas a tu dominio real
  readonly displayedColumns = [
    'id',
    'usuario_id',
    'total',
    'estado',
    'fecha_creacion',
    'acciones',
  ];
  
  readonly dataSource = new MatTableDataSource<OrdenRead>([]);

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
    this.ordenService.list().subscribe({
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

  editar(row: OrdenRead): void {
    this.openDialog({ mode: 'edit', row });
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