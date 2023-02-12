import {Body, Controller, HttpStatus, Post, Req, UseGuards} from '@nestjs/common';
import { LoginRequestDto } from './dto/login-request.dto';
import { Request } from 'express';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { AuthenticatedUserDto } from './dto/authenticated-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(
    //not used, but it will force request body validation
    @Body() requestBody: LoginRequestDto,
    @Req() request: Request,
  ) {
    return this.authService.signJWTToken(request.user as AuthenticatedUserDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('logout/all')
  async all(@Req() request: Request) {
    return this.authService.logoutAllSessions(
      request.user as AuthenticatedUserDto,
    );
  }
}
