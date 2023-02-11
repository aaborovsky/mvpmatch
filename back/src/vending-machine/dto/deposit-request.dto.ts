import { ArrayNotEmpty, IsArray, IsNotEmpty } from 'class-validator';
import { Coin } from '../../types';

export class DepositRequestDto {
  @IsArray({ each: true })
  @IsNotEmpty()
  @ArrayNotEmpty()
  coins: Array<Coin>;
}
