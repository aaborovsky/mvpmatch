import { Dictionary } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { VendingMachine } from '../../../../vending-machine/entitites/vending-machine.entity';
import { Coin } from '../../../../types';
import { faker, Seeder } from '@mikro-orm/seeder';
import { Product } from '../../../../products/entities/product.entity';
import { User } from '../../../../users/entities/user.entity';
import { Role } from '../../../../roles/role.enum';
import { hashPassword } from '../../../../users/utils/hashPassword.util';

export class TestSeeder extends Seeder {
  async run(em: EntityManager, context: Dictionary): Promise<void> {
    const vm = em.create(VendingMachine, {
      coins: {
        [Coin.FIFTY]: 5,
        [Coin.TWENTY]: 10,
        [Coin.TEN]: 20,
        [Coin.FIVE]: 50,
      },
      balance: 0,
    });

    const seller = em.create(User, {
      username: 'seller1',
      password: await hashPassword('seller1Password'),
      coins: {},
      deposit: 0,
      role: Role.SELLER,
      vendingMachine: vm,
    });

    //to make repetitive generation
    faker.seed(42);

    //expensive product
    em.create(Product, {
      cost: parseFloat(faker.commerce.price(0.05, 15.15, 2)),
      amountAvailable: parseInt(faker.commerce.price(1, 5, 0)),
      productName: faker.commerce.productName(),
      seller,
    });

    //cheap product
    em.create(Product, {
      cost: parseFloat(faker.commerce.price(0.05, 3.75, 2)),
      amountAvailable: parseInt(faker.commerce.price(1, 20, 0)),
      productName: faker.commerce.productName(),
      seller,
    });

    //buyer1
    const buyer1 = em.create(User, {
      username: 'buyer1',
      password: await hashPassword('buyer1Password'),
      coins: {},
      deposit: 0,
      role: Role.BUYER,
      vendingMachine: vm,
    });

    //buyer2
    const buyer2 = em.create(User, {
      username: 'buyer2',
      password: await hashPassword('buyer2Password'),
      coins: {},
      deposit: 0,
      role: Role.BUYER,
      vendingMachine: vm,
    });
  }
}
