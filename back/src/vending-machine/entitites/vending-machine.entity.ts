import {
  Check,
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Coin } from '../../types';

export type VendingMachineId = number;

@Entity()
export class VendingMachine {
  @PrimaryKey({ type: 'integer', autoincrement: true })
  id: VendingMachineId;

  @Property({ type: 'json', defaultRaw: '{}', hidden: true })
  coins: Record<Coin, number>;

  @Property({ persist: false })
  get balance(): number {
    return Object.entries(this.coins).reduce(
      (result, [coin, amount]) => result + amount * (parseInt(coin) as Coin),
      0,
    );
  }
}
