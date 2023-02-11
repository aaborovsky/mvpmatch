import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  NotFoundException,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { RolesGuard } from '../roles/roles.guard';
import { Role } from '../roles/role.enum';
import { RolesRequired } from '../roles/roles.decorator';
import { UserIsAdminOrCurrentInterceptor } from './user-is-admin-or-current.interceptor';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesRequired(Role.ADMIN)
  @Get()
  findAll(@Req() req: Request) {
    return this.usersService.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(UserIsAdminOrCurrentInterceptor)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    const user = this.usersService.findOne(+id);
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(UserIsAdminOrCurrentInterceptor)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(UserIsAdminOrCurrentInterceptor)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
