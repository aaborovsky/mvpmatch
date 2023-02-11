import { withdrawCoins } from './withdrawCoins.util';
import { Coin } from '../../types';

describe('withdrawCoins', () => {
  it('should return proper values', () => {
    expect(
      withdrawCoins(
        225,
        //balance is 285
        {
          [Coin.FIFTY]: 4,
          [Coin.TWENTY]: 3,
          [Coin.TEN]: 2,
          [Coin.FIVE]: 1,
        },
      ),
    ).toEqual([
      Coin.FIFTY,
      Coin.FIFTY,
      Coin.FIFTY,
      Coin.FIFTY,
      Coin.TWENTY,
      Coin.FIVE,
    ]);
  });

  it('should return proper values for tricky case', () => {
    expect(
      withdrawCoins(
        60,
        //balance is 110
        {
          [Coin.FIFTY]: 1,
          [Coin.TWENTY]: 3,
          [Coin.TEN]: 0,
          [Coin.FIVE]: 0,
        },
      ),
    ).toEqual([Coin.TWENTY, Coin.TWENTY, Coin.TWENTY]);
  });

  it('should return proper values when one higher coin count is not enough', () => {
    expect(
      withdrawCoins(
        225,
        //balance is 285
        {
          [Coin.FIFTY]: 4,
          [Coin.TWENTY]: 0,
          [Coin.TEN]: 2,
          [Coin.FIVE]: 1,
        },
      ),
    ).toEqual([
      Coin.FIFTY,
      Coin.FIFTY,
      Coin.FIFTY,
      Coin.FIFTY,
      Coin.TEN,
      Coin.TEN,
      Coin.FIVE,
    ]);
  });

  it('should throw error, cause amount cannot be withdrawn due to low balance', () => {
    expect(() =>
      withdrawCoins(
        225,
        //balance is 215
        {
          [Coin.FIFTY]: 4,
          [Coin.TWENTY]: 0,
          [Coin.TEN]: 1,
          [Coin.FIVE]: 1,
        },
      ),
    ).toThrowError('Not enough coins to withdraw');
  });

  it('should throw error, cause amount cannot be withdrawn due to now such denominations balance', () => {
    expect(() =>
      withdrawCoins(
        223,
        //balance is 285
        {
          [Coin.FIFTY]: 4,
          [Coin.TWENTY]: 3,
          [Coin.TEN]: 2,
          [Coin.FIVE]: 1,
        },
      ),
    ).toThrowError('Amount could not be withdrawn, no proper available coins');
  });
});
