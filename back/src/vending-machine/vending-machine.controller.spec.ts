import { Test, TestingModule } from '@nestjs/testing';
import { VendingMachineController } from './vending-machine.controller';

describe('VendingMachineController', () => {
  let controller: VendingMachineController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VendingMachineController],
    }).compile();

    controller = module.get<VendingMachineController>(VendingMachineController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
