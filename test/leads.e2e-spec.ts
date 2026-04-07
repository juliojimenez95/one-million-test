import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { SourceType } from '@prisma/client';

describe('LeadsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;

  beforeAll(async () => {
    // Forzamos 127.0.0.1 y JWT_SECRET para el entorno local de pruebas
    process.env.DATABASE_URL = 'postgresql://postgres:postgres@127.0.0.1:5432/onemillion?schema=public';
    process.env.JWT_SECRET = 'super_secret_jwt_key_12345';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Configuración global idéntica a main.ts
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );

    await app.init();
    prisma = app.get(PrismaService);

    // Asegurar que existe un usuario admin con la contraseña correcta para obtener el token
    await prisma.user.upsert({
      where: { email: 'admin@one-million.com' },
      update: { password: 'hashed_password_placeholder' },
      create: {
        email: 'admin@one-million.com',
        password: 'hashed_password_placeholder',
      },
    });

    // Obtener token JWT usando las credenciales reales
    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'admin@one-million.com',
        password: 'hashed_password_placeholder',
      });
    
    accessToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /leads', () => {
    it('debe registrar un lead con éxito (201)', async () => {
      const email = `test-${Date.now()}@e2e.com`;
      const response = await request(app.getHttpServer())
        .post('/api/leads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          nombre: 'Test User',
          email: email,
          fuente: SourceType.instagram,
        });

      expect(response.status).toBe(201);
      expect(response.body.email).toBe(email);
    });

    it('debe fallar con 400 por email inválido', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/leads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          nombre: 'Fail',
          email: 'not-an-email',
          fuente: SourceType.landing_page,
        });

      expect(response.status).toBe(400);
    });
  });

  describe('Seguridad', () => {
    it('debe denegar acceso sin token (401)', async () => {
      const response = await request(app.getHttpServer()).get('/api/leads');
      expect(response.status).toBe(401);
    });
  });

  describe('Soft Delete', () => {
    it('debe aplicar borrado lógico y ocultarlo de la lista (200)', async () => {
      // 1. Crear
      const lead = await prisma.lead.create({
        data: { nombre: 'Borrar Me', email: `del-${Date.now()}@test.com`, fuente: SourceType.otro }
      });

      // 2. Borrar
      await request(app.getHttpServer())
        .delete(`/api/leads/${lead.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // 3. Verificar en API (no debería estar)
      const list = await request(app.getHttpServer())
        .get('/api/leads')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(list.body.data.some((l: any) => l.id === lead.id)).toBe(false);

      // 4. Verificar en DB directamente (debe seguir allí)
      const dbRecord = await prisma.lead.findUnique({ where: { id: lead.id } });
      expect(dbRecord?.deletedAt).not.toBeNull();
    });
  });

  describe('Webhook', () => {
    it('debe recibir leads de Typeform públicamente (201)', async () => {
      const payload = {
        event_id: 'ev-001',
        event_type: 'form_response',
        form_response: {
          form_id: 'tf-1',
          token: 'tk-1',
          submitted_at: '2026-04-06T00:00:00Z',
          answers: [
            { type: 'email', email: `webhook-${Date.now()}@test.com`, field: { id: '1', type: 'email' } },
            { type: 'text', text: 'Webhook User', field: { id: '2', type: 'short_text', ref: 'name' } }
          ]
        }
      };

      const response = await request(app.getHttpServer())
        .post('/api/leads/webhook')
        .send(payload);

      expect(response.status).toBe(201);
    });
  });
});
