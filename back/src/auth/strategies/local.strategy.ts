import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { User } from '../../users/entities/user.entity';
import { AuthenticatedUserDto } from '../dto/authenticated-user.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async validate(
    username: string,
    password: string,
  ): Promise<AuthenticatedUserDto> {
    const user = await this.authService.checkCredentials(username, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
