# ─────────────────────────────────────────────────────
# Stage 1: Build frontend
# ─────────────────────────────────────────────────────
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
ARG VITE_API_URL=""
ARG VITE_WHATSAPP_NUMBER=""
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_WHATSAPP_NUMBER=${VITE_WHATSAPP_NUMBER}
RUN npm run build

# ─────────────────────────────────────────────────────
# Stage 2: Build admin
# ─────────────────────────────────────────────────────
FROM node:20-alpine AS admin-build
WORKDIR /app/admin
COPY admin/package.json admin/package-lock.json ./
RUN npm ci
COPY admin/ ./
ARG VITE_API_URL=""
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

# ─────────────────────────────────────────────────────
# Stage 3: Production backend
# ─────────────────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

# Install sharp dependencies for Alpine
RUN apk add --no-cache vips-dev

COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev

COPY backend/prisma ./prisma
RUN npx prisma generate

COPY backend/src ./src

# Copy built frontend & admin into public directory
COPY --from=frontend-build /app/frontend/dist ./public/frontend
COPY --from=admin-build /app/admin/dist ./public/admin

# Create uploads directory
RUN mkdir -p /app/uploads/images /app/uploads/videos

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the server
CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]
