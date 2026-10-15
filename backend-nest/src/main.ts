import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  const isProd = config.get<string>('NODE_ENV') === 'production';
  const prefix = config.get<string>('API_PREFIX', '');

  app.use(helmet());
  app.use(cookieParser());

  if (prefix) {
    app.setGlobalPrefix(prefix);
  }

  app.enableCors({
    origin: config
      .get<string>('CLIENT_HOST', 'http://localhost:3000')
      .split(',')
      .map((origin) => origin.trim()),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: false,
      },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  app.enableShutdownHooks();

  // На Vercel/Render бекенд стоїть за зворотним проксі, тому треба
  // довіряти X-Forwarded-*, інакше req.ip буде адресою проксі
  // (а rate limiter вимірятиме всіх користувачів однією миттю).
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  if (!isProd || config.get<string>('SWAGGER_ENABLED') === 'true') {
    const swagger = new DocumentBuilder()
      .setTitle('Swiftly API')
      .setDescription('Dropshipping platform backend')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    SwaggerModule.setup(
      `${prefix}/docs`,
      app,
      SwaggerModule.createDocument(app, swagger),
    );
  }

  const port = Number(config.get<string>('PORT', '3005'));
  await app.listen(port, '0.0.0.0');

  console.log(`Env:      ${isProd ? 'production' : 'development'}`);
  console.log(`Server:   http://localhost:${port}${prefix ? `/${prefix}` : ''}`);
  console.log(`Health:   http://localhost:${port}${prefix ? `/${prefix}` : ''}/health`);
  if (!isProd) {
    console.log(`Swagger:  http://localhost:${port}${prefix ? `/${prefix}` : ''}/docs`);
  }
}

void bootstrap();