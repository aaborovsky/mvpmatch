import { BadRequestException, Injectable } from '@nestjs/common';
import { BuyRequestDto } from './dto/buy-request.dto';
import { EntityManager } from '@mikro-orm/postgresql';
import { AuthenticatedUserDto } from '../auth/dto/authenticated-user.dto';
import {
  FlushMode,
  IsolationLevel,
  LockMode,
  QueryOrder,
} from '@mikro-orm/core';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import BigNumber from 'bignumber.js';
import { DepositRequestDto } from './dto/deposit-request.dto';
import { BuyResponseDto } from './dto/buy-response.dto';
import { VendingMachine } from './entitites/vending-machine.entity';
import { withdrawCoins } from './utils/withdrawCoins.util';
import { Coin } from '../types';
import { getCoinsFromDenominationMap } from './utils/getCoinsFromDenominationMap.util';

@Injectable()
export class VendingMachineService {
  constructor(private readonly em: EntityManager) {}

  async getDefaultVendingMachine() {
    const [vm] = await this.em.find(
      VendingMachine,
      {},
      { orderBy: { id: QueryOrder.ASC }, limit: 1 },
    );
    if (!vm) {
      throw new Error('no default vending machine');
    }
    return vm;
  }

  /**
   * Pessimistic lock applied here.
   * @param user
   * @param request
   */
  buy(
    user: AuthenticatedUserDto,
    request: BuyRequestDto,
  ): Promise<BuyResponseDto> {
    return this.em.transactional(
      async (em) => {
        const userEntity = await em.findOneOrFail(
          User,
          { id: user.id },
          /**
           * lock all write and reads with lockMode defined too (especially current buy method running concurrently at this or sibling instance of service),
           * and other piece of code could rely on this data read
           */
          {
            populate: ['vendingMachine'],
            lockMode: LockMode.PESSIMISTIC_WRITE,
          },
        );
        const product = await em.findOneOrFail(
          Product,
          { id: request.productId },
          /**
           * lock all other PESSIMISTIC_WRITE and PESSIMISTIC_READ with lockMode defined too
           * (especially taking in consideration the fact: buy method could run concurrently at this or sibling instance of service),
           * cause one going to change product's
           * available balance and other piece of code could rely on this data read
           */
          { lockMode: LockMode.PESSIMISTIC_WRITE },
        );
        if (product.amountAvailable < request.amount) {
          throw new BadRequestException(
            'No such amount available for selected product',
          );
        }
        const totalToSpend = new BigNumber(request.amount).multipliedBy(
          product.cost,
        );
        if (totalToSpend.gt(userEntity.deposit)) {
          throw new BadRequestException('Insufficient funds');
        }

        const { vendingMachine } = userEntity;
        /**
         * lock all other PESSIMISTIC_WRITE and PESSIMISTIC_READ with lockMode defined too
         * (especially taking in consideration the fact: buy method could run concurrently at this or sibling instance of service),
         * cause one going to change vendingMachine's
         * available coins and other piece of code could rely on this data read
         */
        await em.lock(vendingMachine, LockMode.PESSIMISTIC_WRITE);

        //coins deposited to vendingMachine's coins storage from user
        //put coins on user's deposit, to be able to withdraw exactly these coins in case of reset or spend theme
        Object.entries<number>(userEntity.coins).forEach(([_coin, count]) => {
          const coin = parseInt(_coin) as Coin;
          vendingMachine.coins[coin] =
            vendingMachine.coins[coin] != undefined
              ? vendingMachine.coins[coin] + count
              : count;
        });
        //withdraw coins from user's deposit
        userEntity.coins = {} as Record<Coin, number>;

        const change = withdrawCoins(
          new BigNumber(userEntity.deposit).minus(totalToSpend).toNumber(),
          vendingMachine.coins,
        );

        //Do all modifications to instances and persist them in single transaction commit

        product.amountAvailable -= request.amount;
        change.forEach((coin) => (vendingMachine.coins[coin] = change[coin]));
        await em.persistAndFlush([userEntity, product]);

        return {
          spent: totalToSpend.toNumber(),
          products: ([] as Array<Product>).fill(product, request.amount),
          change,
        };
      },
      {
        //this is the default isolation level for Postgres, just make it explicit
        isolationLevel: IsolationLevel.READ_COMMITTED,
        flushMode: FlushMode.COMMIT,
      },
    );
  }

  async deposit(user: AuthenticatedUserDto, body: DepositRequestDto) {
    return this.em.transactional(
      async (em) => {
        const userEntity = await em.findOneOrFail(
          User,
          { id: user.id },
          /**
           * lock all other PESSIMISTIC_WRITE and PESSIMISTIC_READ with lockMode defined too
           * (especially taking in consideration the fact: deposit method could run concurrently at this or sibling instance of service),
           * and other piece of code could rely on this data read
           */
          {
            populate: ['vendingMachine'],
            lockMode: LockMode.PESSIMISTIC_WRITE,
          },
        );
        //put coins on user's deposit, to be able to withdraw exactly these coins in case of reset or spend theme
        body.coins.forEach((coin) => {
          userEntity.coins[coin] =
            userEntity.coins[coin] != undefined
              ? userEntity.coins[coin] + 1
              : 1;
        });
        await em.persistAndFlush(userEntity);
        return { deposit: userEntity.deposit };
      },
      {
        //this is the default isolation level for Postgres, just make it explicit
        isolationLevel: IsolationLevel.READ_COMMITTED,
        flushMode: FlushMode.COMMIT,
      },
    );
  }

  async reset(user: AuthenticatedUserDto) {
    return this.em.transactional(
      async (em) => {
        const userEntity = await em.findOneOrFail(
          User,
          { id: user.id },
          /**
           * lock all other PESSIMISTIC_WRITE and PESSIMISTIC_READ with lockMode defined too
           * (especially taking in consideration the fact: deposit method could run concurrently at this or sibling instance of service),
           * and other piece of code could rely on this data read
           */
          {
            populate: ['vendingMachine'],
            lockMode: LockMode.PESSIMISTIC_WRITE,
          },
        );
        const { vendingMachine } = userEntity;
        await em.lock(vendingMachine, LockMode.PESSIMISTIC_WRITE);

        const change = getCoinsFromDenominationMap(userEntity.coins);
        userEntity.coins = {} as Record<Coin, number>;

        await em.persistAndFlush([userEntity, vendingMachine]);
        return { change };
      },
      {
        //this is the default isolation level for Postgres, just make it explicit
        isolationLevel: IsolationLevel.READ_COMMITTED,
        flushMode: FlushMode.COMMIT,
      },
    );
  }
}
