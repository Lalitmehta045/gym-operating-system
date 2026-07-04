import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { ThrottlerModule } from '@nestjs/throttler';

describe('Auth Throttling (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 429 after 5 login attempts in a minute', async () => {
    const loginPayload = {
      email: 'test-throttle@example.com',
      password: 'password123',
    };

    // First 5 attempts should not be 429 (could be 400, 401, 404, or 200 depending on DB state)
    for (let i = 0; i < 5; i++) {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send(loginPayload);
      expect(res.status).not.toBe(429);
    }

    // 6th attempt should be rate limited
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send(loginPayload);
    
    expect(res.status).toBe(429);
  });
});
