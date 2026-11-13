# ZYNALIX - Sitio Web Empresarial

Proyecto de página web para una empresa de soporte técnico y desarrollo de software a medida. La interfaz está diseñada para presentar servicios, captar cotizaciones y ofrecer una experiencia moderna y clara para clientes.

## Descripción

Este sitio incluye:

- Landing page con mensajes de marca y navegación profesional
- Sección de servicios por categorías
- Cotizador con cálculo estimado por servicio
- Formularios para contacto y cotización
- Galería visual del trabajo realizado
- Mapa de ubicación y sección de contacto
- Tema claro y oscuro
- Chat asistente para atención básica
- Panel administrativo simulado para gestionar servicios, mensajes y cotizaciones

El frontend estático existente permanece en la raíz (`index.html`, `styles.css` y `app.js`). La API Express y la lógica de persistencia viven en `backend/`.

## Requisitos

- Node.js 18 o superior.
- Una base de datos MongoDB Atlas y un usuario de **Database Access** con permisos de lectura y escritura sobre la base `zynalix`.
- En **Network Access**, permite la IP desde la que se ejecutará el servidor. No publiques credenciales ni habilites acceso global en producción.

## Configuración local

1. Instala dependencias con `npm install`.
2. Copia `.env.example` a `.env`.
3. En `MONGODB_URI`, reemplaza los marcadores por la URI de Atlas y las credenciales de Database Access. Codifica los caracteres especiales de la contraseña según la sintaxis URI.
4. Genera un secreto de sesión con `openssl rand -base64 32` y guárdalo en `SESSION_SECRET`.
5. Crea el primer administrador con `npm run admin:create`; el script solicita el usuario y la contraseña de forma interactiva y guarda únicamente el hash.
6. Inicia el sitio y la API con `npm run dev`. Abre `http://localhost:3000`.

El backend crea las colecciones al guardar el primer documento. En el primer inicio copia a Atlas los ocho servicios de muestra solo si el catálogo está vacío. Las sesiones también se guardan en MongoDB, no en la memoria del proceso.

## API

- `GET /api/services`: catálogo público.
- `POST /api/contact` y `POST /api/quotes`: solicitudes públicas.
- `POST /api/admin/login`, `POST /api/admin/logout`, `GET /api/admin/session`: sesión del administrador.
- `GET /api/admin/messages`, `DELETE /api/admin/messages/:id`: mensajes.
- `GET /api/admin/quotes`: cotizaciones.
- `GET`, `POST`, `PUT /api/admin/services` y `DELETE /api/admin/services/:id`: CRUD del catálogo.

Las rutas de administración usan una cookie de sesión `HttpOnly`, `SameSite=Lax` y con `Secure` en producción. Nunca se envía la contraseña de vuelta al cliente; los precios de cotización se calculan de nuevo en el servidor.

## Despliegue

Configura `NODE_ENV=production`, `MONGODB_URI`, `SESSION_SECRET` y `PORT` en el proveedor de hosting. Usa HTTPS en producción. El servidor entrega el frontend y la API desde el mismo origen, por lo que no necesita habilitar CORS.
