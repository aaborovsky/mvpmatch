import { Migration } from '@mikro-orm/migrations';

export class Migration20230212194849 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table "vending_machine" ("id" serial primary key, "coins" jsonb not null default \'{}\');',
    );

    this.addSql(
      'create table "user" ("id" serial primary key, "username" varchar(255) not null, "password" varchar(255) not null, "coins" jsonb not null default \'{}\', "role" smallint not null, "vending_machine_id" int not null);',
    );
    this.addSql(
      'alter table "user" add constraint "user_username_unique" unique ("username");',
    );

    this.addSql(
      'create table "session" ("id" serial primary key, "user_id" int null, "createdAt" timestamptz(0) not null default now());',
    );
    this.addSql(
      'alter table "session" add constraint "session_user_id_unique" unique ("user_id");',
    );

    this.addSql(
      'create table "product" ("id" serial primary key, "amount_available" int not null, "cost" numeric(10,0) not null, "product_name" varchar(255) not null, "seller_id" int not null, constraint product_amount_available_check check (amount_available>=0), constraint product_cost_check check (cost>=0));',
    );

    this.addSql(
      'alter table "user" add constraint "user_vending_machine_id_foreign" foreign key ("vending_machine_id") references "vending_machine" ("id") on update cascade;',
    );

    this.addSql(
      'alter table "session" add constraint "session_user_id_foreign" foreign key ("user_id") references "user" ("id") on delete cascade;',
    );

    this.addSql(
      'alter table "product" add constraint "product_seller_id_foreign" foreign key ("seller_id") references "user" ("id") on update cascade;',
    );
  }
}
