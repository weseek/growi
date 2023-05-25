import { describe, test, expect } from 'vitest';

import { isTopPage } from './is-top-page';

describe('TopPage Path test', () => {
  test.concurrent('Path is only "/"', () => {
    const result = isTopPage('/');
    expect(result).toBe(true);
  });
  test.concurrent('Path is not match string', () => {
    const result = isTopPage('/test');
    expect(result).toBe(false);
  });
  test.concurrent('Path is integer', () => {
    const result = isTopPage(1);
    expect(result).toBe(false);
  });
});
