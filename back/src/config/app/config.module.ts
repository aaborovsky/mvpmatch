import { ConfigModule } from '@nestjs/config';
import configuration from './configuration';
import * as Joi from 'joi';
import { Module } from '@nestjs/common';
import { AppConfigService } from './config.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      validationSchema: Joi.object({
        port: Joi.number().port(),
      }),
    }),
  ],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AppConfigModule {}
