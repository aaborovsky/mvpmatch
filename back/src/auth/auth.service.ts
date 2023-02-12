import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Session, SessionId } from './entitites/session.entity';
import { EntityRepository } from '@mikro-orm/postgresql';
import { AuthenticatedUserDto } from './dto/authenticated-user.dto';
import { UserId } from '../users/entities/user.entity';
import { Role } from '../roles/role.enum';
import { ConfigService } from '@nestjs/config';
import { AppConfigType } from '../config/app/configuration';

export type JwtPayload = {
  username: string;
  role: Role;
  user_id: UserId;
  sub: SessionId;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectRepository(Session)
    private readonly sessionRepo: EntityRepository<Session>,
    private readonly configService: ConfigService<AppConfigType>,
  ) {}

  async checkCredentials(
    username: string,
    pass: string,
  ): Promise<AuthenticatedUserDto | null> {
    const user = await this.usersService.findOneByUsername(username);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async signJWTToken(user: AuthenticatedUserDto) {
    const userEntity = await this.usersService.findOne(user.id);
    if (!userEntity) {
      throw new BadRequestException('User doesnt exist');
    }
    let session: Session;
    try {
      //it would fails due to unique user constraint
      session = await this.sessionRepo.create(
        { user: userEntity },
        { persist: true },
      );
      await this.sessionRepo.persistAndFlush(session);
    } catch (e) {
      throw new BadRequestException(
        'There is already an active session using your account',
      );
    }
    return {
      access_token: this.jwtService.sign(
        {
          username: user.username,
          role: user.role,
          user_id: user.id,
          sub: user.id,
        } as JwtPayload,
        //TODO: fix it! no need to pass it, 'JwtModule.register({ secret })' should work
        { secret: this.configService.get('jwtSecret', { infer: true }) },
      ),
      session,
    };
  }

  async logoutAllSessions(user: AuthenticatedUserDto) {
    const sessions = await this.sessionRepo.find({ user: user.id });
    sessions.forEach((session) => this.sessionRepo.remove(session));
    await this.sessionRepo.flush();
  }
}
