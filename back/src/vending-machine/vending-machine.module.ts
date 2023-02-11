import { Module } from '@nestjs/common';
import { VendingMachineService } from './vending-machine.service';
import { VendingMachineController } from './vending-machine.controller';
import { VendingMachine } from './entitites/vending-machine.entity';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { DatabaseProviderModule } from '../providers/database/postgres/provider.module';

@Module({
  imports: [
    DatabaseProviderModule,
    MikroOrmModule.forFeature([VendingMachine]),
  ],
  providers: [VendingMachineService],
  controllers: [VendingMachineController],
  exports: [VendingMachineService],
})
export class VendingMachineModule {}
