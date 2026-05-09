import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';
import { CarritoService } from '../../core/services/carrito.service';
import { DetalleCarritoService } from '../../core/services/detalle-carrito.service';
import { ProductoService } from '../../core/services/producto.service';
import { CarritoRead, ProductoRead, UUID } from '../../models/api.models';
import { PricePipe } from '../../shared/price.pipe';
import {
  DemoCompraConfirmDialogComponent,
  DemoCompraConfirmDialogData,
  DemoCompraDecision,
} from './demo-compra-confirm-dialog';

interface CatalogItemView extends ProductoRead {
  cantidadSeleccionada: number;
}

interface CartSummaryItem {
  productoId: UUID;
  nombre: string;
  precioUnitario: number;
  cantidad: number;
  subtotal: number;
}

@Component({
  selector: 'app-demo-compra',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    PricePipe,
  ],
  templateUrl: './demo-compra.html',
  styleUrl: './demo-compra.scss',
})
export class DemoCompraComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly carritoService = inject(CarritoService);
  private readonly detalleCarritoService = inject(DetalleCarritoService);
  private readonly productoService = inject(ProductoService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly snack = inject(MatSnackBar);

  productos: CatalogItemView[] = [];
  loading = true;
  processing = false;

  ngOnInit(): void {
    this.cargarProductos();
  }

  get usuarioActualId(): string | null {
    return this.authService.getCurrentUser()?.id ?? null;
  }

  get cantidadSeleccionada(): number {
    return this.productos.reduce((total, producto) => total + producto.cantidadSeleccionada, 0);
  }

  get totalSeleccionado(): number {
    return this.carritoResumen.reduce((total, item) => total + item.subtotal, 0);
  }

  get carritoResumen(): CartSummaryItem[] {
    return this.productos
      .filter((producto) => producto.cantidadSeleccionada > 0)
      .map((producto) => ({
        productoId: producto.id,
        nombre: producto.nombre,
        precioUnitario: Number(producto.precio) || 0,
        cantidad: producto.cantidadSeleccionada,
        subtotal: (Number(producto.precio) || 0) * producto.cantidadSeleccionada,
      }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  get carritoVacio(): boolean {
    return this.carritoResumen.length === 0;
  }

  incrementar(producto: CatalogItemView): void {
    if (producto.cantidadSeleccionada >= producto.stock) {
      this.snack.open(`No hay más stock disponible para ${producto.nombre}`, 'Cerrar', { duration: 3000 });
      return;
    }

    producto.cantidadSeleccionada += 1;
  }

  decrementar(producto: CatalogItemView): void {
    if (producto.cantidadSeleccionada <= 0) return;
    producto.cantidadSeleccionada -= 1;
  }

  limpiarCarrito(): void {
    this.productos = this.productos.map((producto) => ({
      ...producto,
      cantidadSeleccionada: 0,
    }));
  }

  async generarCarrito(): Promise<void> {
    if (this.processing) return;

    const usuarioId = this.usuarioActualId;
    if (!usuarioId) {
      this.snack.open('No se pudo identificar el usuario actual', 'Cerrar', { duration: 5000 });
      return;
    }

    if (this.carritoVacio) {
      this.snack.open('Selecciona al menos un producto para generar el carrito', 'Cerrar', { duration: 4000 });
      return;
    }

    const errorStock = this.validarStock();
    if (errorStock) {
      this.snack.open(errorStock, 'Cerrar', { duration: 5000 });
      return;
    }

    const decision = await this.abrirConfirmacion();
    if (decision !== 'pay') {
      return;
    }

    this.processing = true;
    try {
      const carritoCreado: CarritoRead = await firstValueFrom(
        this.carritoService.create({
          usuario_id: usuarioId,
          estado: 'Pendiente',
        }),
      );

      for (const item of this.carritoResumen) {
        await firstValueFrom(
          this.detalleCarritoService.create({
            carrito_id: carritoCreado.id,
            producto_id: item.productoId,
            cantidad: item.cantidad,
            precio_unitario: item.precioUnitario,
          }),
        );
      }

      this.snack.open('Carrito generado correctamente', 'OK', { duration: 4000 });
      this.limpiarCarrito();
      void this.router.navigate(['/app/comprar'], { queryParams: { carritoId: carritoCreado.id } });
    } catch (err: unknown) {
      this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 });
    } finally {
      this.processing = false;
    }
  }

  private async abrirConfirmacion(): Promise<DemoCompraDecision | undefined> {
    const data: DemoCompraConfirmDialogData = {
      cantidadProductos: this.cantidadSeleccionada,
      total: this.totalSeleccionado,
    };

    return firstValueFrom(
      this.dialog
        .open(DemoCompraConfirmDialogComponent, {
          width: '420px',
          data,
          disableClose: true,
        })
        .afterClosed(),
    );
  }

  private cargarProductos(): void {
    this.loading = true;
    this.productoService.list().subscribe({
      next: (productos) => {
        this.productos = productos.map((producto) => ({
          ...producto,
          cantidadSeleccionada: 0,
        }));
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 });
      },
    });
  }

  private validarStock(): string | null {
    for (const item of this.carritoResumen) {
      const producto = this.productos.find((row) => row.id === item.productoId);
      if (!producto) {
        return `El producto ${item.nombre} ya no está disponible`;
      }

      if (item.cantidad > producto.stock) {
        return `El producto ${producto.nombre} no tiene stock suficiente`;
      }
    }

    return null;
  }

  private msg(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const d = err.error?.detail;
      if (typeof d === 'string') return d;
      if (Array.isArray(d)) return d.map((x: any) => x.msg ?? JSON.stringify(x)).join('; ');
      return err.message;
    }

    return err instanceof Error ? err.message : 'No se pudo completar la operación';
  }
}