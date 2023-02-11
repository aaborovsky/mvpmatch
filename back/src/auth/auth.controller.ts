import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { LoginRequestDto } from './dto/login-request.dto';
import { Request } from 'express';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { AuthenticatedUserDto } from './dto/authenticated-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Body() requestBody: LoginRequestDto, @Req() request: Request) {
    return this.authService.login(request.user as AuthenticatedUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout/all')
  async all(@Body() requestBody: LoginRequestDto, @Req() request: Request) {
    return this.authService.logoutAllSessions(
      request.user as AuthenticatedUserDto,
    );
  }
}
