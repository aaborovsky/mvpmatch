import {
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
  Cascade,
} from '@mikro-orm/core';
import { User } from '../../users/entities/user.entity';

export type SessionId = number;

@Entity()
export class Session {
  @PrimaryKey({ type: 'integer', autoincrement: true })
  id: SessionId;

  @ManyToOne({ lazy: true, unique: true, cascade: [Cascade.REMOVE] })
  user: User;

  @Property({
    type: 'datetime',
    defaultRaw: 'now()',
    hidden: true,
    name: 'createdAt',
  })
  private _createdAt: Date;

  @Property()
  createdAt() {
    return this._createdAt;
  }
}
