import { BadRequestException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { AuthenticatedUserDto } from '../dto/authenticated-user.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'username', passwordField: 'password' });
  }

  async validate(
    username: string,
    password: string,
  ): Promise<AuthenticatedUserDto> {
    const user = await this.authService.checkCredentials(username, password);
    if (!user) {
      throw new BadRequestException('Wrong credentials');
    }
    return user;
  }
}
