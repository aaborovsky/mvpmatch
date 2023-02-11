import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateProductDto {
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
}
