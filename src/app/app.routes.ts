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
      
      // 1. Usuarios (Entidad: usuario)
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./features/usuarios/usuario-list').then((m) => m.UsuarioListComponent),
      },

      // 2. Categorías (Entidad: categoria)
      {
        path: 'categorias',
        loadComponent: () =>
          import('./features/categorias/categoria-list').then((m) => m.CategoriaListComponent),
      },

      // 3. Productos (Entidad: producto)
      {
        path: 'productos',
        loadComponent: () =>
          import('./features/productos/producto-list').then((m) => m.ProductoListComponent),
      },

      // 4. Carritos (Entidades: carrito y detalle_carrito)
      {
        path: 'carritos',
        loadComponent: () =>
          import('./features/carritos/carrito-list').then((m) => m.CarritoListComponent),
      },

      // 5. Órdenes (Entidades: orden y detalle_orden)
      {
        path: 'ordenes',
        loadComponent: () =>
          import('./features/ordenes/orden-list').then((m) => m.OrdenListComponent),
      },

      // 6. Descuentos (Entidad: descuento)
      {
        path: 'descuentos',
        loadComponent: () =>
          import('./features/descuentos/descuento-list').then((m) => m.DescuentoListComponent),
      },
    ],
  },

  { path: '**', redirectTo: 'login' },
];