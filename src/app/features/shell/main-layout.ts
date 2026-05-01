import { HttpErrorResponse } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavContainer, MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuditContextService } from '../../core/audit-context.service';

const SIDEBAR_KEY = 'shell_sidebar_collapsed';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTooltipModule,
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayoutComponent implements OnInit, AfterViewInit {
  private readonly router = inject(Router);
  private readonly snack = inject(MatSnackBar);
  readonly audit = inject(AuditContextService);

  @ViewChild('sidenavShell') private sidenavShell?: MatSidenavContainer;

  readonly sidebarCollapsed = signal(
    typeof localStorage !== 'undefined' && localStorage.getItem(SIDEBAR_KEY) === '1',
  );


  readonly nav = [
    { path: 'productos', label: 'Productos', icon: 'shopping_bag' },
    { path: 'categorias', label: 'Categorías', icon: 'category' },
    { path: 'descuentos', label: 'Descuentos', icon: 'sell' },
    { path: 'carritos', label: 'Carritos', icon: 'shopping_cart' },
    { path: 'detalle-carrito', label: 'Detalle Carrito', icon: 'list_alt' },
    { path: 'ordenes', label: 'Órdenes', icon: 'receipt_long' },
    { path: 'detalle-orden', label: 'Detalle Orden', icon: 'assignment' },
    { path: 'usuarios', label: 'Usuarios', icon: 'people' },
  ];

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    this.syncContentMarginsWithDrawer();
  }

  private syncContentMarginsWithDrawer(): void {
    const shell = this.sidenavShell;
    if (!shell) return;
    shell.updateContentMargins();
  }

  toggleSidebar(): void {
    const next = !this.sidebarCollapsed();
    this.sidebarCollapsed.set(next);
    localStorage.setItem(SIDEBAR_KEY, next ? '1' : '0');
    queueMicrotask(() => this.syncContentMarginsWithDrawer());
    window.setTimeout(() => this.syncContentMarginsWithDrawer(), 80);
    window.setTimeout(() => this.syncContentMarginsWithDrawer(), 360);
  }

  logout(): void {
    this.audit.clear();
    void this.router.navigateByUrl('/login');
  }

  private msg(err: HttpErrorResponse): string {
    const d = err.error?.detail;
    if (typeof d === 'string') return d;
    if (Array.isArray(d)) return d.map((x) => x.msg ?? JSON.stringify(x)).join('; ');
    return err.message;
  }
}