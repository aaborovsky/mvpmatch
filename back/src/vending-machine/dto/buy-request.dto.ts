import { IsInt, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { ProductId } from '../../products/entities/product.entity';

export class BuyRequestDto {
  @IsNumber()
  @IsNotEmpty()
  productId: ProductId;

  @IsNumber({
    allowNaN: false,
    allowInfinity: false,
    maxDecimalPlaces: 0,
  })
  @IsNotEmpty()
  @IsPositive()
  @IsInt()
  amount: number;
}
