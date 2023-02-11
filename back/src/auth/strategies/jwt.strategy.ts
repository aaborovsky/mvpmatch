import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfigType } from '../../config/app/configuration';
import { JwtPayload } from '../auth.service';
import { AuthenticatedUserDto } from '../dto/authenticated-user.dto';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Session } from '../entitites/session.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService<AppConfigType>,
    @InjectRepository(Session)
    private readonly sessionRepo: EntityRepository<Session>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      //TODO: consider enable that and implement refresh token technique
      ignoreExpiration: true,
      secretOrKey: configService.get('jwtSecret', { infer: true }),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUserDto> {
    const session = await this.sessionRepo.findOne(payload.sub, {
      populate: ['user'],
    });
    if (!session) {
      throw new UnauthorizedException();
    }
    return {
      sessionId: session.id,
      id: payload.sub,
      username: session.user.username,
      role: session.user.role,
    };
  }
}
