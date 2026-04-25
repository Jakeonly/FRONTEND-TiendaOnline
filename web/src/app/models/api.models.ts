/** Contratos alineados con `src/schemas/*.py` del backend FastAPI. */

export interface UsuarioRead {
  id: string;
  nombre_completo: string;
  email: string;
  telefono: string | null;
  direccion: string | null;
  activo: boolean;
  es_admin: boolean | null;
  fecha_creacion: string | null;
  fecha_edicion: string | null;
}

export interface UsuarioCreate {
  nombre_completo: string;
  email: string;
  "contraseña": string;
  es_admin: boolean;
  telefono?: string | null;
  direccion?: string | null;
  activo?: boolean;
}

export interface UsuarioUpdate {
  nombre_completo?: string;
  email?: string;
  "contraseña"?: string;
  telefono?: string | null;
  direccion?: string | null;
  activo?: boolean;
  es_admin?: boolean;
}

export interface CategoriaRead {
  id: string;
  nombre: string;
  descripcion: string | null;
  fecha_creacion: string | null;
}

export interface CategoriaCreate {
  nombre: string;
  descripcion?: string | null;
}

export interface CategoriaUpdate {
  nombre?: string;
  descripcion?: string | null;
}

export interface ProductoRead {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  stock: number;
  categoria_id: string;
  fecha_creacion: string | null;
  fecha_edicion: string | null;
}

export interface ProductoCreate {
  nombre: string;
  descripcion?: string | null;
  precio: number;
  stock?: number;
  categoria_id: string;
}

export interface ProductoUpdate {
  nombre?: string;
  descripcion?: string | null;
  precio?: number;
  stock?: number;
  categoria_id?: string;
}

export interface DescuentoRead {
  id: string;
  codigo: string;
  porcentaje: number | null;
  monto_fijo: number | null;
  fecha_inicio: string;
  fecha_fin: string;
  fecha_creacion: string | null;
}

export interface DescuentoCreate {
  codigo: string;
  porcentaje?: number | null;
  monto_fijo?: number | null;
  fecha_inicio: string;
  fecha_fin: string;
}

export interface DescuentoUpdate {
  codigo?: string;
  porcentaje?: number | null;
  monto_fijo?: number | null;
  fecha_inicio?: string;
  fecha_fin?: string;
}

export interface OrdenRead {
  id: string;
  total: number;
  estado: string;
  usuario_id: string;
  descuento_id: string | null;
  fecha_creacion: string | null;
  fecha_edicion: string | null;
}

export interface OrdenCreate {
  total: number;
  estado?: string;
  usuario_id: string;
  descuento_id?: string | null;
}

export interface OrdenUpdate {
  total?: number;
  estado?: string;
  usuario_id?: string;
  descuento_id?: string | null;
}

export interface DetalleOrdenRead {
  id: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  orden_id: string;
  producto_id: string;
  fecha_creacion: string | null;
}

export interface DetalleOrdenCreate {
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  orden_id: string;
  producto_id: string;
}

export interface DetalleOrdenUpdate {
  cantidad?: number;
  precio_unitario?: number;
  subtotal?: number;
  orden_id?: string;
  producto_id?: string;
}

export interface CarritoRead {
  id: string;
  usuario_id: string;
  fecha_creacion: string | null;
  fecha_edicion: string | null;
}

export interface CarritoCreate {
  usuario_id: string;
}

export interface CarritoUpdate {
  usuario_id?: string;
}

export interface DetalleCarritoRead {
  id: string;
  cantidad: number;
  precio_unitario: number;
  carrito_id: string;
  producto_id: string;
  fecha_creacion: string | null;
}

export interface DetalleCarritoCreate {
  cantidad: number;
  precio_unitario: number;
  carrito_id: string;
  producto_id: string;
}

export interface DetalleCarritoUpdate {
  cantidad?: number;
  precio_unitario?: number;
  carrito_id?: string;
  producto_id?: string;
}
