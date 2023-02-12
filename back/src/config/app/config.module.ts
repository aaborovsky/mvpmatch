import { ConfigModule } from '@nestjs/config';
import configuration from './configuration';
import * as Joi from 'joi';
import { Module } from '@nestjs/common';
import { AppConfigService } from './config.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', `.env.${process.env.NODE_ENV}`],
      load: [configuration],
      validationSchema: Joi.object({
        PORT: Joi.number().port().required(),
        JWT_SECRET: Joi.string().required(),
      }),
    }),
  ],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AppConfigModule {}
