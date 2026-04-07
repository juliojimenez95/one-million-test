# One Million Test API 🚀

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white) 
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white) 
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)

API robusta para la gestión inteligente de leads con integración de IA, diseñada bajo principios de **Clean Architecture**, **SOLID** y **Secure by Default**.

---

## 📑 Tabla de Contenidos
* [🚀 Despliegue Rápido (Docker)](#-despliegue-rápido-docker)
* [🏗️ Arquitectura y Stack](#️-arquitectura-y-stack)
* [🤖 Motor de IA (Requerimiento Punto 3)](#-motor-de-ia-requerimiento-punto-3)
* [🔒 Seguridad y Manejo de Errores](#-seguridad-y-manejo-de-errores)
* [📚 Documentación de Endpoints](#-documentación-de-endpoints)
* [✍️ Ensayo Teórico (Punto 4)](#️-ensayo-teórico-punto-4)

---

## 🚀 Despliegue Rápido (Docker)

El ecosistema está totalmente automatizado. Al levantar los contenedores, se ejecuta automáticamente el aprovisionamiento de la base de datos, migraciones de Prisma y el **Seeding** de datos iniciales.

### 1. Configurar variables de entorno:
Crea una copia del archivo de ejemplo:
```bash
cp .env.example .env
```

### 2. Levantar el proyecto:
El ecosistema está automatizado. Al levantar, se ejecutan las migraciones y el Seeding:
```bash
docker-compose up --build -d
```

### 2. Acceso a servicios:
- **Base URL:** `http://localhost:3000/api`
- **Swagger Documentation:** `http://localhost:3000/api/docs`

### 3. Credenciales de Prueba (Admin):
- **Email:** `admin@one-million.com`
- **Password:** `admin123`

> Usa estas credenciales en el endpoint `POST /auth/login` para obtener tu Token JWT.

---

## 🏗️ Arquitectura y Stack

La aplicación sigue una estructura modular para facilitar el mantenimiento y escalabilidad:

- **Framework:** NestJS con TypeScript.
- **ORM:** Prisma con PostgreSQL 15.
- **Validación:** `class-validator` para asegurar la integridad de los DTOs.
- **Contenedores:** Docker & Docker Compose para un entorno reproducible.

---

## 🤖 Motor de IA (Requerimiento Punto 3)

Se implementó un servicio de IA resiliente que procesa datos de leads en tiempo real:

- **Análisis Individual:** `GET /leads/:id/ai-summary` — Evalúa el potencial de un lead y asigna prioridad.
- **Análisis Grupal:** `POST /leads/ai/summary` — Recibe filtros dinámicos (fuente, rango de fechas) y genera un reporte ejecutivo de métricas.

> [!IMPORTANT]
> **Estrategia de Resiliencia (Mocking):** El sistema detecta automáticamente la presencia de la `OPENAI_API_KEY` en el `.env`. En su ausencia, el `AiService` conmuta a un **Mock Dinámico** que analiza los datos reales de la DB para generar el reporte, garantizando que la funcionalidad siempre esté disponible.

---

## 🔒 Seguridad y Manejo de Errores

- **Auth:** JWT Strategy con protección global mediante `JwtAuthGuard`.
- **Validación de Negocio:** Manejo de conflictos de duplicidad (Email) devolviendo `409 Conflict`.
- **Persistencia:** Implementación de Borrado Lógico (`deletedAt`) para cumplimiento de integridad de datos.
- **Estandarización:** Respuestas de error consistentes y documentadas en Swagger.

---

## 📚 Documentación de Endpoints

| Módulo | Endpoint | Acceso | Descripción |
|--------|----------|--------|-------------|
| Auth | `POST /auth/login` | Público | Generación de Bearer Token. |
| Leads | `GET /leads` | Protegido | Listado con filtros y paginación. |
| IA | `POST /leads/ai/summary` | Protegido | Generación de resumen ejecutivo grupal. |
| Webhook | `POST /leads/webhook` | Público | Recepción de leads desde Typeform. |

### 🔗 Webhook (Integración Externa)

Se implementó un endpoint para recibir leads automáticamente desde **Typeform**.

- **Endpoint:** `POST /api/leads/webhook`
- **Seguridad:** Acceso público (sin JWT) para permitir integraciones de terceros.
- **Lógica:** Los datos se mapean automáticamente a la estructura interna, asignando `landing_page` como fuente predeterminada.

#### 🛠️ Cómo probarlo (Payload Typeform)

Envía este JSON al endpoint `POST /api/leads/webhook`:

```json
{
  "event_id": "01EYW...",
  "event_type": "form_response",
  "form_response": {
    "form_id": "LsnS71",
    "token": "ad732f743df07e2c047192ea60d5b597",
    "submitted_at": "2026-04-06T22:25:00Z",
    "answers": [
      { "type": "email", "email": "lead.typeform@test.com", "field": { "id": "1", "type": "email" } },
      { "type": "text", "text": "Evaluador One Million", "field": { "id": "2", "type": "short_text", "ref": "name" } }
    ]
  }
}
```

**Comando rápido via Terminal:**
```bash
curl -X POST http://localhost:3000/api/leads/webhook -H "Content-Type: application/json" -d '{"event_id":"01","event_type":"form_response","form_response":{"form_id":"1","token":"tk","submitted_at":"now","answers":[{"type":"email","email":"test@webhook.com","field":{"id":"1","type":"email"}},{"type":"text","text":"Lead Webhook","field":{"id":"2","type":"short_text","ref":"name"}}]}}'
```

---

## ✍️ Ensayo Teórico (Punto 4)

El análisis sobre la transformación de la creación de contenido mediante IA y su impacto en la viralidad se encuentra documentado en el siguiente archivo:

👉 [Consultar ENSAYO.md](./ENSAYO.md)

---

> 💡 **Nota del Desarrollador**
>
> Este proyecto demuestra habilidades en arquitectura de microservicios, integración de servicios de terceros (LLMs) y despliegue automatizado. La lógica está desacoplada para permitir el cambio de modelos de IA sin afectar el core del negocio.