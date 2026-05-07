import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { CommonModule } from '@angular/common';
import { MatNativeDateModule } from '@angular/material/core';
import { filterByDateRange } from '../../shared/date-range.utils';

import { PagoService } from '../../core/services/pago.service';
import { shortId } from '../../shared/ids';
import { PagoDialogComponent } from './pago-dialog';
import { PricePipe } from '../../shared/price.pipe';
import { createTextAndDateFilterPredicate, serializeSearchState } from '../../shared/table-search';

@Component({
  selector: 'app-pago-list',
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
    MatTooltipModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    PricePipe,
    MatNativeDateModule
  ],
  templateUrl: './pago-list.html',
  styleUrl: './pago-list.scss',
})
export class PagoListComponent implements AfterViewInit {
  private readonly svc = inject(PagoService);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);
  readonly shortId = shortId;
  private fechaFiltro: Date | null = null;

  readonly displayedColumns = ['id', 'orden_id', 'monto', 'metodo', 'estado', 'fecha', 'acciones'];
  readonly dataSource = new MatTableDataSource<any>([]);
  loading = true;
  searchValue = '';
  
  private allPagos: any[] = [];

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

  constructor() {
    // Configure sorting data accessor BEFORE any data is loaded
    this.dataSource.filterPredicate = createTextAndDateFilterPredicate<any>(
      (row) => [row.fecha_edicion || row.fecha_creacion],
      (row) => this.buildSearchText(row),
    );
    this.dataSource.sortingDataAccessor = (row: any, columnName: string) => {
      const value = row[columnName];
      if (typeof value === 'string') return value.toLowerCase();
      if (typeof value === 'number') return value;
      if (columnName === 'fecha') {
        return new Date(row.fecha_edicion || row.fecha_creacion).getTime();
      }
      return value;
    };
    this.reload();
  }

  ngAfterViewInit(): void {
    this.attachTableHelpers();
  }

  onSortChange(): void {
    this.attachTableHelpers();
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
      ? filterByDateRange(this.allPagos, this.fechaFiltro, '00:00', '23:59', 'fecha_creacion')
      : [...this.allPagos];

    if (this.searchValue) {
      filtered = filtered.filter((row) =>
        [row.id, row.orden_id, row.monto, row.metodo, row.estado, row.fecha_creacion]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(this.searchValue))
      );
    }

    this.dataSource.data = filtered;
    this.dataSource.paginator?.firstPage();
  }

  private attachTableHelpers(): void {
    if (this.paginatorRef) {
      this.dataSource.paginator = this.paginatorRef;
    }
    if (this.sortRef) {
      this.dataSource.sort = this.sortRef;
    }
  }

  reload(): void {
    this.loading = true;
    this.svc.list().subscribe({
      next: (rows) => {
        this.allPagos = rows;
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

  editar(row: any): void {
    this.openDialog({ mode: 'edit', row });
  }

  private buildSearchText(row: any): string {
    return [
      row.id,
      shortId(row.id),
      row.orden_id,
      shortId(row.orden_id),
      row.monto,
      row.metodo,
      row.estado,
    ].join(' ');
  }

  async copiarId(row: any): Promise<void> {
    await this.copiarTexto(shortId(row.id), 'ID copiado al portapapeles', 'No se pudo copiar el ID');
  }

  async copiarOrden(row: any): Promise<void> {
    await this.copiarTexto(shortId(row.orden_id), 'Orden copiada al portapapeles', 'No se pudo copiar la orden');
  }

  private async copiarTexto(texto: string, okMessage: string, errorMessage: string): Promise<void> {
    if (!texto) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(texto);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = texto;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      this.snack.open(okMessage, 'OK', { duration: 2500 });
    } catch {
      this.snack.open(errorMessage, 'Cerrar', { duration: 4000 });
    }
  }

  private openDialog(data: { mode: 'create' | 'edit'; row?: any }): void {
    this.dialog
      .open(PagoDialogComponent, { width: '520px', data })
      .afterClosed()
      .subscribe((ok) => {
        if (ok) this.reload();
      });
  }

  eliminar(row: any): void {
    if (!confirm(`¿Eliminar pago ${shortId(row.id)}?`)) return;
    this.svc.delete(row.id).subscribe({
      next: () => {
        this.snack.open('Pago eliminado', 'OK', { duration: 3000 });
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