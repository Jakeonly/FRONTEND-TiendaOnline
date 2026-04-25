import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login').then((m) => m.LoginComponent),
  },
  {
    path: 'app',
    canActivate: [authGuard], 
    loadComponent: () => import('./features/shell/main-layout').then((m) => m.MainLayoutComponent),
    children: [
      { path: '', redirectTo: 'productos', pathMatch: 'full' },
      
      // 1. Usuarios
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./features/usuarios/usuario-list').then((m) => m.UsuarioListComponent),
      },

      // 2. Categorías
      {
        path: 'categorias',
        loadComponent: () =>
          import('./features/categorias/categoria-list').then((m) => m.CategoriaListComponent),
      },

      // 3. Productos
      {
        path: 'productos',
        loadComponent: () =>
          import('./features/productos/producto-list').then((m) => m.ProductoListComponent),
      },

      // 4. Carritos
      {
        path: 'carritos',
        loadComponent: () =>
          import('./features/carritos/carrito-list').then((m) => m.CarritoListComponent),
      },

      // 4.1 Detalle Carrito 
      {
        path: 'detalle-carrito',
        loadComponent: () =>
          import('./features/detalle-carrito/detalle-carrito-list').then((m) => m.DetalleCarritoListComponent),
      },

      // 5. Órdenes
      {
        path: 'ordenes',
        loadComponent: () =>
          import('./features/ordenes/orden-list').then((m) => m.OrdenListComponent),
      },

      // 5.1 Detalle Orden 
      {
        path: 'detalle-orden',
        loadComponent: () =>
          import('./features/detalle-orden/detalle-orden-list').then((m) => m.DetalleOrdenListComponent),
      },

      // 6. Descuentos
      {
        path: 'descuentos',
        loadComponent: () =>
          import('./features/descuentos/descuento-list').then((m) => m.DescuentoListComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];