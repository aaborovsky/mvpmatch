import { Options } from '@mikro-orm/core';
import { DatabaseConfigService } from '../../../config/database/config.service';
import { NestFactory } from '@nestjs/core';
import { DatabaseConfigModule } from '../../../config/database/config.module';
import { User } from '../../../users/entities/user.entity';
import { Product } from '../../../products/entities/product.entity';
import { Session } from '../../../auth/entitites/session.entity';
import { VendingMachine } from '../../../vending-machine/entitites/vending-machine.entity';

export const getMikroORMConfigSync = (
  dbConfigService: DatabaseConfigService,
): Options => {
  return {
    migrations: {
      path: './dist/providers/database/postgres/migrations',
      pathTs: './src/providers/database/postgres/migrations',
    },
    entities: [User, Product, Session, VendingMachine],
    //disable auto, rely on migrations
    ensureIndexes: false,
    ensureDatabase: false,
    type: 'postgresql',
    discovery: {
      warnWhenNoEntities: true,
    },
    dbName: dbConfigService.dbName, // process.env.DB_NAME,
    host: dbConfigService.dbHost,
    port: dbConfigService.dbPort,
    user: dbConfigService.user,
    password: dbConfigService.password,
    implicitTransactions: false,
    schemaGenerator: {
      createForeignKeyConstraints: true,
    },
  };
};

const getMikroORMConfig = async (): Promise<Options> => {
  const app = await NestFactory.createApplicationContext(DatabaseConfigModule);
  return getMikroORMConfigSync(app.get(DatabaseConfigService));
};

export default getMikroORMConfig;
