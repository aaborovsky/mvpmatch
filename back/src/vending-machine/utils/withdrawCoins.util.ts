import { Coin } from '../../types';

/**
 * Exported for tests
 * @param coins
 */
export const getBalance = (coins: Record<Coin, number>): number =>
  Object.entries(coins).reduce(
    (result, [coin, count]) => result + parseInt(coin) * count,
    0,
  );

/**
 * Typical cash machine task solution based on dynamic programming
 * @param amount
 * @param coins
 */
export const withdrawCoins = (
  amount: number,
  coinsAvailable: Record<Coin, number>,
): Array<Coin> => {
  if (amount > getBalance(coinsAvailable)) {
    throw new Error('Not enough coins to withdraw');
  }

  /**
   *
   * @param amount
   * @param denominations
   * @return {Array<Coin> | null} return null is amount cannot be withdrawn
   */
  const collect = (
    amount: number,
    denominations: Array<Coin>,
  ): Array<Coin> | null => {
    if (amount === 0) {
      //no additional coins to add to withdraw 0
      return [];
    }
    if (!denominations.length) {
      //no coins rest to withdraw amount
      return null;
    }

    const currentDenomination = denominations[0];
    const availableCount = coinsAvailable[currentDenomination] ?? 0;
    const curDenominationCoinsRequired = Math.floor(
      amount / currentDenomination,
    );
    const countToWithdraw = Math.min(
      availableCount,
      curDenominationCoinsRequired,
    );

    for (let i = countToWithdraw; i >= 0; i--) {
      const result = collect(
        amount - i * currentDenomination,
        denominations.slice(1),
      );

      if (result) {
        return i
          ? [...new Array<Coin>(i).fill(currentDenomination, 0, i), ...result]
          : result;
      }
    }
    return null;
  };

  const denominationsSortedFromBigToSmall = Object.keys(coinsAvailable)
    .sort((coinA, coinB) => parseInt(coinB) - parseInt(coinA))
    .map((coinStr) => parseInt(coinStr) as Coin);

  const result = collect(amount, denominationsSortedFromBigToSmall);
  if (!result) {
    throw new Error('Amount could not be withdrawn, no proper available coins');
  }
  return result;
};
