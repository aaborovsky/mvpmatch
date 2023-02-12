import { Entity, Enum, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Role } from '../../roles/role.enum';
import { VendingMachine } from '../../vending-machine/entitites/vending-machine.entity';
import { Coin } from '../../types';
import { Exclude } from 'class-transformer';

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
    return Object.entries(this.coins).reduce(
      (result, [coin, amount]) => result + amount * (parseInt(coin) as Coin),
      0,
    );
  }

  @Enum()
  role: Role;

  @ManyToOne({ lazy: true })
  vendingMachine: VendingMachine;
}
