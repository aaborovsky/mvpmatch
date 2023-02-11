import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { User } from '../../users/entities/user.entity';

export type SessionId = number;

@Entity()
export class Session {
  @PrimaryKey({ type: 'integer', autoincrement: true })
  id: SessionId;

  @ManyToOne({ unique: true })
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
