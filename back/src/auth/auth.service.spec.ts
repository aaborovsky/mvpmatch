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
import { Session, SessionId } from './entitites/session.entity';
import { Role } from '../roles/role.enum';

const TEST_JWT_SECRET = 'test-jwt-secret';

describe('AuthService', () => {
  let service: AuthService;
  let user: User;
  let session: Session;
  let sessionRepository: {
    create: jest.Mock<any, any>;
    findOneOrFail: jest.Mock<any, any>;
  };

  beforeAll(async () => {
    user = new User();
    user.id = 123;
    user.role = Role.BUYER;
    user.username = 'proper_user';
    user.password = await hashPassword('guess');

    session = new Session();
    session.user = user;
    session.id = 321;
  });

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule,
        JwtModule.registerAsync({
          useFactory: () => ({
            secret: TEST_JWT_SECRET,
            signOptions: {
              expiresIn: '365d',
            },
          }),
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
            create: jest
              .fn()
              .mockImplementation(async (entityData) => entityData),
            findOneOrFail: jest
              .fn()
              .mockImplementation(async ({ id }: { id: SessionId }) => {
                if (id === session.id) {
                  return session;
                }
                throw new Error('Session doesnt exist');
              }),
          });
        }
        if (token === UsersService) {
          return {
            findOneByUsernameWithSession: jest
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

    await moduleRef.init();

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
        sessionId: session.id,
        id: user.id,
        username: user.username,
        role: user.role,
      });
      expect(res.access_token).toBeDefined();
    });

    it('should throw error when credentials are wrong', () => {
      // noinspection ES6MissingAwait
      return expect(
        service.signJWTToken({
          id: user.id + 100,
          username: user.username,
          role: user.role,
          sessionId: session.id + 100,
        }),
      ).rejects.toEqual(new Error('Session doesnt exist'));
    });
  });
});
