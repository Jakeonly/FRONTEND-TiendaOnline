export type UUID = string;

// --- 1. USUARIOS ---
export interface UsuarioRead {
  id: UUID;
  nombre_completo: string;
  email: string;
  telefono?: string;
  direccion?: string;
  activo: boolean;
  es_admin: boolean;
  fecha_creacion: string;
}

export interface UsuarioCreate {
  nombre_completo: string;
  email: string;
  contraseña: string; 
  telefono?: string;
  direccion?: string;
  es_admin?: boolean;
}

export interface UsuarioUpdate {
  nombre_completo?: string;
  email?: string;
  contraseña?: string;
  telefono?: string;
  direccion?: string;
  activo?: boolean;
  es_admin?: boolean;
}

// --- 2. CATEGORIAS ---
export interface CategoriaRead {
  id: UUID;
  nombre: string;
  descripcion?: string;
  fecha_creacion: string;
}

export interface CategoriaCreate {
  nombre: string;
  descripcion?: string;
}

export interface CategoriaUpdate {
  nombre?: string;
  descripcion?: string;
}

// --- 3. PRODUCTOS ---
export interface ProductoRead {
  id: UUID;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  categoria_id: UUID;
  fecha_creacion: string;
}

export interface ProductoCreate {
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  categoria_id: UUID;
}

export interface ProductoUpdate {
  nombre?: string;
  descripcion?: string;
  precio?: number;
  stock?: number;
  categoria_id?: UUID;
}

// --- 4. ORDENES ---
export interface OrdenRead {
  id: UUID;
  total: number;
  estado: string; // 'pendiente' por defecto
  usuario_id: UUID;
  descuento_id?: UUID;
  fecha_creacion: string;
}

export interface OrdenCreate {
  total: number;
  usuario_id: UUID;
  descuento_id?: UUID;
  estado?: string;
}

export interface OrdenUpdate {
  estado?: string;
  total?: number;
  descuento_id?: UUID | null;
}

// --- 5. DETALLE ORDEN ---
export interface DetalleOrdenRead {
  id: UUID;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  orden_id: UUID;
  producto_id: UUID;
  fecha_creacion: string;
}

export interface DetalleOrdenCreate {
  cantidad: number;
  precio_unitario: number;
  orden_id: UUID;
  producto_id: UUID;
}

export interface DetalleOrdenUpdate {
  cantidad?: number;
  precio_unitario?: number;
}

// --- 6. CARRITOS ---
export interface CarritoRead {
  id: UUID;
  usuario_id: UUID;
  estado: string;
  fecha_creacion: string;
}

export interface CarritoCreate {
  usuario_id: UUID;
  estado?: string;
}

export interface CarritoUpdate {
  usuario_id?: UUID;
  estado?: string;
}

// --- 7. DETALLE CARRITO ---
export interface DetalleCarritoRead {
  id: UUID;
  cantidad: number;
  precio_unitario: number;
  carrito_id: UUID;
  producto_id: UUID;
  fecha_creacion: string;
}

export interface DetalleCarritoCreate {
  cantidad: number;
  precio_unitario: number;
  carrito_id: UUID;
  producto_id: UUID;
}

export interface DetalleCarritoUpdate {
  cantidad?: number;
}

// --- 8. DESCUENTOS ---
export interface DescuentoRead {
  id: UUID;
  codigo: string;
  porcentaje?: number;
  monto_fijo?: number;
  fecha_inicio: string;
  fecha_fin: string;
  fecha_creacion: string;
}

export interface DescuentoCreate {
  codigo: string;
  porcentaje?: number;
  monto_fijo?: number;
  fecha_inicio: string;
  fecha_fin: string;
}

export interface DescuentoUpdate {
  codigo?: string;
  porcentaje?: number;
  monto_fijo?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
}

// --- 9. PAGOS ---
export interface PagoRead {
  id: UUID;
  monto: number;
  metodo: string;
  estado: string;
  fecha_creacion: string;
  fecha_edicion?: string;
  orden_id: UUID;
}

export interface PagoCreate {
  monto: number;
  metodo: string;
  estado?: string;
  orden_id: UUID;
}

export interface PagoUpdate {
  monto?: number;
  metodo?: string;
  estado?: string;
  orden_id?: UUID;
}

