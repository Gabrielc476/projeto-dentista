import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { SecurityLoggingInterceptor } from './auth/interceptors/security-logging.interceptor';
import { GlobalExceptionFilter } from './presentation/filters/global-exception.filter';
import helmet from 'helmet';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const cookieParser = require('cookie-parser');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security headers with Helmet
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  // Cookie parser for JWT HttpOnly cookies
  app.use(cookieParser());

  // Enable CORS dynamically to allow health check route from any origin (e.g., uptime cron jobs)
  app.enableCors((req: any, callback: any) => {
    const isHealthCheck = req.path === '/health' || req.url === '/health' || req.path?.endsWith('/health');
    const corsOptions = isHealthCheck
      ? {
          origin: true, // Reflects the origin of the request, allowing any origin to hit /health
          credentials: false,
          methods: ['GET', 'OPTIONS'],
          allowedHeaders: ['Content-Type'],
        }
      : {
          origin: process.env.FRONTEND_URL || 'http://localhost:3000',
          credentials: true,
          methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
          allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
        };
    callback(null, corsOptions);
  });

  // Enable validation pipes with whitelist to strip unknown properties
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // Security logging interceptor for vulnerability detection
  app.useGlobalInterceptors(new SecurityLoggingInterceptor());

  // Global exception filter for database errors and user-friendly messages
  app.useGlobalFilters(new GlobalExceptionFilter());

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Backend is running on: http://localhost:${port}`);
  console.log(`🔒 Security features: JWT, CSRF, Rate Limiting, Helmet, Security Audit Logging`);
}
bootstrap();

