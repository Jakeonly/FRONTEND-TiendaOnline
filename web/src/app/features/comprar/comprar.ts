import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { firstValueFrom, forkJoin } from 'rxjs';

import { CarritoService } from '../../core/services/carrito.service';
import { DetalleCarritoService } from '../../core/services/detalle-carrito.service';
import { DetalleOrdenService } from '../../core/services/detalle-orden.service';
import { DescuentoService } from '../../core/services/descuento.service';
import { OrdenService } from '../../core/services/orden.service';
import { PagoService } from '../../core/services/pago.service';
import { ProductoService } from '../../core/services/producto.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { AuthService } from '../../core/auth/auth.service';
import {
  CarritoRead,
  DetalleCarritoRead,
  DescuentoRead,
  OrdenCreate,
  PagoCreate,
  ProductoRead,
  UUID,
  UsuarioRead,
} from '../../models/api.models';
import { shortId } from '../../shared/ids';
import { PricePipe } from '../../shared/price.pipe';

interface PurchaseItemView {
  carritoId: UUID;
  productoId: UUID;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

@Component({
  selector: 'app-comprar',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTableModule,
    PricePipe,
  ],
  templateUrl: './comprar.html',
  styleUrl: './comprar.scss',
})
export class ComprarComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly carritoService = inject(CarritoService);
  private readonly detalleCarritoService = inject(DetalleCarritoService);
  private readonly detalleOrdenService = inject(DetalleOrdenService);
  private readonly descuentoService = inject(DescuentoService);
  private readonly ordenService = inject(OrdenService);
  private readonly pagoService = inject(PagoService);
  private readonly productoService = inject(ProductoService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly authService = inject(AuthService);
  private readonly snack = inject(MatSnackBar);

  readonly shortId = shortId;
  readonly displayedColumns = ['producto', 'cantidad', 'precio_unitario', 'subtotal'];

  readonly form = this.fb.nonNullable.group({
    carrito_id: ['', Validators.required],
    descuento_codigo: [''],
    metodo_pago: ['Efectivo', Validators.required],
    registrar_pago: [true],
  });

  carritos: CarritoRead[] = [];
  usuarios: UsuarioRead[] = [];
  productos: ProductoRead[] = [];
  descuentos: DescuentoRead[] = [];
  items: PurchaseItemView[] = [];
  loading = true;
  processing = false;
  mensajeCupon = '';

  private readonly usuariosPorId = new Map<string, string>();
  private readonly productosPorId = new Map<string, ProductoRead>();

  ngOnInit(): void {
    this.form.controls.carrito_id.valueChanges.subscribe((carritoId) => {
      void this.cargarDetalleCarrito(carritoId);
    });

    this.cargarCatalogos();
  }

  get carritoSeleccionado(): CarritoRead | undefined {
    const carritoId = this.form.controls.carrito_id.value;
    return this.carritos.find((item) => item.id === carritoId);
  }

  get carritosPendientes(): CarritoRead[] {
    return this.carritos.filter((carrito) => this.esEstadoPendiente(carrito.estado));
  }

  get totalBruto(): number {
    return this.items.reduce((acumulado, item) => acumulado + item.subtotal, 0);
  }

  get cantidadArticulos(): number {
    return this.items.reduce((acumulado, item) => acumulado + item.cantidad, 0);
  }

  get tieneItems(): boolean {
    return this.items.length > 0;
  }

  get nombreCarrito(): string {
    const carrito = this.carritoSeleccionado;
    if (!carrito) return 'Sin carrito seleccionado';
    return `${shortId(carrito.id)} · ${this.getUsuarioNombre(carrito.usuario_id)}`;
  }

  private cargarCatalogos(): void {
    this.loading = true;
    forkJoin({
      carritos: this.carritoService.list(),
      usuarios: this.usuarioService.list(),
      productos: this.productoService.list(),
      descuentos: this.descuentoService.list(),
    }).subscribe({
      next: ({ carritos, usuarios, productos, descuentos }) => {
        // Mostrar solo carritos del usuario actual y pendientes de pago.
        const usuarioActual = this.authService.getCurrentUser();
        this.carritos = carritos.filter(
          (carrito) =>
            this.esEstadoPendiente(carrito.estado) &&
            !!usuarioActual &&
            carrito.usuario_id === usuarioActual.id,
        );
        this.usuarios = usuarios;
        this.productos = productos;
        this.descuentos = descuentos;

        this.usuariosPorId.clear();
        usuarios.forEach((usuario) => this.usuariosPorId.set(usuario.id, usuario.nombre_completo));

        this.productosPorId.clear();
        productos.forEach((producto) => this.productosPorId.set(producto.id, producto));

        if (this.carritos.length > 0) {
          this.form.controls.carrito_id.setValue(this.carritos[0].id);
        } else {
          this.items = [];
          this.loading = false;
        }
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 });
      },
    });
  }

  private cargarDetalleCarrito(carritoId: UUID | '' | null | undefined): void {
    if (!carritoId) {
      this.items = [];
      this.mensajeCupon = '';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.detalleCarritoService.listByCarrito(carritoId).subscribe({
      next: (detalles) => {
        this.items = detalles
          .map((detalle) => {
            const producto = this.productosPorId.get(detalle.producto_id);
            const productoNombre = producto?.nombre ?? this.shortId(detalle.producto_id);
            const precioUnitario = Number(detalle.precio_unitario) || 0;
            const cantidad = Number(detalle.cantidad) || 0;
            return {
              carritoId: detalle.carrito_id,
              productoId: detalle.producto_id,
              productoNombre,
              cantidad,
              precioUnitario,
              subtotal: cantidad * precioUnitario,
            };
          })
          .sort((a, b) => a.productoNombre.localeCompare(b.productoNombre));
        this.mensajeCupon = '';
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.items = [];
        this.loading = false;
        this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 });
      },
    });
  }

  async verificarCupon(): Promise<void> {
    const codigo = this.form.controls.descuento_codigo.value.trim();
    if (!codigo) {
      this.mensajeCupon = '';
      this.snack.open('Ingresa un código de cupón para verificarlo', 'Cerrar', { duration: 3000 });
      return;
    }

    const descuento = this.buscarCuponVigentePorCodigo(codigo);
    if (!descuento) {
      this.mensajeCupon = `El cupón ${codigo} no está vigente o no existe`;
      this.snack.open(this.mensajeCupon, 'Cerrar', { duration: 4000 });
      return;
    }

    this.mensajeCupon = `Cupón válido: ${descuento.codigo}`;
    this.snack.open(this.mensajeCupon, 'OK', { duration: 3000 });
  }

  async procesarCompra(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.carritoSeleccionado) {
      this.snack.open('Selecciona un carrito para continuar', 'Cerrar', { duration: 4000 });
      return;
    }

    if (!this.items.length) {
      this.snack.open('El carrito no tiene productos para comprar', 'Cerrar', { duration: 4000 });
      return;
    }

    const stockError = this.validarStockDisponibles();
    if (stockError) {
      this.snack.open(stockError, 'Cerrar', { duration: 5000 });
      return;
    }

    const total = this.totalBruto;
    if (total <= 0) {
      this.snack.open('El total de la compra debe ser mayor a 0', 'Cerrar', { duration: 4000 });
      return;
    }

    const descuentoCodigo = this.form.controls.descuento_codigo.value.trim();
    const descuento = descuentoCodigo ? this.buscarCuponVigentePorCodigo(descuentoCodigo) : null;
    if (descuentoCodigo && !descuento) {
      this.snack.open(`El cupón ${descuentoCodigo} no está vigente o no existe`, 'Cerrar', { duration: 5000 });
      return;
    }

    const registrarPago = this.form.controls.registrar_pago.value;
    this.processing = true;

    try {
      const ordenPayload: OrdenCreate = {
        usuario_id: this.carritoSeleccionado.usuario_id,
        total,
        estado: 'Pendiente',
        descuento_id: descuento?.id,
      };

      const ordenCreada = await firstValueFrom(this.ordenService.create(ordenPayload));

      for (const item of this.items) {
        await firstValueFrom(
          this.detalleOrdenService.create({
            orden_id: ordenCreada.id,
            producto_id: item.productoId,
            cantidad: item.cantidad,
            precio_unitario: item.precioUnitario,
            subtotal: item.subtotal,
          } as any),
        );
      }

      if (registrarPago) {
        const pagoPayload: PagoCreate = {
          orden_id: ordenCreada.id,
          monto: Number(ordenCreada.total),
          metodo: this.form.controls.metodo_pago.value,
          estado: 'Pagada',
        };

        await firstValueFrom(this.pagoService.create(pagoPayload));
        await firstValueFrom(this.ordenService.update(ordenCreada.id, { estado: 'Pagada' }));
        await firstValueFrom(this.carritoService.update(this.carritoSeleccionado.id, { estado: 'Pagado' }));
      }

      this.snack.open('Compra registrada correctamente', 'OK', { duration: 4000 });
      this.form.patchValue({
        descuento_codigo: '',
        metodo_pago: 'Efectivo',
        registrar_pago: true,
      });
      this.mensajeCupon = '';
      void this.cargarDetalleCarrito(this.form.controls.carrito_id.value);
    } catch (err: unknown) {
      if (err instanceof HttpErrorResponse) {
        this.snack.open(this.msg(err), 'Cerrar', { duration: 7000 });
      } else {
        const message = err instanceof Error ? err.message : 'No se pudo completar la compra';
        this.snack.open(message, 'Cerrar', { duration: 7000 });
      }
    } finally {
      this.processing = false;
    }
  }

  limpiarCupon(): void {
    this.form.controls.descuento_codigo.setValue('');
    this.mensajeCupon = '';
  }

  subtotalItem(item: PurchaseItemView): number {
    return item.subtotal;
  }

  getUsuarioNombre(usuarioId: string): string {
    return this.usuariosPorId.get(usuarioId) ?? this.shortId(usuarioId);
  }

  getProductoNombre(productoId: string): string {
    return this.productosPorId.get(productoId)?.nombre ?? this.shortId(productoId);
  }

  private validarStockDisponibles(): string | null {
    for (const item of this.items) {
      const producto = this.productosPorId.get(item.productoId);
      if (!producto) {
        return `El producto ${this.shortId(item.productoId)} ya no existe`;
      }

      if (item.cantidad <= 0) {
        return `La cantidad del producto ${producto.nombre} debe ser mayor a 0`;
      }

      if (item.cantidad > producto.stock) {
        return `El producto ${producto.nombre} no tiene stock suficiente`;
      }
    }

    return null;
  }

  private buscarCuponVigentePorCodigo(codigo: string): DescuentoRead | null {
    const descuento = this.descuentos.find((item) => item.codigo === codigo);
    if (!descuento) {
      return null;
    }

    if (!this.cuponEstaVigente(descuento)) {
      return null;
    }

    return descuento;
  }

  private cuponEstaVigente(descuento: DescuentoRead): boolean {
    const ahora = new Date();
    const inicio = new Date(descuento.fecha_inicio);
    const fin = new Date(descuento.fecha_fin);
    return ahora >= inicio && ahora <= fin;
  }

  private msg(err: HttpErrorResponse): string {
    const d = err.error?.detail;
    if (typeof d === 'string') return d;
    if (Array.isArray(d)) return d.map((x: any) => x.msg ?? JSON.stringify(x)).join('; ');
    return err.message;
  }

  private esEstadoPendiente(estado: string | null | undefined): boolean {
    return String(estado ?? '').trim().toLowerCase() === 'pendiente';
  }
}
