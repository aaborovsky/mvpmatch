import { ConfigFactory } from '@nestjs/config/dist/interfaces/config-factory.interface';

export interface AppConfigType {
  port: number;
  jwtSecret: string;
}

export default (() => ({
  port: process.env.PORT ? parseInt(process.env.PORT) : undefined,
  jwtSecret: process.env.JWT_SECRET,
})) as ConfigFactory<AppConfigType>;
