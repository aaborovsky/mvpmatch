import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AppConfigModule } from '../config/app/config.module';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { DatabaseProviderModule } from '../providers/database/postgres/provider.module';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Session } from './entitites/session.entity';
import { AppConfigService } from '../config/app/config.service';
import { UsersModule } from '../users/users.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => ({
        secret: configService.jwtSecret,
        //TODO: consider implementing refresh token technique
        signOptions: {
          expiresIn: '365d',
        },
      }),
    }),
    DatabaseProviderModule,
    MikroOrmModule.forFeature([Session]),
    UsersModule,
    ConfigModule,
  ],
  providers: [JwtStrategy, LocalStrategy, AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
