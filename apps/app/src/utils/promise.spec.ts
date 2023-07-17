import { batchProcessPromiseAll } from './promise';

describe('batchProcessPromiseAll', () => {
  it('processes items in batch', async() => {
    const batch1 = [1, 2, 3, 4, 5];
    const batch2 = [6, 7, 8, 9, 10];
    const batch3 = [11, 12];

    const all = [...batch1, ...batch2, ...batch3];

    const result = await batchProcessPromiseAll(all, 5, async(num) => {
      return num * 10;
    });

    const expected = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120];

    expect(result).toStrictEqual(expected);
  });
});
