import { ConfigFactory } from '@nestjs/config/dist/interfaces/config-factory.interface';

export interface DatabaseConfigType {
  dbName: string;
  dbHost: string;
  dbPort: number;
  user: string;
  password: string;
}

export default (() => {
  return {
    dbName: process.env.DB_NAME,
    dbHost: process.env.DB_HOST,
    dbPort: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  };
}) as ConfigFactory<DatabaseConfigType>;
