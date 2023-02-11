import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppConfigService } from './config/app/config.service';

function initSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('mvpmatch')
    .setDescription(
      'API for Software Engineering Interview Assignment at mvpmatch',
    )
    .setVersion('1.0')
    .addTag('streams')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableShutdownHooks();
  initSwagger(app);
  await app.listen(app.get(AppConfigService).port);
}
bootstrap().catch((e) =>
  console.error(`Cannot start server due to error: ${e}`),
);
