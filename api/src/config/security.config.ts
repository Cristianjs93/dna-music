import type { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';

const DEFAULT_CORS_ORIGINS = ['http://localhost:5173', 'http://localhost:3000'] as const;

export function parseCorsOrigins(raw: string | undefined): string[] {
  if (!raw?.trim()) {
    return [...DEFAULT_CORS_ORIGINS];
  }

  return raw
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}

export function setupSecurityMiddleware(
  app: NestExpressApplication,
  configService: ConfigService,
): void {
  const bodyLimit = configService.get<string>('BODY_SIZE_LIMIT', '100kb');

  app.use(helmet());
  app.useBodyParser('json', { limit: bodyLimit });
  app.useBodyParser('urlencoded', { extended: true, limit: bodyLimit });

  app.enableCors({
    origin: parseCorsOrigins(configService.get<string>('CORS_ORIGINS')),
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    credentials: true,
  });
}
