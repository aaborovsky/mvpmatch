import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Role } from '../roles/role.enum';
import { JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt/dist/interfaces';
import { DatabaseProviderModule } from '../providers/database/postgres/provider.module';

const TEST_JWT_SECRET = 'test-jwt-secret';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        DatabaseProviderModule,
        UsersModule,
        PassportModule,
        JwtModule.register({
          secret: TEST_JWT_SECRET,
          signOptions: { expiresIn: '60s' },
        }),
      ],
      providers: [UsersService, AuthService, LocalStrategy, JwtStrategy],
    }).compile();

    service = moduleRef.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

describe('validateUser', () => {
  let service: AuthService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        UsersModule,
        PassportModule,
        JwtModule.register({
          secret: TEST_JWT_SECRET,
          signOptions: { expiresIn: '60s' },
        }),
      ],
      providers: [AuthService, LocalStrategy, JwtStrategy],
    })
      .useMocker((token) => {
        if (token === UsersService) {
          return {
            findOneByUsername: jest
              .fn()
              .mockImplementation(async (username: string) => {
                if (username === 'proper_user') {
                  const user = new User();
                  user.id = 123;
                  user.username = username;
                  const passwordHashed = await bcrypt.hash('guess', 'testSalt');
                  user.password = passwordHashed;
                  user.role = Role.BUYER;
                }
                return null;
              }),
          } as Partial<UsersService>;
        } else if (token == JwtService) {
          return {
            verify: jest
              .fn()
              .mockImplementation(
                (token: string, options?: JwtVerifyOptions) => {
                  throw new Error('Unimplemented');
                },
              ),
            sign: jest
              .fn()
              .mockImplementation(
                (
                  payload: string | Buffer | object,
                  options?: JwtSignOptions,
                ) => {
                  throw new Error('Unimplemented');
                },
              ),
          } as Pick<JwtService, 'verify' | 'sign'>;
        }
      })
      .compile();

    service = moduleRef.get<AuthService>(AuthService);
  });

  it('should return a user object when credentials are valid', async () => {
    const res = await service.validateUser('proper_user', 'guess');
    expect(res?.id).toEqual(123);
  });

  it('should return null when credentials are invalid', async () => {
    const res = await service.validateUser('xxx', 'xxx');
    expect(res).toBeNull();
  });

  it('should not return password field', async () => {
    const res = await service.validateUser('proper_user', 'guess');
    expect(res?.id).toEqual(123);
  });
});

describe('validateLogin', () => {
  let service: AuthService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        UsersModule,
        PassportModule,
        JwtModule.register({
          secret: TEST_JWT_SECRET,
          signOptions: { expiresIn: '60s' },
        }),
      ],
      providers: [AuthService, LocalStrategy, JwtStrategy],
    }).compile();

    service = moduleRef.get<AuthService>(AuthService);
  });

  it('should return JWT object when credentials are valid', async () => {
    const res = await service.login({ username: 'proper_user', id: 123 });
    expect(res.access_token).toBeDefined();
  });
});
