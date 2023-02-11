import {
  IsAlphanumeric,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { Role } from '../../roles/role.enum';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @IsAlphanumeric()
  username: string;

  @IsString()
  @IsStrongPassword()
  password: string;

  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;
}
