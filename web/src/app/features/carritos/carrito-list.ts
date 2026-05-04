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

import { CarritoService } from '../../core/services/carrito.service';
import { CarritoRead } from '../../models/api.models';
import { CarritoDialogComponent, CarritoDialogData } from './carrito-dialog';
import { shortId } from '../../shared/ids';

@Component({
  selector: 'app-carrito-list',
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
  templateUrl: './carrito-list.html',
  styleUrl: './carrito-list.scss',
})
export class CarritoListComponent implements AfterViewInit {
  private readonly carritoService = inject(CarritoService);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);
  readonly shortId = shortId;

  readonly displayedColumns = ['id', 'usuario_email', 'fecha_creacion', 'acciones'];
  readonly dataSource = new MatTableDataSource<CarritoRead>([]);
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
  this.carritoService.list().subscribe({
    next: (res: any) => {
      console.log('Respuesta RAW del servidor:', res);         // <-- ver estructura real
      console.log('Tipo de res:', typeof res);
      console.log('¿Es array?', Array.isArray(res));
      console.log('res.data:', res?.data);

      // Cubrir los 3 casos posibles
      let rows: any[] = [];
      if (Array.isArray(res)) {
        rows = res;                    // backend retorna lista directa
      } else if (Array.isArray(res?.data)) {
        rows = res.data;               // backend retorna { data: [...] }
      } else if (Array.isArray(res?.items)) {
        rows = res.items;              // backend retorna { items: [...] }
      }

      this.dataSource.data = rows;
      this.loading = false;
    },
    error: (err) => {
      console.error('Error en list():', err);
      this.dataSource.data = [];
      this.loading = false;           // ← también faltaba esto en el error
    }
  });
}

  nuevo(): void {
    this.openDialog({ mode: 'create' });
  }

  editar(row: CarritoRead): void {
    this.openDialog({ mode: 'edit', row });
  }

  private openDialog(data: CarritoDialogData): void {
    this.dialog
      .open(CarritoDialogComponent, { width: '520px', data })
      .afterClosed()
      .pipe(filter(Boolean))
      .subscribe(() => this.reload());
  }

  eliminar(row: CarritoRead): void {
    if (!confirm(`¿Eliminar carrito del usuario ${shortId(row.usuario_id)}?`)) return;
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