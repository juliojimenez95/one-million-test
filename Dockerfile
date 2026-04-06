# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /usr/src/app

# Instalamos dependencias necesarias para compilar Prisma en Alpine
RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma/
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

# Compilamos el seed a JS (CommonJS) para producción
RUN npx tsc prisma/seed.ts --outDir dist/prisma --module commonjs --esModuleInterop --skipLibCheck

RUN npm prune --production

# Stage 2: Production
FROM node:20-alpine AS production
WORKDIR /usr/src/app

# INSTALAMOS OPENSSL AQUÍ TAMBIÉN (requerido por Prisma)
RUN apk add --no-cache openssl

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/entrypoint.sh ./entrypoint.sh

RUN chmod +x ./entrypoint.sh
RUN chown -R node:node /usr/src/app
USER node

EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]