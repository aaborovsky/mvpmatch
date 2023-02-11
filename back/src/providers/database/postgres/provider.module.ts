import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import getMikroORMConfig from './mikro-orm.config';

@Module({
  imports: [
    MikroOrmModule.forRootAsync({
      useFactory: getMikroORMConfig,
    }),
  ],
})
export class DatabaseProviderModule {}
