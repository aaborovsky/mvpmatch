import { Test, TestingModule } from '@nestjs/testing';
import { VendingMachineController } from './vending-machine.controller';
import { VendingMachineService } from './vending-machine.service';

describe('VendingMachineController', () => {
  let controller: VendingMachineController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VendingMachineController],
    })
      .useMocker((token) => {
        if (token === VendingMachineService) {
          return {};
        }
      })
      .compile();

    controller = module.get<VendingMachineController>(VendingMachineController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
