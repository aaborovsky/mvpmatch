import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { Role } from '../../roles/role.enum';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsEnum(Role)
  @IsInt()
  @IsOptional()
  role: Role;
}
