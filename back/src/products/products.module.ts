import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { RolesModule } from '../roles/roles.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from '../roles/roles.guard';
import { DatabaseProviderModule } from '../providers/database/postgres/provider.module';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Product } from './entities/product.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    DatabaseProviderModule,
    MikroOrmModule.forFeature([Product]),
    RolesModule,
    UsersModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  // exports: [
  //   {
  //     provide: APP_GUARD,
  //     useClass: RolesGuard,
  //   },
  // ],
})
export class ProductsModule {}
