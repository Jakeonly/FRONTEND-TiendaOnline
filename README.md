# Tienda Online — Frontend

## Video de demostración

video

---

## Cómo correr el front (rápido)

Requisitos previos:
- Node.js (recomendado >= 16)
- npm o yarn
- Angular CLI (opcional, si usas `ng serve`)

Opciones de ejecución:

- Opción A — desde la raíz del proyecto frontend:

  1. Instalar dependencias:

	  `npm install`

  2. Ejecutar en modo desarrollo:

	  `npm start`  (o `ng serve` si está disponible)

- Opción B — si trabajas con el subproyecto `web/`:

  1. Entrar en la carpeta `web`:

	  `cd web`

  2. Instalar dependencias:

	  `npm install`

  3. Ejecutar en modo desarrollo:

	  `npm start`  (o `ng serve`)

Comandos útiles:

- Build producción: `npm run build` o `ng build --configuration production`
- Tests (si existen): `npm test`
- Linter (si está configurado): `npm run lint`

Si la aplicación necesita variables de entorno (URL del backend, claves), edítalas en los archivos de entorno en web/src/environments/ antes de levantar la app.

---

## Descripción general

Frontend desarrollado con Angular y Angular Material. Provee una interfaz de administración y de cliente para la Tienda Online: navegación, autenticación, gestión de productos, carrito, pago y órdenes.

**Estructura relevante**
- Código fuente principal: web/src
- Configuración Angular: angular.json
- Entradas de la aplicación: web/src/app

---

## Funcionalidades del Frontend

- **Autenticación:** Inicio de sesión, cierre de sesión y manejo de sesiones.
- **Registro y gestión de usuarios:** Registro de nuevos usuarios y edición de perfil.
- **Roles y permisos:** Distinción entre usuario normal y administrador; vistas y acciones restringidas para administradores.
- **Listado de productos:** Ver catálogo de productos con imágenes, precios y filtros.
- **Detalles de producto:** Página de producto con información detallada.
- **Categorías:** Navegación y filtrado por categorías.
- **Carrito de compras:** Añadir, eliminar y actualizar cantidades en el carrito.
- **Proceso de compra (Checkout):** Crear orden desde el carrito, aplicar descuentos y seleccionar método de pago.
- **Órdenes:** Ver historial de órdenes y detalles de cada orden.
- **Cupones / Descuentos:** Aplicar y validar códigos de descuento durante el checkout.
- **Pagos:** Interfaz para iniciar/confirmar pagos (la integración concreta depende del backend/servicio externo configurado).
- **Panel administrativo:** Gestión de productos, categorías, usuarios, descuentos, y visualización de carritos/órdenes (según permisos de admin).
- **Demo compra:** Flujo de demostración para simular una compra completa.
- **Layout y navegación:** Sidebar colapsable, toolbar y rutas organizadas; diseño responsive con Angular Material.
- **Validaciones y formularios:** Formularios reactivos con validaciones en cliente.
- **Servicios y consumo de API:** Servicios Http para comunicación con el backend, manejo de errores y respuestas.

---

## Notas para desarrolladores

- Ajusta la URL del backend en `web/src/environments/environment.ts` (o en la configuración correspondiente).
- Rutas principales esperadas (según estructura de features):
  - `productos`, `categorias`, `carritos`, `ordenes`, `descuentos`, `usuarios`, `pagos`, `comprar`, `demo-compra`.
- Componentes y servicios clave se encuentran en `web/src/app/features` y `web/src/app/core`.

---

## Deploy

- Generar build de producción:

  `npm run build`  (o `ng build --configuration production`)

- Servir los archivos estáticos generados en `dist/` con el servidor que prefieras (NGINX, Apache, Surge, Netlify, Vercel, etc.).

---
© Proyecto Tienda Online — Frontend
