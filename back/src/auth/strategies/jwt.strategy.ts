import { ExtractJwt, JwtFromRequestFunction, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfigType } from '../../config/app/configuration';
import { JwtPayload } from '../auth.service';
import { AuthenticatedUserDto } from '../dto/authenticated-user.dto';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Session, SessionId } from '../entitites/session.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService<AppConfigType>,
    @InjectRepository(Session)
    private readonly sessionRepo: EntityRepository<Session>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      //TODO: consider enable that and implement refresh token strategy
      ignoreExpiration: true,
      secretOrKey: configService.get('jwtSecret', { infer: true }),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUserDto> {
    //one have to load session because it could be invalidated (deleted) with logout/all endpoint
    if (!(await this.sessionRepo.count({ id: Number(payload.sub) }))) {
      throw new UnauthorizedException('Session not found');
    }
    //one could trust JWT payload values, cause whole JWT token was signed and verified by base password-jwt
    return {
      id: payload.user_id,
      username: payload.username,
      role: payload.role,
      sessionId: Number(payload.sub),
    };
  }
}
