import { Coin } from '../../types';

export const getMinCoinAmount = () => {
  let result: number = Number.POSITIVE_INFINITY;
  for (const item in Coin) {
    const coinDenomination = Number(item);
    if (!Number.isNaN(coinDenomination)) {
      result = Math.min(coinDenomination, result);
    }
  }
  return result / 100;
};
