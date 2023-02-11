import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { RolesModule } from '../roles/roles.module';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from './entities/user.entity';
import { DatabaseProviderModule } from '../providers/database/postgres/provider.module';
import { VendingMachineModule } from '../vending-machine/vending-machine.module';

@Module({
  imports: [
    DatabaseProviderModule,
    MikroOrmModule.forFeature([User]),
    RolesModule,
    VendingMachineModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
