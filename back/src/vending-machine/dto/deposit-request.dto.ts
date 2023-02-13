import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { Coin } from '../../types';

export class DepositRequestDto {
  @IsArray()
  @IsNotEmpty()
  @IsNumber(
    { allowNaN: false, allowInfinity: false, maxDecimalPlaces: 0 },
    { each: true },
  )
  @IsInt({ each: true })
  @ArrayNotEmpty()
  @IsEnum(Coin, { each: true })
  coins: Array<Coin>;
}
