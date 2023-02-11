import { Coin } from '../../types';

export const getCoinsFromDenominationMap = (
  coins: Record<Coin, number>,
): Array<Coin> =>
  Object.entries<number>(coins).reduce(
    (result, [coin, count]) =>
      result.concat(
        ...new Array<Coin>(count).fill(parseInt(coin) as Coin, 0, count),
      ),
    [] as Array<Coin>,
  );
