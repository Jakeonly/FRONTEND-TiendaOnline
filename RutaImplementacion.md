# Ruta de Implementacion

## Objetivo general
Migrar el frontend de ejemplo (modelo banco) al dominio real de tu API de tienda online,
alineando contratos, rutas, autenticacion, modulos y nomenclatura.

## Alcance confirmado contra backend actual
El backend actual ya expone: usuarios, productos, categorias, carritos, ordenes,
detalle-carrito, detalle-orden, descuentos y login.

---

## 1. Prioridad 1: Contrato API y base tecnica (bloqueante)
Objetivo: que el frontend pueda consumir correctamente la API real y su formato
`success_response`.

Archivos existentes a cambiar:
- [FRONTEND-TiendaOnline/web/src/app/models/api.models.ts](FRONTEND-TiendaOnline/web/src/app/models/api.models.ts)
- [FRONTEND-TiendaOnline/web/src/app/app.config.ts](FRONTEND-TiendaOnline/web/src/app/app.config.ts)
- [FRONTEND-TiendaOnline/web/src/environments/environment.ts](FRONTEND-TiendaOnline/web/src/environments/environment.ts)
- [FRONTEND-TiendaOnline/web/src/environments/environment.prod.ts](FRONTEND-TiendaOnline/web/src/environments/environment.prod.ts)

Archivos nuevos a crear:
- FRONTEND-TiendaOnline/web/src/app/core/http/api-response.model.ts
- FRONTEND-TiendaOnline/web/src/app/core/http/auth.interceptor.ts
- FRONTEND-TiendaOnline/web/src/app/core/http/api-error.interceptor.ts

---

## 2. Prioridad 2: Autenticacion real y sesion
Objetivo: eliminar login demo y usar `/usuarios/login` con JWT y guardias reales.

Archivos existentes a cambiar:
- [FRONTEND-TiendaOnline/web/src/app/core/audit-user.guard.ts](FRONTEND-TiendaOnline/web/src/app/core/audit-user.guard.ts)
- [FRONTEND-TiendaOnline/web/src/app/core/audit-context.service.ts](FRONTEND-TiendaOnline/web/src/app/core/audit-context.service.ts)
- [FRONTEND-TiendaOnline/web/src/app/features/login/login.ts](FRONTEND-TiendaOnline/web/src/app/features/login/login.ts)
- [FRONTEND-TiendaOnline/web/src/app/features/login/login.html](FRONTEND-TiendaOnline/web/src/app/features/login/login.html)
- [FRONTEND-TiendaOnline/web/src/app/app.routes.ts](FRONTEND-TiendaOnline/web/src/app/app.routes.ts)

Archivos nuevos a crear:
- FRONTEND-TiendaOnline/web/src/app/core/auth/token.service.ts
- FRONTEND-TiendaOnline/web/src/app/core/auth/auth.service.ts
- FRONTEND-TiendaOnline/web/src/app/core/auth/auth.guard.ts

---

## 3. Prioridad 3: Servicios frontend alineados al backend tienda
Objetivo: adaptar servicios al dominio real (nombres, rutas y payloads).

Archivos existentes a cambiar:
- [FRONTEND-TiendaOnline/web/src/app/core/services/usuario.service.ts](FRONTEND-TiendaOnline/web/src/app/core/services/usuario.service.ts)
- [FRONTEND-TiendaOnline/web/src/app/core/services/categoria.service.ts](FRONTEND-TiendaOnline/web/src/app/core/services/categoria.service.ts)
- [FRONTEND-TiendaOnline/web/src/app/core/services/producto.service.ts](FRONTEND-TiendaOnline/web/src/app/core/services/producto.service.ts)
- [FRONTEND-TiendaOnline/web/src/app/core/services/pedido.service.ts](FRONTEND-TiendaOnline/web/src/app/core/services/pedido.service.ts)
- [FRONTEND-TiendaOnline/web/src/app/core/services/detalle-pedido.service.ts](FRONTEND-TiendaOnline/web/src/app/core/services/detalle-pedido.service.ts)
- [FRONTEND-TiendaOnline/web/src/app/core/services/pago.service.ts](FRONTEND-TiendaOnline/web/src/app/core/services/pago.service.ts)

Archivos nuevos a crear:
- FRONTEND-TiendaOnline/web/src/app/core/services/orden.service.ts
- FRONTEND-TiendaOnline/web/src/app/core/services/detalle-orden.service.ts
- FRONTEND-TiendaOnline/web/src/app/core/services/carrito.service.ts
- FRONTEND-TiendaOnline/web/src/app/core/services/detalle-carrito.service.ts
- FRONTEND-TiendaOnline/web/src/app/core/services/descuento.service.ts

---

## 4. Prioridad 4: Navegacion y shell en contexto tienda online
Objetivo: cambiar menu y rutas para reflejar modulos reales de tienda.

Regla de implementacion para Shell:
- No crear shells nuevos.
- Modificar unicamente los 3 archivos actuales del shell.

Archivos existentes a cambiar:
- [FRONTEND-TiendaOnline/web/src/app/app.routes.ts](FRONTEND-TiendaOnline/web/src/app/app.routes.ts)

Archivos shell existentes a cambiar (3):
- [FRONTEND-TiendaOnline/web/src/app/features/shell/main-layout.ts](FRONTEND-TiendaOnline/web/src/app/features/shell/main-layout.ts)
- [FRONTEND-TiendaOnline/web/src/app/features/shell/main-layout.html](FRONTEND-TiendaOnline/web/src/app/features/shell/main-layout.html)
- [FRONTEND-TiendaOnline/web/src/app/features/shell/main-layout.scss](FRONTEND-TiendaOnline/web/src/app/features/shell/main-layout.scss)

Archivos nuevos a crear (solo modulos funcionales, no shell):
- FRONTEND-TiendaOnline/web/src/app/features/ordenes/orden-list.ts
- FRONTEND-TiendaOnline/web/src/app/features/ordenes/orden-list.html
- FRONTEND-TiendaOnline/web/src/app/features/ordenes/orden-dialog.ts
- FRONTEND-TiendaOnline/web/src/app/features/ordenes/orden-dialog.html
- FRONTEND-TiendaOnline/web/src/app/features/detalle-orden/detalle-orden-list.ts
- FRONTEND-TiendaOnline/web/src/app/features/detalle-orden/detalle-orden-list.html
- FRONTEND-TiendaOnline/web/src/app/features/detalle-orden/detalle-orden-dialog.ts
- FRONTEND-TiendaOnline/web/src/app/features/detalle-orden/detalle-orden-dialog.html
- FRONTEND-TiendaOnline/web/src/app/features/carritos/carrito-list.ts
- FRONTEND-TiendaOnline/web/src/app/features/carritos/carrito-list.html
- FRONTEND-TiendaOnline/web/src/app/features/carritos/carrito-dialog.ts
- FRONTEND-TiendaOnline/web/src/app/features/carritos/carrito-dialog.html
- FRONTEND-TiendaOnline/web/src/app/features/detalle-carrito/detalle-carrito-list.ts
- FRONTEND-TiendaOnline/web/src/app/features/detalle-carrito/detalle-carrito-list.html
- FRONTEND-TiendaOnline/web/src/app/features/detalle-carrito/detalle-carrito-dialog.ts
- FRONTEND-TiendaOnline/web/src/app/features/detalle-carrito/detalle-carrito-dialog.html
- FRONTEND-TiendaOnline/web/src/app/features/descuentos/descuento-list.ts
- FRONTEND-TiendaOnline/web/src/app/features/descuentos/descuento-list.html
- FRONTEND-TiendaOnline/web/src/app/features/descuentos/descuento-dialog.ts
- FRONTEND-TiendaOnline/web/src/app/features/descuentos/descuento-dialog.html

---

## 5. Prioridad 5: CRUDs existentes migrados del modelo banco al modelo tienda
Objetivo: actualizar pantallas actuales para usar campos reales de tienda online.

Archivos existentes a cambiar:
- [FRONTEND-TiendaOnline/web/src/app/features/usuarios/usuario-list.ts](FRONTEND-TiendaOnline/web/src/app/features/usuarios/usuario-list.ts)
- [FRONTEND-TiendaOnline/web/src/app/features/usuarios/usuario-list.html](FRONTEND-TiendaOnline/web/src/app/features/usuarios/usuario-list.html)
- [FRONTEND-TiendaOnline/web/src/app/features/usuarios/usuario-dialog.ts](FRONTEND-TiendaOnline/web/src/app/features/usuarios/usuario-dialog.ts)
- [FRONTEND-TiendaOnline/web/src/app/features/usuarios/usuario-dialog.html](FRONTEND-TiendaOnline/web/src/app/features/usuarios/usuario-dialog.html)
- [FRONTEND-TiendaOnline/web/src/app/features/categorias/categoria-list.ts](FRONTEND-TiendaOnline/web/src/app/features/categorias/categoria-list.ts)
- [FRONTEND-TiendaOnline/web/src/app/features/categorias/categoria-list.html](FRONTEND-TiendaOnline/web/src/app/features/categorias/categoria-list.html)
- [FRONTEND-TiendaOnline/web/src/app/features/categorias/categoria-dialog.ts](FRONTEND-TiendaOnline/web/src/app/features/categorias/categoria-dialog.ts)
- [FRONTEND-TiendaOnline/web/src/app/features/categorias/categoria-dialog.html](FRONTEND-TiendaOnline/web/src/app/features/categorias/categoria-dialog.html)
- [FRONTEND-TiendaOnline/web/src/app/features/productos/producto-list.ts](FRONTEND-TiendaOnline/web/src/app/features/productos/producto-list.ts)
- [FRONTEND-TiendaOnline/web/src/app/features/productos/producto-list.html](FRONTEND-TiendaOnline/web/src/app/features/productos/producto-list.html)
- [FRONTEND-TiendaOnline/web/src/app/features/productos/producto-dialog.ts](FRONTEND-TiendaOnline/web/src/app/features/productos/producto-dialog.ts)
- [FRONTEND-TiendaOnline/web/src/app/features/productos/producto-dialog.html](FRONTEND-TiendaOnline/web/src/app/features/productos/producto-dialog.html)
- [FRONTEND-TiendaOnline/web/src/app/features/pedidos/pedido-list.ts](FRONTEND-TiendaOnline/web/src/app/features/pedidos/pedido-list.ts)
- [FRONTEND-TiendaOnline/web/src/app/features/pedidos/pedido-list.html](FRONTEND-TiendaOnline/web/src/app/features/pedidos/pedido-list.html)
- [FRONTEND-TiendaOnline/web/src/app/features/pedidos/pedido-dialog.ts](FRONTEND-TiendaOnline/web/src/app/features/pedidos/pedido-dialog.ts)
- [FRONTEND-TiendaOnline/web/src/app/features/pedidos/pedido-dialog.html](FRONTEND-TiendaOnline/web/src/app/features/pedidos/pedido-dialog.html)
- [FRONTEND-TiendaOnline/web/src/app/features/detalles-pedido/detalle-pedido-list.ts](FRONTEND-TiendaOnline/web/src/app/features/detalles-pedido/detalle-pedido-list.ts)
- [FRONTEND-TiendaOnline/web/src/app/features/detalles-pedido/detalle-pedido-list.html](FRONTEND-TiendaOnline/web/src/app/features/detalles-pedido/detalle-pedido-list.html)
- [FRONTEND-TiendaOnline/web/src/app/features/detalles-pedido/detalle-pedido-dialog.ts](FRONTEND-TiendaOnline/web/src/app/features/detalles-pedido/detalle-pedido-dialog.ts)
- [FRONTEND-TiendaOnline/web/src/app/features/detalles-pedido/detalle-pedido-dialog.html](FRONTEND-TiendaOnline/web/src/app/features/detalles-pedido/detalle-pedido-dialog.html)

Archivos nuevos a crear:
- Ninguno obligatorio en este bloque (solo refactor de los existentes).

---

## 6. Prioridad 6: Implementar pagos completos en backend + frontend
Objetivo: consolidar el modulo pago dentro del dominio tienda online.

Backend - archivos nuevos a crear:
- BACKEND-TiendaOnline/src/entities/pago.py
- BACKEND-TiendaOnline/src/schemas/pago_schema.py
- BACKEND-TiendaOnline/src/endpoints/pagos.py

Backend - archivos existentes a cambiar:
- [BACKEND-TiendaOnline/src/app.py](BACKEND-TiendaOnline/src/app.py)
- [BACKEND-TiendaOnline/src/endpoints/__init__.py](BACKEND-TiendaOnline/src/endpoints/__init__.py)
- [BACKEND-TiendaOnline/src/entities/__init__.py](BACKEND-TiendaOnline/src/entities/__init__.py)
- [BACKEND-TiendaOnline/src/schemas/__init__.py](BACKEND-TiendaOnline/src/schemas/__init__.py)

Frontend - archivos existentes a cambiar:
- [FRONTEND-TiendaOnline/web/src/app/models/api.models.ts](FRONTEND-TiendaOnline/web/src/app/models/api.models.ts)
- [FRONTEND-TiendaOnline/web/src/app/core/services/pago.service.ts](FRONTEND-TiendaOnline/web/src/app/core/services/pago.service.ts)
- [FRONTEND-TiendaOnline/web/src/app/features/pagos/pago-list.ts](FRONTEND-TiendaOnline/web/src/app/features/pagos/pago-list.ts)
- [FRONTEND-TiendaOnline/web/src/app/features/pagos/pago-list.html](FRONTEND-TiendaOnline/web/src/app/features/pagos/pago-list.html)
- [FRONTEND-TiendaOnline/web/src/app/features/pagos/pago-dialog.ts](FRONTEND-TiendaOnline/web/src/app/features/pagos/pago-dialog.ts)
- [FRONTEND-TiendaOnline/web/src/app/features/pagos/pago-dialog.html](FRONTEND-TiendaOnline/web/src/app/features/pagos/pago-dialog.html)
- [FRONTEND-TiendaOnline/web/src/app/app.routes.ts](FRONTEND-TiendaOnline/web/src/app/app.routes.ts)

Frontend - archivos nuevos a crear:
- Ninguno obligatorio si se reutiliza el modulo de pagos ya existente.

---

## 7. Prioridad 7: Datos, pruebas y validacion final
Objetivo: verificar que todo el flujo tienda online funcione sin restos del modelo banco.

Backend - archivos existentes a cambiar:
- [BACKEND-TiendaOnline/seed_db.py](BACKEND-TiendaOnline/seed_db.py)
- [BACKEND-TiendaOnline/init_db.py](BACKEND-TiendaOnline/init_db.py)
- [BACKEND-TiendaOnline/migrate_db.py](BACKEND-TiendaOnline/migrate_db.py)
- [BACKEND-TiendaOnline/README.md](BACKEND-TiendaOnline/README.md)

Frontend - archivos existentes a cambiar:
- [FRONTEND-TiendaOnline/web/README.md](FRONTEND-TiendaOnline/web/README.md)

Archivos nuevos a crear:
- FRONTEND-TiendaOnline/web/src/app/models/login.models.ts
- FRONTEND-TiendaOnline/web/src/app/core/http/http.types.ts
- BACKEND-TiendaOnline/tests/test_login.py
- BACKEND-TiendaOnline/tests/test_ordenes.py
- BACKEND-TiendaOnline/tests/test_pagos.py

---

## Criterio de cierre (Definition of Done)
1. Login real con JWT funcionando y rutas protegidas.
2. Todas las pantallas usan contratos del backend tienda online.
3. No quedan referencias funcionales al modelo banco (campos/rutas/conceptos).
4. CRUDs de tienda operativos: usuarios, categorias, productos, ordenes,
detalle-orden, carritos, detalle-carrito, descuentos y pagos.
5. Documentacion y datos seed actualizados al dominio tienda online.
