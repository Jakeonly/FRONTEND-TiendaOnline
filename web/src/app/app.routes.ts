import { Routes } from '@angular/router';
import { adminGuard, authGuard } from './core/auth/auth.guard';

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
      {
        path: 'usuarios',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/usuarios/usuario-list').then((m) => m.UsuarioListComponent),
      },
      {
        path: 'categorias',
        loadComponent: () =>
          import('./features/categorias/categoria-list').then((m) => m.CategoriaListComponent),
      },
      {
        path: 'productos',
        loadComponent: () =>
          import('./features/productos/producto-list').then((m) => m.ProductoListComponent),
      },
      {
        path: 'ordenes', 
        loadComponent: () =>
          import('./features/ordenes/orden-list').then((m) => m.OrdenListComponent),
      },
      {
        path: 'detalle-orden', 
        loadComponent: () =>
          import('./features/detalle-orden/detalle-orden-list').then(
            (m) => m.DetalleOrdenListComponent,
          ),
      },
      {
        path: 'carritos', 
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/carritos/carrito-list').then((m) => m.CarritoListComponent),
      },
      {
        path: 'comprar',
        loadComponent: () =>
          import('./features/comprar/comprar').then((m) => m.ComprarComponent),
      },
      {
        path: 'demo-compra',
        loadComponent: () =>
          import('./features/demo-compra/demo-compra').then((m) => m.DemoCompraComponent),
      },
      {
        path: 'detalle-carrito', 
        loadComponent: () =>
          import('./features/detalle-carrito/detalle-carrito-list').then(
            (m) => m.DetalleCarritoListComponent,
          ),
      },
      {
        path: 'descuentos', 
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/descuentos/descuento-list').then((m) => m.DescuentoListComponent),
      },
      {
        path: 'pagos',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/pagos/pago-list').then((m) => m.PagoListComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];