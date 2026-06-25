# Catalogo Digital

Catalogo digital con frontend publico, panel admin mobile-first (PWA) y backend en Express + Prisma. El proyecto ya incluye soporte para desarrollo local, despliegue con Docker y static assets locales para imagenes.

## Stack

- Frontend publico: React 18 + Vite + TailwindCSS + React Query
- Admin: React 18 + Vite + TailwindCSS + VitePWA
- Backend: Node.js 20 + Express + Prisma
- Base de datos: PostgreSQL
- Auth admin: JWT + bcryptjs
- Media: Cloudinary opcional para uploads; tambien hay soporte para imagenes locales en `/static`

## Que trae el proyecto

- Catalogo publico con busqueda, filtros y detalle de producto
- Carrusel inicial que toma imagenes por categoria/producto
- Formulario de contacto por WhatsApp
- Panel admin para login, CRUD de productos, cambio de estado y subida de imagenes/video
- PWA para administrar desde el telefono
- Servido de frontend y admin desde el backend en produccion
- Archivos estaticos locales servidos desde `/static`

## Estructura

- `frontend/`: catalogo publico
- `admin/`: panel admin PWA
- `backend/`: API Express + Prisma + servidor de archivos estaticos
- `docker-compose.yml`: orquestacion para produccion con PostgreSQL
- `Dockerfile`: build multi-stage para frontend, admin y backend

## Requisitos

- Node.js 20+
- Docker y Docker Compose para despliegue recomendado
- PostgreSQL si vas a correrlo sin Docker
- Cloudinary solo si vas a usar uploads remotos

## Variables de entorno

### Backend (`backend/.env`)

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
JWT_SECRET=xxx_random_string
ADMIN_EMAIL=admin@tuempresa.com
ADMIN_PASSWORD_HASH=xxx_bcrypt
FRONTEND_URL=https://tudominio.com
ADMIN_URL=https://tudominio.com/admin
PORT=3000
NODE_ENV=production
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=https://backend-production.up.railway.app
VITE_WHATSAPP_NUMBER=51999999999
```

### Admin (`admin/.env`)

```env
VITE_API_URL=https://backend-production.up.railway.app
```

### Docker Compose / root `.env`

Para el despliegue con Docker Compose, configura estas variables en la raiz del repo:

```env
DB_PASSWORD=catalogo_secret_2026
JWT_SECRET=una_clave_larga_y_segura
ADMIN_EMAIL=admin@tuempresa.com
ADMIN_PASSWORD_HASH=xxx_bcrypt
FRONTEND_URL=http://TU_SERVIDOR
ADMIN_URL=http://TU_SERVIDOR/admin
VITE_API_URL=http://TU_SERVIDOR
VITE_WHATSAPP_NUMBER=51999999999
PORT=3000
```

## Generar el hash del PIN admin

Antes de desplegar, genera el hash bcrypt del PIN que usara el admin:

```bash
cd backend
npm install
node --input-type=module -e "import bcrypt from 'bcryptjs'; console.log(await bcrypt.hash('1234', 10))"
```

Copia el resultado en `ADMIN_PASSWORD_HASH`.

## Desarrollo local sin Docker

### 1) Backend

```bash
cd backend
npm install
cp .env.example .env
npm run prisma generate
npm run db:migrate
npm run db:seed
npm run dev
```

### 2) Frontend publico

```bash
cd ../frontend
npm install
cp .env.example .env
npm run dev
```

### 3) Admin

```bash
cd ../admin
npm install
cp .env.example .env
npm run dev
```

### Puertos locales

- Backend: `http://localhost:3000`
- Frontend: `http://localhost:5173`
- Admin: `http://localhost:5174/admin`

## Produccion con Docker

La configuracion actual levanta:

- `db`: PostgreSQL 16
- `app`: backend Express + frontend compilado + admin compilado

El backend sirve en produccion:

- API en `/api`
- Frontend publico en `/`
- Admin en `/admin`
- Imagenes locales en `/static`
- Archivos subidos en `/uploads`

### Levantar todo

```bash
docker compose up -d --build
```

### Verificar

- App publica: `http://TU_SERVIDOR/`
- Admin: `http://TU_SERVIDOR/admin/`
- Health check: `http://TU_SERVIDOR/api/health`

### Actualizar despliegue

```bash
git pull
docker compose up -d --build
```

## Cloudinary

- Cloudinary es opcional para desarrollo local y despliegue con imagenes locales.
- Si no hay credenciales, el endpoint de upload responde con error claro y el proyecto sigue usando assets locales.
- Las imagenes del seed usan una ruta local en `/static/green-cube.jpg`.

## Admin PWA

- El manifest esta configurado para abrir en `/admin`
- Reemplaza `admin/public/pwa-192.png` y `admin/public/pwa-512.png` por iconos reales
- En Android: abrir admin y usar "Agregar a pantalla de inicio"
- En iOS: compartir y usar "Agregar a pantalla de inicio"

## Endpoints

### Publicos

- `GET /api/categories`
- `GET /api/products`
- `GET /api/products/:slug`
- `POST /api/contact`

### Admin (JWT)

- `POST /api/admin/login`
- `GET /api/admin/products`
- `GET /api/admin/products/:id`
- `POST /api/admin/products`
- `PUT /api/admin/products/:id`
- `DELETE /api/admin/products/:id`
- `PATCH /api/admin/products/:id/status`
- `POST /api/admin/upload`

## Notas

- Productos con estado `archived` no aparecen en el catalogo publico
- Productos marcados como vendidos desaparecen del catalogo publico
- La API permite consumir el frontend y admin desde el mismo backend en produccion
