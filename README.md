# One Million Test API

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white) 
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white) 
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

Proyecto base de prueba técnica para gestión de leads e IA, construido con arquitectura modular bajo los estándares de _Clean Architecture_ y _Secure by Default_.

## Características Implementadas (Fase 1)

* **Arquitectura:** Modular orientada a dominios (`LeadsModule`, `AuthModule`, `AiModule`, `PrismaModule`).
* **Base de Datos:** PostgreSQL 15 integrado vía Prisma ORM con modelo `Lead` incluyendo borrado lógico (`deletedAt`).
* **Seguridad (Secure By Default):** 
  * Autenticación con JWT (Passport) global a nivel de aplicación mediante `JwtAuthGuard`. Endpoints expuestos a través de `@Public()`.
  * Rate-Limiting estricto (10 peticiones por 60 segundos) usando `@nestjs/throttler`.
  * Validación general de DTOs con `ValidationPipe`.
* **Pruebas Integradas:** Seed de Prisma con 1 usuario admin y 10 leads generados automáticamente en el aprovisionamiento.
* **Documentación:** OpenAPI (Swagger) montada con soporte para JWT Bearer Auth.

## Despliegue con Docker

Tanto la API como la Base de Datos están completamente dockerizadas y orquestadas vía Docker Compose, listas para entorno de desarrollo/producción gracias a un Dockerfile multi-stage con optimización de dependencias (`alpine` + `openssl`).

### Levantar el ecosistema

1. Clona este proyecto y entra en el directorio raíz.
2. Ejecuta el comando mágico:
   ```bash
   docker-compose up --build -d
   ```
   *Esto descargará, construirá y levantará la BD y la API en puertos estándar.*

3. Verifica el estado en Docker Desktop. El contenedor `one-million-api` estará exponiendo los servicios.

### Documentación API (Swagger)

Una vez que los contenedores estén corriendo exitosamente, la documentación interactiva de toda la aplicación será visible aquí:
**[http://localhost:3000/docs](http://localhost:3000/docs)**

Podrás interactuar con todos los endpoints. Para probar rutas protegidas, primero usa el endpoint `POST /api/auth/login` introduciendo las credenciales por defecto insertadas por nuestro _seeder_:

```json
{
  "email": "admin@one-million.com",
  "password": "hashed_password_placeholder"
}
```

Al obtener tu Token JWT, añádelo haciendo clic en el candado **"Authorize"** en la parte superior derecha de Swagger. Teniendo la sesión iniciada podrás:
* `GET /api/leads`: Obtener Leads generados (con borrado lógico manejado).
* `PATCH /api/leads/:id`: Modificar propiedades de un Lead.
* `POST /api/leads/webhook`: Endpoint simulador de Typeform, público (`@Public()`) que no requiere token.

## Scripts Locales

Si deseas probar localmente sin el contenedor de la API (solo usando docker para Postgres):
```bash
# Instalar dependencias puras (Asegúrate de tener Node 20+)
npm install

# Levantar DB local
docker-compose up -d postgres

# Sincronizar Prisma y poblar
npx prisma generate
npx prisma db push
npm run prisma:seed

# Modo desarrollo
npm run start:dev
```
