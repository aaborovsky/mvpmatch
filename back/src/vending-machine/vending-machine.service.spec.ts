import { Test, TestingModule } from '@nestjs/testing';
import { VendingMachineService } from './vending-machine.service';
import { EntityManager } from '@mikro-orm/postgresql';

describe('VendingMachineService', () => {
  let service: VendingMachineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VendingMachineService],
    })
      .useMocker((token) => {
        if (token === EntityManager) {
          return {};
        }
      })
      .compile();

    service = module.get<VendingMachineService>(VendingMachineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
