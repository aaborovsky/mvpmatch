import { Product } from '../../products/entities/product.entity';
import { Coin } from '../../types';

export class BuyResponseDto {
  spent: number;
  products: Array<Product>;
  change: Array<Coin>;
}
