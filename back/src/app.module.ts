import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { AuthModule } from './auth/auth.module';
import { VendingMachineModule } from './vending-machine/vending-machine.module';

@Module({
  imports: [UsersModule, ProductsModule, AuthModule, VendingMachineModule],
  providers: [],
  controllers: [],
})
export class AppModule {}
