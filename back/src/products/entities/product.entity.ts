import {
  Check,
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { User } from '../../users/entities/user.entity';

export type ProductId = number;

@Entity()
export class Product {
  @PrimaryKey({ type: 'integer', autoincrement: true })
  id: ProductId;

  @Check<Product>({ expression: (fields) => `${fields.amountAvailable}>=0` })
  @Property({ type: 'integer' })
  amountAvailable: number;

  @Check<Product>({ expression: (fields) => `${fields.cost}>=0` })
  @Property({ type: 'decimal' })
  cost: number;

  @Property()
  productName: string;

  @ManyToOne()
  seller: User;
}
