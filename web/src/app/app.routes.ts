import { Routes } from '@angular/router';
import { auditUserGuard } from './core/audit-user.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login').then((m) => m.LoginComponent),
  },
  {
    path: 'app',
    canActivate: [auditUserGuard],
    loadComponent: () => import('./features/shell/main-layout').then((m) => m.MainLayoutComponent),
    children: [

      { path: '', redirectTo: 'productos', pathMatch: 'full' },
      {
        path: 'usuarios',
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
        loadComponent: () =>
          import('./features/carritos/carrito-list').then((m) => m.CarritoListComponent),
      },
      {
        path: 'comprar',
        loadComponent: () =>
          import('./features/comprar/comprar').then((m) => m.ComprarComponent),
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
        loadComponent: () =>
          import('./features/descuentos/descuento-list').then((m) => m.DescuentoListComponent),
      },

      {
        path: 'pagos',
        loadComponent: () => import('./features/pagos/pago-list').then((m) => m.PagoListComponent),
      },
      
    ],
  },
  { path: '**', redirectTo: 'login' },
];