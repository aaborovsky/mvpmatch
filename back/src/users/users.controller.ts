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
  ForbiddenException,
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
import { CreateUserResponseDto } from './dto/create-user.response.dto';
import { plainToClass } from 'class-transformer';
import { AuthenticatedUserDto } from '../auth/dto/authenticated-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return plainToClass(
      CreateUserResponseDto,
      //only Buyer role opened for self registration
      await this.usersService.create({ ...createUserDto, role: Role.BUYER }),
    );
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
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const user = await this.usersService.findOne(+id);
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(UserIsAdminOrCurrentInterceptor)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: Request,
  ) {
    const user = req.user as AuthenticatedUserDto;
    if ('role' in updateUserDto && user.role !== Role.ADMIN) {
      throw new ForbiddenException("Only admin could change user's role");
    }
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
