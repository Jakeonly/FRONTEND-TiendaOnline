# Tienda Online — Frontend

## Video de demostración

[Video presentación](https://youtu.be/uaZGFuPnIIk)

---

## Cómo correr el front (rápido)

### Requisitos previos
- Node.js (recomendado >= 16)
- npm o yarn
- Angular CLI (opcional, si usas `ng serve`)

### Instalación y configuración

#### Opción A — desde la raíz del proyecto frontend:

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar la URL del backend:**
   
   Abre `web/src/environments/environment.ts` y asegúrate de que la URL base de la API sea correcta:
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:8000'  // Ajusta según tu configuración del backend
   };
   ```

   Para producción, edita `web/src/environments/environment.prod.ts`:
   ```typescript
   export const environment = {
     production: true,
     apiUrl: 'https://tu-backend.com'  // URL de tu backend en producción
   };
   ```

3. **Ejecutar en modo desarrollo:**
   ```bash
   npm start
   ```
   (o `ng serve` si está disponible)

   La aplicación estará disponible en `http://localhost:4200`

#### Opción B — si trabajas con el subproyecto `web/`:

1. **Entrar en la carpeta `web`:**
   ```bash
   cd web
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar la URL del backend:**
   
   Edita `src/environments/environment.ts` con la URL correcta (p. ej., `http://localhost:8000`)

4. **Ejecutar en modo desarrollo:**
   ```bash
   npm start
   ```
   (o `ng serve`)

### Comandos útiles

```bash
# Build para producción
npm run build
# o
ng build --configuration production

# Tests (si existen)
npm test

# Linter (si está configurado)
npm run lint
```

### Requisitos técnicos

- **CORS y consumo desde el navegador**: El backend debe tener CORS configurado para aceptar peticiones desde `http://localhost:4200` (u origen del frontend en producción).
- **Autenticación JWT**: El frontend almacena el token de forma segura y lo envía automáticamente en la cabecera `Authorization: Bearer <token>` en todas las peticiones autenticadas.

---
## Descripción general

Frontend desarrollado con **Angular 16+** y **Angular Material**. Proporciona una interfaz completa para la Tienda Online con autenticación, gestión de productos, carrito de compras, órdenes y más.

### Estructura relevante
- **Código fuente principal**: `web/src`
- **Configuración Angular**: `angular.json`
- **Punto de entrada**: `web/src/app`
- **Servicios y consumo de API**: `web/src/app/core/services`
- **Modelos de datos**: `web/src/app/models`

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

### Configuración de la API

1. **URL del backend**: Configura la URL base de la API en los archivos de entorno:
   - Desarrollo: `web/src/environments/environment.ts`
   - Producción: `web/src/environments/environment.prod.ts`

2. **Autenticación JWT**:
   - El token se almacena en localStorage tras el login
   - Se envía automáticamente en la cabecera `Authorization: Bearer <token>` en peticiones autenticadas
   - El cierre de sesión limpia el token del cliente

3. **CORS**: El backend debe tener CORS configurado para aceptar peticiones desde el origen del frontend.

### Rutas principales del frontend

- `/login` - Inicio de sesión
- `/productos` - Catálogo de productos
- `/categorias` - Navegación por categorías
- `/carrito` - Carrito de compras
- `/comprar` - Checkout y proceso de compra
- `/ordenes` - Historial de órdenes
- `/descuentos` - Gestión de cupones (si aplica)
- `/usuarios` - Gestión de perfil (roles según permisos)
- `/pagos` - Gestión de pagos

### Consideraciones de seguridad

- ✅ Tokens JWT almacenados en localStorage (puede mejorarse con httpOnly cookies)
- ✅ Cabeceras de autorización en peticiones autenticadas
- ✅ Validación de roles en cliente (siempre validar también en servidor)
- ✅ CORS y credenciales correctamente configuradas

---

## Deploy

### Build para producción

```bash
npm run build
# o
ng build --configuration production
```

Los archivos compilados estarán en `dist/`

### Desplegar la aplicación

Sube el contenido de `dist/` a cualquier servidor estático:
- **NGINX / Apache**: Sirve los archivos estáticos desde `dist/`
- **Netlify / Vercel**: Conecta tu repositorio y configura el comando `npm run build`
- **Surge.sh / GitHub Pages**: Sigue sus instrucciones de despliegue
- **Contenedor Docker**: Crea un Dockerfile que compile la app y sirva los archivos

### Consideraciones para producción

- ✅ Actualiza la URL del backend en `environment.prod.ts`
- ✅ Configura los orígenes CORS en el backend para aceptar tu dominio de producción
- ✅ Usa HTTPS en producción
- ✅ Considera usar httpOnly cookies en lugar de localStorage para el token JWT

---
© Proyecto Tienda Online — Frontend
