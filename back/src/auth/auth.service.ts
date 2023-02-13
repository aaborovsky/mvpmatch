import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Session, SessionId } from './entitites/session.entity';
import { EntityRepository } from '@mikro-orm/postgresql';
import { AuthenticatedUserDto } from './dto/authenticated-user.dto';
import { User, UserId } from '../users/entities/user.entity';
import { Role } from '../roles/role.enum';

export type JwtPayload = {
  username: string;
  role: Role;
  user_id: UserId;
  sub: string; //SessionId
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectRepository(Session)
    private readonly sessionRepo: EntityRepository<Session>,
  ) {}

  async checkCredentials(username: string, pass: string): Promise<User | null> {
    const user = await this.usersService.findOneByUsernameWithSession(username);
    if (user && (await bcrypt.compare(pass, user.password))) {
      return user;
    }
    return null;
  }

  async signJWTToken(user: AuthenticatedUserDto) {
    let session: Session;
    try {
      session = await this.sessionRepo.findOneOrFail({
        id: user.sessionId,
      });
    } catch (e) {
      //session was not found for some reason
      throw new ForbiddenException(e);
    }
    return {
      access_token: this.jwtService.sign({
        username: user.username,
        role: user.role,
        user_id: user.id,
        sub: String(session.id),
      } as JwtPayload),
      session,
    };
  }

  async logoutAllSessions(user: AuthenticatedUserDto) {
    return this.sessionRepo.createQueryBuilder().delete({ user: user.id });
  }

  async createSession(user: User) {
    try {
      //it would fails due to unique user constraint
      const session = await this.sessionRepo.create({ user });
      await this.sessionRepo.persistAndFlush(session);
      return session;
    } catch (e) {
      throw new BadRequestException(
        'There is already an active session using your account',
      );
    }
  }
}
