import {
  IsAlphanumeric,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { Role } from '../../roles/role.enum';
import { VendingMachine } from '../../vending-machine/entitites/vending-machine.entity';
import { Exclude } from 'class-transformer';

export class CreateUserResponseDto {
  @IsString()
  @IsNotEmpty()
  @IsAlphanumeric()
  username: string;

  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;

  @IsEnum(Role)
  @IsNotEmpty()
  @IsInt()
  role: Role;

  @Exclude()
  vendingMachine: VendingMachine;
}
