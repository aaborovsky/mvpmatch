import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';
import { Exclude } from 'class-transformer';
import { User } from '../../users/entities/user.entity';

export class CreateProductResponseDto {
  @IsNumber()
  @IsInt()
  @IsPositive()
  amountAvailable: number;

  @IsNumber()
  @IsPositive()
  cost: number;

  @IsString()
  @IsNotEmpty()
  productName: string;

  @Exclude()
  seller: User;
}
