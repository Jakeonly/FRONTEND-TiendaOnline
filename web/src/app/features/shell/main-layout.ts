import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatTooltipModule,
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  readonly sidebarCollapsed = signal(false);

  private readonly adminOnlyPaths = new Set(['carritos', 'descuentos', 'usuarios', 'pagos']);

  readonly menuItems = [
    { path: 'productos', label: 'Productos', icon: 'inventory_2' },
    { path: 'categorias', label: 'Categorías', icon: 'category' },
    { path: 'carritos', label: 'Carritos', icon: 'shopping_cart' },
    { path: 'ordenes', label: 'Órdenes', icon: 'receipt_long' },
    { path: 'descuentos', label: 'Cupones', icon: 'sell' },
    { path: 'usuarios', label: 'Usuarios', icon: 'group' },
    { path: 'pagos', label: 'Pagos', icon: 'payments' },
    { path: 'comprar', label: 'Comprar', icon: 'shopping_bag' },
  ].filter((item) => this.authService.isAdmin() || !this.adminOnlyPaths.has(item.path));

  logout(): void {
    this.authService.logout();
    void this.router.navigateByUrl('/login');
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update((value) => !value);
  }
}