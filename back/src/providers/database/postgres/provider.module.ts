import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { getMikroORMConfigSync } from './mikro-orm.config';
import { DatabaseConfigModule } from '../../../config/database/config.module';
import { DatabaseConfigService } from '../../../config/database/config.service';

@Module({
  imports: [
    MikroOrmModule.forRootAsync({
      imports: [DatabaseConfigModule],
      inject: [DatabaseConfigService],
      useFactory: getMikroORMConfigSync,
    }),
  ],
})
export class DatabaseProviderModule {}
