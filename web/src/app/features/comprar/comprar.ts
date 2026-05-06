import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
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
  OrdenRead,
  PagoCreate,
  ProductoRead,
  UUID,
  UsuarioRead,
} from '../../models/api.models';
import { shortId } from '../../shared/ids';
import { PricePipe } from '../../shared/price.pipe';
import { ComprarConfirmDialogComponent, ComprarConfirmDialogData } from './comprar-confirm-dialog';

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
    MatButtonModule,
    MatDialogModule,
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
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);

  readonly shortId = shortId;
  readonly displayedColumns = ['producto', 'cantidad', 'precio_unitario', 'subtotal'];

  readonly form = this.fb.nonNullable.group({
    carrito_id: ['', Validators.required],
    descuento_codigo: [''],
    metodo_pago: ['Efectivo', Validators.required],
  });

  carritos: CarritoRead[] = [];
  usuarios: UsuarioRead[] = [];
  productos: ProductoRead[] = [];
  descuentos: DescuentoRead[] = [];
  items: PurchaseItemView[] = [];
  loading = true;
  processing = false;
  mensajeCupon = '';
  ordenPendiente: OrdenRead | null = null;
  descuentoAplicado: DescuentoRead | null = null;
  montoDescuentoAplicado = 0;
  totalConDescuento = 0;
  private carritoIdSolicitado: string | null = null;
  carritoBloqueado = false;

  private readonly usuariosPorId = new Map<string, string>();
  private readonly productosPorId = new Map<string, ProductoRead>();

  ngOnInit(): void {
    this.carritoIdSolicitado = this.route.snapshot.queryParamMap.get('carritoId');
    this.form.controls.carrito_id.valueChanges.subscribe((carritoId) => {
      this.ordenPendiente = null;
      this.limpiarResumenDescuento();
      void this.cargarDetalleCarrito(carritoId);
      void this.cargarOrdenPendiente();
    });

    this.form.controls.descuento_codigo.valueChanges.subscribe(() => {
      this.limpiarResumenDescuento();
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

  get totalMostrado(): number {
    const descuento = this.obtenerDescuentoVigenteSeleccionado();
    return descuento ? this.calcularTotalConDescuento(this.totalBruto, descuento) : this.totalBruto;
  }

  get etiquetaDescuentoAplicado(): string {
    if (!this.descuentoAplicado) {
      return '';
    }

    return this.obtenerEtiquetaDescuento(this.totalBruto, this.descuentoAplicado);
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

  get puedeConfirmarCompra(): boolean {
    return !!this.ordenPendiente && this.esEstadoPendiente(this.ordenPendiente.estado);
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
        // Admin ve todos los carritos; cliente solo ve los suyos pendientes.
        const usuarioActual = this.authService.getCurrentUser();
        const esAdmin = this.authService.isAdmin();
        this.carritos = carritos.filter((carrito) => {
          if (esAdmin) {
            return true;
          }

          return !!usuarioActual && carrito.usuario_id === usuarioActual.id && this.esEstadoPendiente(carrito.estado);
        });
        this.usuarios = usuarios;
        this.productos = productos;
        this.descuentos = descuentos;

        this.usuariosPorId.clear();
        usuarios.forEach((usuario) => this.usuariosPorId.set(usuario.id, usuario.nombre_completo));

        this.productosPorId.clear();
        productos.forEach((producto) => this.productosPorId.set(producto.id, producto));

        const carritoPreferido =
          this.carritoIdSolicitado && this.carritosPendientes.some((carrito) => carrito.id === this.carritoIdSolicitado)
            ? this.carritoIdSolicitado
            : this.carritosPendientes[0]?.id;

        if (carritoPreferido) {
          this.form.controls.carrito_id.setValue(carritoPreferido);
          this.carritoBloqueado = !!this.carritoIdSolicitado && carritoPreferido === this.carritoIdSolicitado;
          if (this.carritoBloqueado) {
            this.form.controls.carrito_id.disable({ emitEvent: false });
          } else {
            this.form.controls.carrito_id.enable({ emitEvent: false });
          }
        } else {
          this.form.controls.carrito_id.setValue('');
          this.form.controls.carrito_id.enable({ emitEvent: false });
          this.carritoBloqueado = false;
          this.items = [];
          this.ordenPendiente = null;
          this.loading = false;
        }
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 });
      },
    });
  }

  async generarOrden(): Promise<void> {
    if (this.processing) return;

    const carritoSeleccionado = this.carritoSeleccionado;
    if (!carritoSeleccionado) {
      this.snack.open('Selecciona un carrito para continuar', 'Cerrar', { duration: 4000 });
      return;
    }

    if (!this.items.length) {
      this.snack.open('El carrito no tiene productos para generar la orden', 'Cerrar', { duration: 4000 });
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

    const totalFinal = this.calcularTotalFinalConCupon(total);

    const confirmado = await this.abrirConfirmacion({
      title: 'Confirmar generación de orden',
      message: totalFinal !== total
        ? `Se generará una orden por ${this.formatearDinero(totalFinal)}. ¿Deseas continuar?`
        : `Se generará una orden por ${this.formatearDinero(this.totalBruto)}. ¿Deseas continuar?`,
      confirmText: 'Generar orden',
      cancelText: 'Seguir revisando',
      icon: 'receipt_long',
    });

    if (!confirmado) {
      return;
    }

    this.processing = true;
    try {
      const orden = await this.guardarOrdenPendiente(total, descuento?.id ?? null);
      this.ordenPendiente = orden;
      this.snack.open('Orden generada correctamente', 'OK', { duration: 4000 });
    } catch (err: unknown) {
      this.handleError(err);
    } finally {
      this.processing = false;
    }
  }

  async confirmarCompra(): Promise<void> {
    if (this.processing) return;

    const carritoSeleccionado = this.carritoSeleccionado;
    const ordenPendiente = this.ordenPendiente;

    if (!carritoSeleccionado) {
      this.snack.open('Selecciona un carrito para continuar', 'Cerrar', { duration: 4000 });
      return;
    }

    if (!ordenPendiente || !this.esEstadoPendiente(ordenPendiente.estado)) {
      this.snack.open('Primero genera la orden para poder confirmar la compra', 'Cerrar', { duration: 5000 });
      return;
    }

    this.processing = true;
    try {
      const total = Number(ordenPendiente.total ?? this.totalBruto);
      const pagoPayload: PagoCreate = {
        orden_id: ordenPendiente.id,
        monto: total,
        metodo: this.form.controls.metodo_pago.value,
        estado: 'Pagada',
      };

      await firstValueFrom(this.pagoService.create(pagoPayload));
      await firstValueFrom(this.ordenService.update(ordenPendiente.id, { estado: 'Pagada' }));
      await firstValueFrom(this.carritoService.update(carritoSeleccionado.id, { estado: 'Pagado' }));

      this.ordenPendiente = { ...ordenPendiente, estado: 'Pagada' };
      this.snack.open('Compra confirmada correctamente', 'OK', { duration: 4000 });
      void this.router.navigate(['/app/demo-compra']);
    } catch (err: unknown) {
      this.handleError(err);
    } finally {
      this.processing = false;
    }
  }

  liberarCarrito(): void {
    if (this.processing) return;

    const carritoSeleccionado = this.carritoSeleccionado;
    if (!carritoSeleccionado) {
      this.snack.open('Selecciona un carrito para liberarlo', 'Cerrar', { duration: 4000 });
      return;
    }

    void this.abrirConfirmacion({
      title: 'Confirmar liberación de carrito',
      message: `Se eliminará el carrito ${shortId(carritoSeleccionado.id)} y el stock volverá a estar disponible. ¿Deseas continuar?`,
      confirmText: 'Liberar carrito',
      cancelText: 'Cancelar',
      icon: 'delete_forever',
    }).then((confirmado) => {
      if (!confirmado) {
        return;
      }

      this.procesarLiberacionCarrito(carritoSeleccionado.id);
    });
  }

  private procesarLiberacionCarrito(carritoId: UUID): void {
    this.processing = true;
    this.carritoService.delete(carritoId).subscribe({
      next: () => {
        this.snack.open('Carrito liberado correctamente', 'OK', { duration: 4000 });
        this.form.controls.carrito_id.enable({ emitEvent: false });
        this.form.controls.carrito_id.setValue('');
        this.carritoBloqueado = false;
        this.items = [];
        this.ordenPendiente = null;
        this.limpiarResumenDescuento();
        this.processing = false;
        this.cargarCatalogos();
      },
      error: (err: HttpErrorResponse) => {
        this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 });
        this.processing = false;
      },
    });
  }

  private abrirConfirmacion(data: ComprarConfirmDialogData): Promise<boolean> {
    return firstValueFrom(
      this.dialog.open(ComprarConfirmDialogComponent, {
        width: '420px',
        data,
        disableClose: true,
      }).afterClosed(),
    ).then((resultado) => resultado === true);
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
      this.limpiarResumenDescuento();
      this.snack.open('Ingresa un código de cupón para verificarlo', 'Cerrar', { duration: 3000 });
      return;
    }

    const descuento = this.buscarCuponVigentePorCodigo(codigo);
    if (!descuento) {
      this.limpiarResumenDescuento();
      this.mensajeCupon = `El cupón ${codigo} no está vigente o no existe`;
      this.snack.open(this.mensajeCupon, 'Cerrar', { duration: 4000 });
      return;
    }

    this.aplicarResumenDescuento(descuento);
    this.mensajeCupon = `Cupón válido: ${descuento.codigo}`;
    this.snack.open(this.mensajeCupon, 'OK', { duration: 3000 });
  }

  async procesarCompra(): Promise<void> {
    await this.generarOrden();
    if (this.puedeConfirmarCompra) {
      await this.confirmarCompra();
    }
  }

  limpiarCupon(): void {
    this.form.controls.descuento_codigo.setValue('');
    this.limpiarResumenDescuento();
  }

  private async cargarOrdenPendiente(): Promise<void> {
    const carritoSeleccionado = this.carritoSeleccionado;
    if (!carritoSeleccionado) {
      this.ordenPendiente = null;
      return;
    }

    const ordenes = await firstValueFrom(this.ordenService.list());
    this.ordenPendiente =
      ordenes.find(
        (orden) =>
          String(orden.carrito_id) === String(carritoSeleccionado.id) &&
          this.esEstadoPendiente(orden.estado),
      ) ?? null;
  }

  private async guardarOrdenPendiente(totalFinal: number, descuentoId: string | null): Promise<any> {
    const carritoSeleccionado = this.carritoSeleccionado;
    if (!carritoSeleccionado) {
      throw new Error('Selecciona un carrito para continuar');
    }

    const ordenPayload: OrdenCreate = {
      usuario_id: carritoSeleccionado.usuario_id,
      carrito_id: carritoSeleccionado.id,
      total: totalFinal,
      estado: 'Pendiente',
      descuento_id: descuentoId ?? undefined,
    };

    const todasOrdenes = await firstValueFrom(this.ordenService.list());
    const ordenExistente = todasOrdenes.find(
      (o) => String(o.carrito_id) === String(carritoSeleccionado.id) && this.esEstadoPendiente(o.estado),
    );

    let ordenFinal: any;

    if (ordenExistente) {
      ordenFinal = await firstValueFrom(
        this.ordenService.update(ordenExistente.id, {
          total: totalFinal,
          descuento_id: descuentoId ?? undefined,
          estado: 'Pendiente',
        }),
      );
    } else {
      ordenFinal = await firstValueFrom(this.ordenService.create(ordenPayload));

      for (const item of this.items) {
        await firstValueFrom(
          this.detalleOrdenService.create({
            orden_id: ordenFinal.id,
            producto_id: item.productoId,
            cantidad: item.cantidad,
            precio_unitario: item.precioUnitario,
            subtotal: item.subtotal,
          } as any),
        );
      }
    }

    return ordenFinal;
  }

  private handleError(err: unknown): void {
    if (err instanceof HttpErrorResponse) {
      this.snack.open(this.msg(err), 'Cerrar', { duration: 7000 });
      return;
    }

    const message = err instanceof Error ? err.message : 'No se pudo completar la operación';
    this.snack.open(message, 'Cerrar', { duration: 7000 });
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

  private calcularTotalConDescuento(total: number, descuento: DescuentoRead | null): number {
    if (!descuento) return Number(total.toFixed(2));

    const descuentoAplicado = this.calcularMontoDescuento(total, descuento);
    const totalFinal = Math.max(0, total - descuentoAplicado);
    return Number(totalFinal.toFixed(2));
  }

  private calcularTotalFinalConCupon(total: number): number {
    const descuento = this.obtenerDescuentoVigenteSeleccionado();
    return this.calcularTotalConDescuento(total, descuento);
  }

  private calcularMontoDescuento(total: number, descuento: DescuentoRead): number {
    const porcentaje = this.obtenerNumero(descuento.porcentaje);
    const montoFijo = this.obtenerNumero(descuento.monto_fijo);

    let descuentoPorcentaje = 0;
    if (porcentaje !== null) {
      descuentoPorcentaje = total * (porcentaje / 100);
    }

    return Number(Math.max(descuentoPorcentaje, montoFijo ?? 0).toFixed(2));
  }

  private aplicarResumenDescuento(descuento: DescuentoRead): void {
    const monto = this.calcularMontoDescuento(this.totalBruto, descuento);
    this.descuentoAplicado = descuento;
    this.montoDescuentoAplicado = monto;
    this.totalConDescuento = Number(Math.max(0, this.totalBruto - monto).toFixed(2));
  }

  private limpiarResumenDescuento(): void {
    this.descuentoAplicado = null;
    this.montoDescuentoAplicado = 0;
    this.totalConDescuento = 0;
    this.mensajeCupon = '';
  }

  private obtenerDescuentoVigenteSeleccionado(): DescuentoRead | null {
    const codigo = this.form.controls.descuento_codigo.value.trim();
    if (!codigo) {
      return null;
    }

    return this.buscarCuponVigentePorCodigo(codigo);
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

  private obtenerEtiquetaDescuento(total: number, descuento: DescuentoRead): string {
    const porcentaje = this.obtenerNumero(descuento.porcentaje);
    const montoFijo = this.obtenerNumero(descuento.monto_fijo) ?? 0;

    if (porcentaje !== null) {
      const descuentoPorcentaje = total * (porcentaje / 100);
      if (descuentoPorcentaje >= montoFijo) {
        return `${porcentaje}%`;
      }
    }

    return this.formatearDinero(montoFijo);
  }

  private obtenerNumero(valor: number | string | null | undefined): number | null {
    if (valor === null || valor === undefined || valor === '') {
      return null;
    }

    const numero = typeof valor === 'number' ? valor : Number(String(valor).replace(',', '.'));
    return Number.isFinite(numero) ? numero : null;
  }

  private formatearDinero(valor: number): string {
    return `$${Number(valor || 0).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
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
