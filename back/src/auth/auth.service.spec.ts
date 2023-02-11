import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { UsersService } from '../users/users.service';
import { User, UserId } from '../users/entities/user.entity';
import { hashPassword } from '../users/utils/hashPassword.util';
import { ConfigService } from '@nestjs/config';
import { AppConfigType } from '../config/app/configuration';

const TEST_JWT_SECRET = 'test-jwt-secret';

describe('AuthService', () => {
  let service: AuthService;
  let user: User;
  let sessionRepository: { create: jest.Mock<any, any> };

  beforeAll(async () => {
    user = new User();
    user.id = 123;
    // user.coins = {} as Record<Coin, number>;
    // user.role = Role.BUYER;
    user.username = 'proper_user';
    user.password = await hashPassword('guess');
  });

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule,
        JwtModule.registerAsync({
          useFactory: () => {
            debugger;
            return {
              secret: TEST_JWT_SECRET,
              signOptions: {
                expiresIn: '365d',
              },
            };
          },
        }),
      ],
      providers: [JwtService, AuthService, LocalStrategy, JwtStrategy],
    })
      .useMocker((token) => {
        if (token === ConfigService) {
          return {
            get: (key: keyof AppConfigType) =>
              key === 'jwtSecret' ? TEST_JWT_SECRET : undefined,
          } as Partial<ConfigService<AppConfigType>>;
        }
        if (token === 'SessionRepository') {
          return (sessionRepository = {
            create: jest.fn().mockImplementation((entityData) => entityData),
          });
        }
        if (token === UsersService) {
          return {
            findOneByUsername: jest
              .fn()
              .mockImplementation(async (username: string) =>
                username === user.username ? user : null,
              ),
            findOne: jest
              .fn()
              .mockImplementation(async (id: UserId) =>
                id === user.id ? user : null,
              ),
          } as Partial<UsersService>;
        }
      })
      .compile();

    service = moduleRef.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkCredentials', () => {
    it('should return a user object when credentials are valid', async () => {
      const res = await service.checkCredentials('proper_user', 'guess');
      expect(res?.id).toEqual(123);
    });

    it('should return null when credentials are invalid', async () => {
      const res = await service.checkCredentials('wrong_user', 'guess');
      expect(res).toBeNull();
    });

    it('should not return password field', async () => {
      const res = await service.checkCredentials('proper_user', 'guess');
      expect(res !== null ? 'password' in res : false).toEqual(false);
    });
  });

  describe('signJWTToken', () => {
    it('should create a session when credentials are valid', async () => {
      const res = await service.signJWTToken({
        id: user.id,
        username: user.username,
        role: user.role,
      });
      expect(res.access_token).toBeDefined();
    });

    it('should throw error when credentials are wrong', async () => {
      // noinspection ES6MissingAwait
      expect(
        service.signJWTToken({
          id: user.id + 100,
          username: user.username,
          role: user.role,
        }),
      ).rejects.toEqual(new Error('User doesnt exist'));
    });
  });
});
