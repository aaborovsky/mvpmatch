import { Entity, Enum, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Role } from '../../roles/role.enum';
import { VendingMachine } from '../../vending-machine/entitites/vending-machine.entity';
import { Coin } from '../../types';
import { Exclude } from 'class-transformer';
import BigNumber from 'bignumber.js';

export type UserId = number;

@Entity()
export class User {
  @PrimaryKey({ type: 'integer', autoincrement: true })
  id: UserId;

  @Property({ unique: true })
  username: string;

  //hashed password
  @Property()
  @Exclude()
  password: string;

  @Property({ type: 'jsonb', defaultRaw: "'{}'::jsonb" })
  coins: Record<Coin, number>;

  @Property({ persist: false })
  get deposit(): number {
    return Object.entries(this.coins)
      .reduce(
        (result, [coin, amount]) =>
          result.plus(
            new BigNumber(amount).multipliedBy(parseInt(coin) as Coin).div(100),
          ),
        new BigNumber(0),
      )
      .toNumber();
  }

  @Enum()
  role: Role;

  @ManyToOne({ lazy: true })
  vendingMachine: VendingMachine;
}
