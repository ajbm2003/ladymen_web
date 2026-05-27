# Catalogo Digital

Catalogo digital con frontend publico, panel admin mobile-first (PWA) y backend en Express + Prisma.

## Requisitos
- Node.js 20+
- PostgreSQL (Railway o local)
- Cuenta Cloudinary

## Estructura
- frontend: catalogo publico (React + Vite + Tailwind)
- admin: panel mobile-first (React + Vite + Tailwind + PWA)
- backend: API Express + Prisma

## Instalacion local

1) Backend
```bash
cd backend
npm install
cp .env.example .env
npm run prisma generate
npm run db:migrate
npm run db:seed
npm run dev
```

2) Frontend
```bash
cd ../frontend
npm install
cp .env.example .env
npm run dev
```

3) Admin
```bash
cd ../admin
npm install
cp .env.example .env
npm run dev
```

## Variables de entorno

Backend (.env):
- DATABASE_URL
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
- JWT_SECRET
- ADMIN_EMAIL
- ADMIN_PASSWORD_HASH
- FRONTEND_URL
- ADMIN_URL
- PORT
- NODE_ENV

Frontend (.env):
- VITE_API_URL
- VITE_WHATSAPP_NUMBER

Admin (.env):
- VITE_API_URL

## Cloudinary
- Crear un preset y configurar las credenciales en .env
- Upload usa carpeta catalogo-productos
- Transformacion: width 1200, crop limit

## PWA Admin
- El manifiesto esta configurado con nombre "Catálogo Admin" y start_url /admin
- Reemplazar los iconos en admin/public/pwa-192.png y admin/public/pwa-512.png por PNG reales
- En Android: abrir admin, menu del navegador > "Agregar a pantalla de inicio"
- En iOS: compartir > "Agregar a pantalla de inicio"

## Railway (paso a paso)

1) Crear un proyecto y agregar PostgreSQL desde Marketplace
2) Backend
- Service: Web Service
- Root directory: /backend
- Variables: usar backend/.env.example
3) Frontend
- Service: Static Site
- Root directory: /frontend
- Variable: VITE_API_URL apuntando al backend
4) Admin
- Service: Static Site
- Root directory: /admin
- Variable: VITE_API_URL apuntando al backend
5) Configurar CORS con FRONTEND_URL y ADMIN_URL

## Endpoints

Publicos:
- GET /api/categories
- GET /api/products
- GET /api/products/:slug
- POST /api/contact

Admin (JWT):
- POST /api/admin/login
- GET /api/admin/products
- GET /api/admin/products/:id
- POST /api/admin/products
- PUT /api/admin/products/:id
- DELETE /api/admin/products/:id
- PATCH /api/admin/products/:id/status
- POST /api/admin/upload

## Notas
- Soft delete: status=archived
- Productos vendidos desaparecen del catalogo publico
- Imagenes solo en Cloudinary
# ladymen_web
