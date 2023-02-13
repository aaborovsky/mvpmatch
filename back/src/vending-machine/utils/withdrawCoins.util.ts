import { Coin } from '../../types';
import { NoCoinsAvailable } from '../errors/no-coins-available.error';
import BigNumber from 'bignumber.js';

/**
 * Exported for tests
 * @param coins
 */
export const getBalance = (coins: Record<Coin, number>): number =>
  Object.entries(coins)
    .reduce(
      (result, [coin, count]) => result.plus((parseInt(coin) * count) / 100),
      new BigNumber(0),
    )
    .toNumber();

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
    throw new NoCoinsAvailable(
      'Not enough coins to withdraw, try to buy later. You may withdraw your deposit with reset right now.',
    );
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
    const curDenominationCoinsRequired = new BigNumber(amount)
      .div(currentDenomination / 100)
      .integerValue(BigNumber.ROUND_DOWN)
      .toNumber();
    const countToWithdraw = Math.min(
      availableCount,
      curDenominationCoinsRequired,
    );

    for (let i = countToWithdraw; i >= 0; i--) {
      const result = collect(
        new BigNumber(amount).minus((i * currentDenomination) / 100).toNumber(),
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
    throw new NoCoinsAvailable(
      'Amount could not be withdrawn, no proper available coins. Try to deposit without change.',
    );
  }
  return result;
};
