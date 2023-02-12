import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppConfigService } from './config/app/config.service';
import { MikroORM } from '@mikro-orm/core';
import { ProdSeeder } from './providers/database/postgres/seeders/prod.seeder';

function initSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('mvpmatch')
    .setDescription(
      'API for Software Engineering Interview Assignment at mvpmatch',
    )
    .setVersion('1.0')
    .addTag('vending-machine')
    .addBearerAuth({
      in: 'header',
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'jwt',
      description: 'Enter JWT token',
    })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
}

async function prepareDb(app: INestApplication) {
  const orm = app.get<MikroORM>(MikroORM);
  const seeder = orm.getSeeder();
  await seeder.seed(ProdSeeder);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      forbidNonWhitelisted: true,
      whitelist: true,
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(new Reflector()));
  app.enableShutdownHooks();
  initSwagger(app);
  await prepareDb(app);
  await app.listen(app.get(AppConfigService).port);
}
bootstrap().catch((e) =>
  console.error(`Cannot start server due to error: ${e}`),
);
