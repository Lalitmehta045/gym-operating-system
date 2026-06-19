// ============================================================================
// GymOS — Application Bootstrap
// ============================================================================

import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module.js';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import helmet from 'helmet';
import compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const logger = new Logger('Bootstrap');

  const httpAdapterHost = app.get(HttpAdapterHost);

  // ── Global API prefix ──
  app.setGlobalPrefix('api/v1');

  // ── Global validation pipe — strips unknown fields, auto-transforms DTOs ──
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ── Global exception filter — consistent JSON error responses ──
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

  // ── Compression (gzip/brotli) for JSON responses ──
  app.use(compression());

  // ── Helmet Security Headers ──
  app.use(helmet());

  // ── Strict CORS ──
  const frontendUrl = process.env.FRONTEND_URL;
  const allowedOrigins = frontendUrl
    ? frontendUrl.split(',').map((url) => url.trim())
    : ['http://localhost:3000', 'http://localhost:3001'];
  
  // Ensure the deployed Vercel frontend is always allowed
  if (!allowedOrigins.includes('https://gym-operating-system.vercel.app')) {
    allowedOrigins.push('https://gym-operating-system.vercel.app');
  }

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type,Accept,Authorization',
    maxAge: 3600, // Cache preflight response for 1 hour
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`🚀 GymOS API running on http://localhost:${port}/api/v1`);
}
bootstrap();
