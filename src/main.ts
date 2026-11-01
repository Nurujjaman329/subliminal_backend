import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  const uploadDir = config.get<string>('UPLOAD_DIR', 'uploads');
  const uploadPath = join(process.cwd(), uploadDir);
  if (!existsSync(uploadPath)) {
    mkdirSync(uploadPath, { recursive: true });
  }

  app.useStaticAssets(uploadPath, { prefix: '/uploads' });
  app.setGlobalPrefix('api');

  const corsOrigins = (
    config.get<string>('CORS_ORIGINS') ??
    'http://localhost:3002,http://127.0.0.1:3002'
  )
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = config.get<number>('PORT', 8080);
  const host = config.get<string>('BACKEND_IP', '0.0.0.0');
  await app.listen(port, host);

  const appUrl =
    config.get<string>('APP_URL') ?? `http://localhost:${port}`;
  // eslint-disable-next-line no-console
  console.log(`Subliminal API running on ${appUrl}/api (bind ${host}:${port})`);
  // eslint-disable-next-line no-console
  console.log(`CORS origins: ${corsOrigins.join(', ')}`);
}

void bootstrap();
