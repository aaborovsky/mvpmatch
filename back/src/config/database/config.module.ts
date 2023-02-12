import { ConfigModule } from '@nestjs/config';
import configuration from './configuration';
import * as Joi from 'joi';
import { Module } from '@nestjs/common';
import { DatabaseConfigService } from './config.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', `.env.${process.env.NODE_ENV}`],
      load: [configuration],
      validationSchema: Joi.object({
        DB_NAME: Joi.string().required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().port().required(),
        DB_USER: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
      }),
    }),
  ],
  providers: [DatabaseConfigService],
  exports: [DatabaseConfigService],
})
export class DatabaseConfigModule {}
