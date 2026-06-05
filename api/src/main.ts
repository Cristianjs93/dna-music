import { ConsoleLogger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { setupSwagger } from '#/config/swagger.config.js';
import { setupSecurityMiddleware } from '#/config/security.config.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: new ConsoleLogger({
      logLevels: ['log', 'debug', 'error', 'warn'],
      json: true,
      colors: true,
      compact: true,
    }),
  });

  const configService = app.get(ConfigService);

  setupSecurityMiddleware(app, configService);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  setupSwagger(app);

  const port = configService.get<string>('PORT', '3000');
  await app.listen(port);

  const url = await app.getUrl();
  console.log(`Server is running on ${url}`);
  console.log(`Swagger docs: ${url}/api/docs`);
}
bootstrap();
