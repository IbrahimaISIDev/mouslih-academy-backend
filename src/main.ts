import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module.js';

async function bootstrap() {
  // rawBody: true — nécessaire pour vérifier la signature HMAC du webhook Wave (WaveWebhookController),
  // qui doit signer le corps brut de la requête, pas le JSON re-sérialisé.
  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.use(helmet());

  app.enableCors({
    origin: (process.env['CORS_ORIGIN'] ?? 'http://localhost:3000').split(','),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.setGlobalPrefix('api');

  await app.listen(process.env['PORT'] ?? 3001);
}
await bootstrap();
