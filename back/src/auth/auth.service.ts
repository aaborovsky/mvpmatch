import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserId } from '../users/entities/user.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Session, SessionId } from './entitites/session.entity';
import { EntityRepository } from '@mikro-orm/postgresql';
import { AuthenticatedUserDto } from './dto/authenticated-user.dto';

export type JwtPayload = {
  sub: SessionId;
};

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(Session)
    private sessionRepo: EntityRepository<Session>,
  ) {}

  async validateUser(
    username: string,
    pass: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersService.findOneByUsername(username);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: AuthenticatedUserDto) {
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
    } catch (e) {
      throw new BadRequestException(
        'There is already an active session using your account',
      );
    }
    return {
      access_token: this.jwtService.sign({
        username: user.username,
        user_id: user.id,
        sub: session.id,
      } as JwtPayload),
    };
  }

  async logoutAllSessions(user: AuthenticatedUserDto) {
    const sessions = await this.sessionRepo.find({ user: user.id });
    sessions.forEach((session) => this.sessionRepo.remove(session));
    await this.sessionRepo.flush();
  }
}
