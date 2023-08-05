import { Types } from 'mongoose';

import { includesObjectIds } from './compare-objectId';

describe('includesObjectIds', () => {
  const id1 = new Types.ObjectId();
  const id2 = new Types.ObjectId();
  const id3 = new Types.ObjectId();
  const id4 = new Types.ObjectId();

  describe('When subset of array given', () => {
    const arr = [id1, id2, id3, id4];
    const subset = [id1, id4];

    it('returns true', () => {
      expect(includesObjectIds(arr, subset)).toBe(true);
    });
  });

  describe('When set that intersects with array given', () => {
    const arr = [id1, id2, id3];
    const subset = [id1, id4];

    it('returns false', () => {
      expect(includesObjectIds(arr, subset)).toBe(false);
    });
  });
});
