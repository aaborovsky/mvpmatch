import { Test, TestingModule } from '@nestjs/testing';
import { VendingMachineService } from './vending-machine.service';

describe('VendingMachineService', () => {
  let service: VendingMachineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VendingMachineService],
    }).compile();

    service = module.get<VendingMachineService>(VendingMachineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
