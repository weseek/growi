import { describe, expect, it } from 'vitest';

import { isCreatablePage } from './index';

describe('isCreatablePage', () => {
  describe('should return true for valid page paths', () => {
    it.each(['/path/to/page'])('should return true for "%s"', (path) => {
      expect(isCreatablePage(path)).toBe(true);
    });
  });
});
